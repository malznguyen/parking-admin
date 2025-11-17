// lib/stores/vehicle-store.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Vehicle, VehicleType } from '@/types/database';
import { mockVehicles } from '@/lib/mock-data';
import {
  validateVehicleForm,
  hasValidationErrors,
  normalizeLicensePlate,
  ValidationErrors,
} from '@/lib/utils/validation';
import {
  saveToStorage,
  loadFromStorage,
  STORAGE_KEYS,
  createDebouncedSave,
} from '@/lib/utils/storage';
import {
  generateVehicleId,
  getCurrentISOString,
  simulateNetworkDelay,
  getDateMonthsFromNow,
} from '@/lib/utils/generators';
import { useUIStore } from './ui-store';

interface VehicleFilters {
  type: VehicleType | 'all';
  status: 'all' | 'active' | 'expired' | 'inactive';
  department: string | 'all';
}

interface VehicleStore {
  // State
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  selectedVehicle: Vehicle | null;
  searchQuery: string;
  filters: VehicleFilters;

  // Computed Getters
  getFilteredVehicles: () => Vehicle[];
  getActiveVehiclesCount: () => number;
  getExpiredVehiclesCount: () => number;
  getVehicleById: (id: string) => Vehicle | undefined;
  getVehicleByPlate: (plate: string) => Vehicle | undefined;

  // Actions - CRUD
  fetchVehicles: () => Promise<void>;
  addVehicle: (
    vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Vehicle>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  toggleVehicleStatus: (id: string) => Promise<void>;
  extendExpiry: (id: string, months: number) => Promise<void>;

  // Actions - Search & Filter
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<VehicleFilters>) => void;
  resetFilters: () => void;

  // Actions - Selection
  selectVehicle: (id: string) => void;
  deselectVehicle: () => void;

  // Actions - Validation
  checkDuplicatePlate: (licensePlate: string, excludeId?: string) => boolean;
  validateVehicle: (vehicle: Partial<Vehicle>) => ValidationErrors;

  // Actions - Bulk Operations
  bulkUpdateExpiry: (vehicleIds: string[], months: number) => Promise<void>;
  bulkDelete: (vehicleIds: string[]) => Promise<void>;

  // Actions - Persistence
  persistVehicles: () => void;
  loadPersistedVehicles: () => void;
}

const initialFilters: VehicleFilters = {
  type: 'all',
  status: 'all',
  department: 'all',
};

// Debounced save function
const debouncedSave = createDebouncedSave<Vehicle[]>(STORAGE_KEYS.VEHICLES, 500);

export const useVehicleStore = create<VehicleStore>()(
  immer((set, get) => ({
    // Initial State
    vehicles: [],
    isLoading: false,
    error: null,
    selectedVehicle: null,
    searchQuery: '',
    filters: initialFilters,

    // Computed Getters
    getFilteredVehicles: () => {
      const { vehicles, searchQuery, filters } = get();
      let filtered = [...vehicles];

      // Apply search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (v) =>
            v.licensePlate.toLowerCase().includes(query) ||
            v.ownerName.toLowerCase().includes(query) ||
            v.studentId?.toLowerCase().includes(query) ||
            v.staffId?.toLowerCase().includes(query) ||
            v.email?.toLowerCase().includes(query) ||
            v.phoneNumber.includes(query)
        );
      }

      // Apply type filter
      if (filters.type !== 'all') {
        filtered = filtered.filter((v) => v.type === filters.type);
      }

      // Apply status filter
      const now = new Date();
      if (filters.status === 'active') {
        filtered = filtered.filter(
          (v) => v.isActive && new Date(v.expiryDate) > now
        );
      } else if (filters.status === 'expired') {
        filtered = filtered.filter((v) => new Date(v.expiryDate) <= now);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter((v) => !v.isActive);
      }

      // Apply department filter
      if (filters.department !== 'all') {
        filtered = filtered.filter((v) => v.department === filters.department);
      }

      // Sort by updatedAt (desc)
      filtered.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      return filtered;
    },

    getActiveVehiclesCount: () => {
      const { vehicles } = get();
      const now = new Date();
      return vehicles.filter(
        (v) => v.isActive && new Date(v.expiryDate) > now
      ).length;
    },

    getExpiredVehiclesCount: () => {
      const { vehicles } = get();
      const now = new Date();
      return vehicles.filter((v) => new Date(v.expiryDate) <= now).length;
    },

    getVehicleById: (id) => {
      return get().vehicles.find((v) => v.id === id);
    },

    getVehicleByPlate: (plate) => {
      const normalized = normalizeLicensePlate(plate);
      return get().vehicles.find(
        (v) => normalizeLicensePlate(v.licensePlate) === normalized
      );
    },

    // CRUD Actions
    fetchVehicles: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await simulateNetworkDelay(300, 600);

        // Load from localStorage first, fallback to mock data
        const persisted = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, []);

        if (persisted.length > 0) {
          set((state) => {
            state.vehicles = persisted;
            state.isLoading = false;
          });
        } else {
          // Initialize with mock data
          set((state) => {
            state.vehicles = mockVehicles;
            state.isLoading = false;
          });
          // Persist initial data
          get().persistVehicles();
        }
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Failed to fetch vehicles';
          state.isLoading = false;
        });
        useUIStore.getState().showError('Không thể tải danh sách xe');
      }
    },

    addVehicle: async (vehicleData) => {
      const { showSuccess, showError } = useUIStore.getState();

      // Validate
      const errors = get().validateVehicle(vehicleData);
      if (hasValidationErrors(errors)) {
        const firstError = Object.values(errors)[0];
        showError(firstError);
        throw new Error(firstError);
      }

      // Check duplicate
      if (get().checkDuplicatePlate(vehicleData.licensePlate)) {
        showError('Biển số xe đã tồn tại trong hệ thống');
        throw new Error('Biển số xe đã tồn tại trong hệ thống');
      }

      await simulateNetworkDelay(300, 500);

      const now = getCurrentISOString();
      const newVehicle: Vehicle = {
        ...vehicleData,
        id: generateVehicleId(
          vehicleData.type,
          get().vehicles.map((v) => v.id)
        ),
        licensePlate: normalizeLicensePlate(vehicleData.licensePlate),
        createdAt: now,
        updatedAt: now,
      };

      set((state) => {
        state.vehicles.push(newVehicle);
      });

      get().persistVehicles();
      showSuccess(`Đăng ký xe ${newVehicle.licensePlate} thành công!`);

      return newVehicle;
    },

    updateVehicle: async (id, updates) => {
      const { showSuccess, showError } = useUIStore.getState();

      const vehicle = get().getVehicleById(id);
      if (!vehicle) {
        showError('Không tìm thấy xe trong hệ thống');
        throw new Error('Không tìm thấy xe trong hệ thống');
      }

      // Validate if updating license plate
      if (updates.licensePlate) {
        const errors = get().validateVehicle({ ...vehicle, ...updates });
        if (hasValidationErrors(errors)) {
          const firstError = Object.values(errors)[0];
          showError(firstError);
          throw new Error(firstError);
        }

        // Check duplicate (excluding current vehicle)
        if (get().checkDuplicatePlate(updates.licensePlate, id)) {
          showError('Biển số xe đã tồn tại trong hệ thống');
          throw new Error('Biển số xe đã tồn tại trong hệ thống');
        }
      }

      await simulateNetworkDelay(200, 400);

      set((state) => {
        const index = state.vehicles.findIndex((v) => v.id === id);
        if (index !== -1) {
          state.vehicles[index] = {
            ...state.vehicles[index],
            ...updates,
            updatedAt: getCurrentISOString(),
          };

          // Update selected vehicle if it's the one being updated
          if (state.selectedVehicle?.id === id) {
            state.selectedVehicle = state.vehicles[index];
          }
        }
      });

      get().persistVehicles();
      showSuccess('Cập nhật thông tin xe thành công!');
    },

    deleteVehicle: async (id) => {
      const { showSuccess, showError, showConfirmDialog } = useUIStore.getState();

      const vehicle = get().getVehicleById(id);
      if (!vehicle) {
        showError('Không tìm thấy xe trong hệ thống');
        throw new Error('Không tìm thấy xe trong hệ thống');
      }

      await simulateNetworkDelay(200, 400);

      // Soft delete (set isActive = false)
      set((state) => {
        const index = state.vehicles.findIndex((v) => v.id === id);
        if (index !== -1) {
          state.vehicles[index].isActive = false;
          state.vehicles[index].updatedAt = getCurrentISOString();
        }

        // Deselect if deleted
        if (state.selectedVehicle?.id === id) {
          state.selectedVehicle = null;
        }
      });

      get().persistVehicles();
      showSuccess(`Đã vô hiệu hóa xe ${vehicle.licensePlate}`);
    },

    toggleVehicleStatus: async (id) => {
      const { showSuccess, showError } = useUIStore.getState();

      const vehicle = get().getVehicleById(id);
      if (!vehicle) {
        showError('Không tìm thấy xe trong hệ thống');
        throw new Error('Không tìm thấy xe trong hệ thống');
      }

      await simulateNetworkDelay(200, 400);

      set((state) => {
        const index = state.vehicles.findIndex((v) => v.id === id);
        if (index !== -1) {
          state.vehicles[index].isActive = !state.vehicles[index].isActive;
          state.vehicles[index].updatedAt = getCurrentISOString();
        }
      });

      get().persistVehicles();

      const newStatus = !vehicle.isActive;
      showSuccess(
        newStatus
          ? `Đã kích hoạt xe ${vehicle.licensePlate}`
          : `Đã vô hiệu hóa xe ${vehicle.licensePlate}`
      );
    },

    extendExpiry: async (id, months) => {
      const { showSuccess, showError } = useUIStore.getState();

      const vehicle = get().getVehicleById(id);
      if (!vehicle) {
        showError('Không tìm thấy xe trong hệ thống');
        throw new Error('Không tìm thấy xe trong hệ thống');
      }

      await simulateNetworkDelay(200, 400);

      const currentExpiry = new Date(vehicle.expiryDate);
      const now = new Date();

      // If expired, extend from now; otherwise extend from current expiry
      const baseDate = currentExpiry > now ? currentExpiry : now;
      baseDate.setMonth(baseDate.getMonth() + months);

      set((state) => {
        const index = state.vehicles.findIndex((v) => v.id === id);
        if (index !== -1) {
          state.vehicles[index].expiryDate = baseDate.toISOString();
          state.vehicles[index].updatedAt = getCurrentISOString();
        }
      });

      get().persistVehicles();
      showSuccess(`Đã gia hạn xe ${vehicle.licensePlate} thêm ${months} tháng`);
    },

    // Search & Filter Actions
    setSearchQuery: (query) => {
      set((state) => {
        state.searchQuery = query;
      });
    },

    setFilters: (newFilters) => {
      set((state) => {
        state.filters = { ...state.filters, ...newFilters };
      });
    },

    resetFilters: () => {
      set((state) => {
        state.filters = initialFilters;
        state.searchQuery = '';
      });
    },

    // Selection Actions
    selectVehicle: (id) => {
      const vehicle = get().getVehicleById(id);
      set((state) => {
        state.selectedVehicle = vehicle || null;
      });
    },

    deselectVehicle: () => {
      set((state) => {
        state.selectedVehicle = null;
      });
    },

    // Validation Actions
    checkDuplicatePlate: (licensePlate, excludeId) => {
      const normalized = normalizeLicensePlate(licensePlate);
      return get().vehicles.some(
        (v) =>
          normalizeLicensePlate(v.licensePlate) === normalized &&
          v.id !== excludeId
      );
    },

    validateVehicle: (vehicle) => {
      return validateVehicleForm(vehicle);
    },

    // Bulk Operations
    bulkUpdateExpiry: async (vehicleIds, months) => {
      const { showSuccess, showError } = useUIStore.getState();

      await simulateNetworkDelay(500, 800);

      let updatedCount = 0;

      set((state) => {
        vehicleIds.forEach((id) => {
          const index = state.vehicles.findIndex((v) => v.id === id);
          if (index !== -1) {
            const vehicle = state.vehicles[index];
            const currentExpiry = new Date(vehicle.expiryDate);
            const now = new Date();
            const baseDate = currentExpiry > now ? currentExpiry : now;
            baseDate.setMonth(baseDate.getMonth() + months);

            state.vehicles[index].expiryDate = baseDate.toISOString();
            state.vehicles[index].updatedAt = getCurrentISOString();
            updatedCount++;
          }
        });
      });

      get().persistVehicles();
      showSuccess(`Đã gia hạn ${updatedCount} xe thêm ${months} tháng`);
    },

    bulkDelete: async (vehicleIds) => {
      const { showSuccess } = useUIStore.getState();

      await simulateNetworkDelay(500, 800);

      let deletedCount = 0;

      set((state) => {
        vehicleIds.forEach((id) => {
          const index = state.vehicles.findIndex((v) => v.id === id);
          if (index !== -1) {
            state.vehicles[index].isActive = false;
            state.vehicles[index].updatedAt = getCurrentISOString();
            deletedCount++;
          }
        });

        // Deselect if deleted
        if (
          state.selectedVehicle &&
          vehicleIds.includes(state.selectedVehicle.id)
        ) {
          state.selectedVehicle = null;
        }
      });

      get().persistVehicles();
      showSuccess(`Đã vô hiệu hóa ${deletedCount} xe`);
    },

    // Persistence Actions
    persistVehicles: () => {
      debouncedSave(get().vehicles);
    },

    loadPersistedVehicles: () => {
      const persisted = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, []);
      if (persisted.length > 0) {
        set((state) => {
          state.vehicles = persisted;
        });
      }
    },
  }))
);
