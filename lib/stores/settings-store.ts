// lib/stores/settings-store.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { PARKING_CONFIG, DEPARTMENTS } from '@/lib/constants';
import {
  saveToStorage,
  loadFromStorage,
  STORAGE_KEYS,
  createBackup,
  getLatestBackup,
  getAllBackups,
  formatBytes,
  getStorageInfo,
  BackupData,
} from '@/lib/utils/storage';
import {
  simulateNetworkDelay,
  getCurrentISOString,
  formatDateTimeDisplay,
} from '@/lib/utils/generators';
import { useUIStore } from './ui-store';
import { useVehicleStore } from './vehicle-store';
import { useSessionStore } from './session-store';
import { useExceptionStore } from './exception-store';

type Gate = 'A' | 'B' | 'C' | 'D';

interface GateSettings {
  id: Gate;
  name: string;
  isEnabled: boolean;
  cameraStatus: 'operational' | 'degraded' | 'offline';
  barrierStatus: 'operational' | 'stuck_open' | 'stuck_closed' | 'offline';
  lastMaintenance: string;
}

interface SystemSettings {
  general: {
    schoolName: string;
    address: string;
    phone: string;
    email: string;
    totalSpots: number;
    businessHours: {
      open: string;
      close: string;
    };
  };
  pricing: {
    firstHour: number;
    additionalHour: number;
    overnight: number;
    monthlyStudent: number;
    monthlyStaff: number;
  };
  gates: GateSettings[];
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    exceptionThreshold: number;
    lowBalanceAlert: number;
    capacityWarning: number;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    ipWhitelist: string[];
    autoLogout: boolean;
  };
  backup: {
    frequency: 'daily' | 'weekly' | 'monthly';
    lastBackup: string;
    autoBackup: boolean;
    retentionDays: number;
  };
}

interface SystemInfo {
  version: string;
  uptime: string;
  dbSize: string;
  totalVehicles: number;
  totalSessions: number;
  totalExceptions: number;
  lastSync: string;
}

interface SettingsStore {
  // State
  settings: SystemSettings;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;

  // Computed
  getSystemInfo: () => SystemInfo;
  getBackupHistory: () => BackupData[];

  // Actions - Settings CRUD
  fetchSettings: () => Promise<void>;
  updateSettings: <K extends keyof SystemSettings>(
    section: K,
    data: Partial<SystemSettings[K]>
  ) => Promise<void>;
  resetSettings: (section: keyof SystemSettings) => Promise<void>;
  resetAllSettings: () => Promise<void>;

  // Actions - Gate Management
  toggleGate: (gateId: Gate, enabled: boolean) => Promise<void>;
  updateGateStatus: (
    gateId: Gate,
    status: Partial<GateSettings>
  ) => Promise<void>;

  // Actions - Backup & Restore
  createBackup: () => Promise<void>;
  downloadBackup: () => Promise<void>;
  restoreBackup: (backupData: BackupData) => Promise<void>;
  deleteBackup: (timestamp: string) => Promise<void>;

  // Actions - System
  getSystemStatus: () => {
    healthy: boolean;
    issues: string[];
  };
  clearAllData: () => Promise<void>;
  exportAllData: () => Promise<void>;

  // Persistence
  persistSettings: () => void;
}

const defaultSettings: SystemSettings = {
  general: {
    schoolName: 'Đại học Công nghiệp Hà Nội',
    address: 'Số 298 Đường Cầu Diễn, Bắc Từ Liêm, Hà Nội',
    phone: '024 3765 5121',
    email: 'parking@haui.edu.vn',
    totalSpots: PARKING_CONFIG.TOTAL_SPOTS,
    businessHours: {
      open: PARKING_CONFIG.BUSINESS_HOURS.OPEN,
      close: PARKING_CONFIG.BUSINESS_HOURS.CLOSE,
    },
  },
  pricing: {
    firstHour: PARKING_CONFIG.PRICING.FIRST_HOUR,
    additionalHour: PARKING_CONFIG.PRICING.ADDITIONAL_HOUR,
    overnight: PARKING_CONFIG.PRICING.OVERNIGHT,
    monthlyStudent: PARKING_CONFIG.PRICING.MONTHLY_STUDENT,
    monthlyStaff: PARKING_CONFIG.PRICING.MONTHLY_STAFF,
  },
  gates: [
    {
      id: 'A',
      name: 'Cổng A - Chính',
      isEnabled: true,
      cameraStatus: 'operational',
      barrierStatus: 'operational',
      lastMaintenance: '2025-11-01T08:00:00.000Z',
    },
    {
      id: 'B',
      name: 'Cổng B - Phụ',
      isEnabled: true,
      cameraStatus: 'operational',
      barrierStatus: 'operational',
      lastMaintenance: '2025-11-01T08:00:00.000Z',
    },
    {
      id: 'C',
      name: 'Cổng C - KTX',
      isEnabled: true,
      cameraStatus: 'degraded',
      barrierStatus: 'operational',
      lastMaintenance: '2025-10-15T08:00:00.000Z',
    },
    {
      id: 'D',
      name: 'Cổng D - Sau',
      isEnabled: false,
      cameraStatus: 'offline',
      barrierStatus: 'offline',
      lastMaintenance: '2025-09-01T08:00:00.000Z',
    },
  ],
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    exceptionThreshold: 10,
    lowBalanceAlert: 50000,
    capacityWarning: 90,
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    ipWhitelist: [],
    autoLogout: true,
  },
  backup: {
    frequency: 'daily',
    lastBackup: getCurrentISOString(),
    autoBackup: true,
    retentionDays: 30,
  },
};

// Debounced save timer
let saveTimer: NodeJS.Timeout | null = null;

export const useSettingsStore = create<SettingsStore>()(
  immer((set, get) => ({
    // Initial State
    settings: defaultSettings,
    isLoading: false,
    isSaving: false,
    hasUnsavedChanges: false,
    error: null,

    // Computed Getters
    getSystemInfo: () => {
      const vehicles = useVehicleStore.getState().vehicles;
      const sessions = useSessionStore.getState().sessions;
      const exceptions = useExceptionStore.getState().exceptions;
      const storageInfo = getStorageInfo();

      return {
        version: '1.0.0-beta',
        uptime: '45 ngày 12:34:56',
        dbSize: formatBytes(storageInfo.used),
        totalVehicles: vehicles.length,
        totalSessions: sessions.length,
        totalExceptions: exceptions.length,
        lastSync: formatDateTimeDisplay(getCurrentISOString()),
      };
    },

    getBackupHistory: () => {
      return getAllBackups();
    },

    // Settings CRUD
    fetchSettings: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await simulateNetworkDelay(200, 400);

        const persisted = loadFromStorage<SystemSettings>(
          STORAGE_KEYS.SETTINGS,
          defaultSettings
        );

        set((state) => {
          state.settings = { ...defaultSettings, ...persisted };
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Failed to load settings';
          state.isLoading = false;
        });
        useUIStore.getState().showError('Không thể tải cài đặt hệ thống');
      }
    },

    updateSettings: async (section, data) => {
      const { showSuccess, showError } = useUIStore.getState();

      set((state) => {
        state.hasUnsavedChanges = true;
      });

      // Validate specific settings
      if (section === 'general' && 'totalSpots' in data) {
        const totalSpots = (data as Partial<SystemSettings['general']>).totalSpots;
        if (totalSpots !== undefined && totalSpots < 1) {
          showError('Số chỗ đỗ phải lớn hơn 0');
          throw new Error('Invalid total spots');
        }
      }

      if (section === 'pricing') {
        const pricingData = data as Partial<SystemSettings['pricing']>;
        for (const [key, value] of Object.entries(pricingData)) {
          if (value !== undefined && value < 0) {
            showError('Giá không được âm');
            throw new Error('Invalid pricing');
          }
        }
      }

      set((state) => {
        // Type-safe merge for each section
        const currentSection = state.settings[section];
        Object.assign(currentSection, data);
      });

      // Debounced auto-save
      if (saveTimer) {
        clearTimeout(saveTimer);
      }

      saveTimer = setTimeout(async () => {
        set((state) => {
          state.isSaving = true;
        });

        await simulateNetworkDelay(300, 500);

        get().persistSettings();

        set((state) => {
          state.isSaving = false;
          state.hasUnsavedChanges = false;
        });

        showSuccess('Cài đặt đã được lưu');
      }, 2000);
    },

    resetSettings: async (section) => {
      const { showSuccess } = useUIStore.getState();

      await simulateNetworkDelay(200, 400);

      set((state) => {
        // Type-safe reset for each section
        const defaultValue = defaultSettings[section];
        Object.assign(state.settings[section], defaultValue);
      });

      get().persistSettings();
      showSuccess(`Đã khôi phục cài đặt ${section} về mặc định`);
    },

    resetAllSettings: async () => {
      const { showSuccess } = useUIStore.getState();

      await simulateNetworkDelay(300, 500);

      set((state) => {
        state.settings = defaultSettings;
      });

      get().persistSettings();
      showSuccess('Đã khôi phục tất cả cài đặt về mặc định');
    },

    // Gate Management
    toggleGate: async (gateId, enabled) => {
      const { showSuccess, showWarning } = useUIStore.getState();

      await simulateNetworkDelay(200, 400);

      set((state) => {
        const gateIndex = state.settings.gates.findIndex((g) => g.id === gateId);
        if (gateIndex !== -1) {
          state.settings.gates[gateIndex].isEnabled = enabled;

          if (!enabled) {
            state.settings.gates[gateIndex].cameraStatus = 'offline';
            state.settings.gates[gateIndex].barrierStatus = 'offline';
          }
        }
      });

      get().persistSettings();

      if (enabled) {
        showSuccess(`Đã kích hoạt cổng ${gateId}`);
      } else {
        showWarning(`Đã vô hiệu hóa cổng ${gateId}`);
      }
    },

    updateGateStatus: async (gateId, status) => {
      const { showSuccess } = useUIStore.getState();

      await simulateNetworkDelay(200, 400);

      set((state) => {
        const gateIndex = state.settings.gates.findIndex((g) => g.id === gateId);
        if (gateIndex !== -1) {
          state.settings.gates[gateIndex] = {
            ...state.settings.gates[gateIndex],
            ...status,
          };
        }
      });

      get().persistSettings();
      showSuccess(`Đã cập nhật trạng thái cổng ${gateId}`);
    },

    // Backup & Restore
    createBackup: async () => {
      const { showSuccess, showError } = useUIStore.getState();

      set((state) => {
        state.isSaving = true;
      });

      try {
        await simulateNetworkDelay(500, 800);

        const vehicles = useVehicleStore.getState().vehicles;
        const sessions = useSessionStore.getState().sessions;
        const exceptions = useExceptionStore.getState().exceptions;
        const settings = get().settings;

        const backup = createBackup({
          vehicles,
          sessions,
          exceptions,
          settings,
        });

        set((state) => {
          state.settings.backup.lastBackup = backup.timestamp;
          state.isSaving = false;
        });

        get().persistSettings();
        showSuccess(
          `Đã tạo bản sao lưu lúc ${formatDateTimeDisplay(backup.timestamp)}`
        );
      } catch (error) {
        set((state) => {
          state.isSaving = false;
        });
        showError('Không thể tạo bản sao lưu');
        throw error;
      }
    },

    downloadBackup: async () => {
      const { showSuccess, showError } = useUIStore.getState();

      try {
        const backup = getLatestBackup();
        if (!backup) {
          showError('Không có bản sao lưu nào');
          throw new Error('No backup available');
        }

        const blob = new Blob([JSON.stringify(backup, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);

        const timestamp = new Date(backup.timestamp);
        const filename = `haui-parking-backup-${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(timestamp.getDate()).padStart(2, '0')}-${String(timestamp.getHours()).padStart(2, '0')}${String(timestamp.getMinutes()).padStart(2, '0')}.json`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showSuccess(`Đã tải xuống ${filename}`);
      } catch (error) {
        if (error instanceof Error && error.message !== 'No backup available') {
          showError('Không thể tải xuống bản sao lưu');
        }
        throw error;
      }
    },

    restoreBackup: async (backupData) => {
      const { showSuccess, showError, showWarning } = useUIStore.getState();

      showWarning('Đang khôi phục dữ liệu... Không đóng trình duyệt!');

      set((state) => {
        state.isSaving = true;
      });

      try {
        await simulateNetworkDelay(800, 1200);

        // Validate backup structure
        if (
          !backupData.data ||
          !backupData.data.vehicles ||
          !backupData.data.sessions ||
          !backupData.data.exceptions
        ) {
          throw new Error('Invalid backup structure');
        }

        // Restore data
        saveToStorage(STORAGE_KEYS.VEHICLES, backupData.data.vehicles);
        saveToStorage(STORAGE_KEYS.SESSIONS, backupData.data.sessions);
        saveToStorage(STORAGE_KEYS.EXCEPTIONS, backupData.data.exceptions);

        if (backupData.data.settings) {
          set((state) => {
            state.settings = backupData.data.settings;
          });
          get().persistSettings();
        }

        set((state) => {
          state.isSaving = false;
        });

        showSuccess(
          `Đã khôi phục dữ liệu từ ${formatDateTimeDisplay(backupData.timestamp)}`
        );

        // Reload stores
        await useVehicleStore.getState().fetchVehicles();
        await useSessionStore.getState().fetchSessions();
        await useExceptionStore.getState().fetchExceptions();
      } catch (error) {
        set((state) => {
          state.isSaving = false;
        });
        showError('Không thể khôi phục dữ liệu');
        throw error;
      }
    },

    deleteBackup: async (timestamp) => {
      const { showSuccess } = useUIStore.getState();

      const backups = getAllBackups();
      const filtered = backups.filter((b) => b.timestamp !== timestamp);
      saveToStorage(STORAGE_KEYS.BACKUPS, filtered);

      showSuccess('Đã xóa bản sao lưu');
    },

    // System Actions
    getSystemStatus: () => {
      const { settings } = get();
      const issues: string[] = [];

      // Check gates
      const offlineGates = settings.gates.filter(
        (g) => g.isEnabled && g.cameraStatus === 'offline'
      );
      if (offlineGates.length > 0) {
        issues.push(
          `${offlineGates.length} cổng đang offline: ${offlineGates.map((g) => g.id).join(', ')}`
        );
      }

      // Check degraded cameras
      const degradedCameras = settings.gates.filter(
        (g) => g.isEnabled && g.cameraStatus === 'degraded'
      );
      if (degradedCameras.length > 0) {
        issues.push(
          `${degradedCameras.length} camera bị suy giảm: ${degradedCameras.map((g) => g.id).join(', ')}`
        );
      }

      // Check stuck barriers
      const stuckBarriers = settings.gates.filter(
        (g) =>
          g.isEnabled &&
          (g.barrierStatus === 'stuck_open' || g.barrierStatus === 'stuck_closed')
      );
      if (stuckBarriers.length > 0) {
        issues.push(
          `${stuckBarriers.length} rào chắn bị kẹt: ${stuckBarriers.map((g) => g.id).join(', ')}`
        );
      }

      // Check storage
      const storageInfo = getStorageInfo();
      if (storageInfo.percentage > 80) {
        issues.push(`Bộ nhớ sắp đầy: ${storageInfo.percentage.toFixed(1)}%`);
      }

      return {
        healthy: issues.length === 0,
        issues,
      };
    },

    clearAllData: async () => {
      const { showSuccess, showWarning } = useUIStore.getState();

      showWarning('Đang xóa tất cả dữ liệu...');

      await simulateNetworkDelay(500, 800);

      // Clear all localStorage
      localStorage.removeItem(STORAGE_KEYS.VEHICLES);
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.EXCEPTIONS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.STATS);

      showSuccess('Đã xóa tất cả dữ liệu. Trang sẽ được tải lại.');

      // Reload page
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },

    exportAllData: async () => {
      const { showSuccess, showError } = useUIStore.getState();

      try {
        const vehicles = useVehicleStore.getState().vehicles;
        const sessions = useSessionStore.getState().sessions;
        const exceptions = useExceptionStore.getState().exceptions;
        const settings = get().settings;

        const exportData = {
          exportDate: getCurrentISOString(),
          version: '1.0.0',
          data: {
            vehicles,
            sessions,
            exceptions,
            settings,
          },
          summary: {
            totalVehicles: vehicles.length,
            totalSessions: sessions.length,
            totalExceptions: exceptions.length,
          },
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);

        const now = new Date();
        const filename = `haui-parking-export-${now.toISOString().slice(0, 10)}.json`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showSuccess('Đã xuất toàn bộ dữ liệu hệ thống');
      } catch (error) {
        showError('Không thể xuất dữ liệu');
        throw error;
      }
    },

    // Persistence
    persistSettings: () => {
      saveToStorage(STORAGE_KEYS.SETTINGS, get().settings);
    },
  }))
);
