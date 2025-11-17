// lib/stores/exception-store.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { LPRException, ParkingSession } from '@/types/database';
import { mockExceptions } from '@/lib/mock-data';
import {
  saveToStorage,
  loadFromStorage,
  STORAGE_KEYS,
  createDebouncedSave,
} from '@/lib/utils/storage';
import {
  generateExceptionId,
  getCurrentISOString,
  simulateNetworkDelay,
} from '@/lib/utils/generators';
import {
  validateLicensePlate,
  normalizeLicensePlate,
  levenshteinDistance,
} from '@/lib/utils/validation';
import { useUIStore } from './ui-store';
import { useVehicleStore } from './vehicle-store';
import { useSessionStore } from './session-store';

type Gate = 'A' | 'B' | 'C' | 'D';
type ExceptionPriority = 'low' | 'medium' | 'high' | 'urgent';
type ExceptionErrorType = LPRException['errorType'];
type ResolutionMethod = LPRException['resolutionMethod'];

interface SimilarPlate {
  plate: string;
  ownerName?: string;
  vehicleType?: string;
  distance: number;
  confidence: number;
}

interface ExceptionStore {
  // State
  exceptions: LPRException[];
  isLoading: boolean;
  error: string | null;
  selectedException: LPRException | null;

  // Filters
  priorityFilter: ExceptionPriority | 'all';
  gateFilter: Gate | 'all';
  statusFilter: LPRException['status'] | 'all';

  // Real-time simulation
  simulationIntervalId: number | null;

  // Computed Getters
  getPendingExceptions: () => LPRException[];
  getResolvedExceptions: () => LPRException[];
  getEscalatedExceptions: () => LPRException[];
  getQueueCount: () => number;
  getUrgentCount: () => number;
  getExceptionById: (id: string) => LPRException | undefined;

  // Actions - Queue Management
  fetchExceptions: () => Promise<void>;
  createException: (data: {
    licensePlate?: string;
    confidence: number;
    gate: Gate;
    direction: 'entry' | 'exit';
    image: string;
    errorType: ExceptionErrorType;
  }) => Promise<LPRException>;

  assignException: (exceptionId: string, operatorId: string) => Promise<void>;

  resolveException: (
    exceptionId: string,
    data: {
      resolvedPlate: string;
      method: ResolutionMethod;
      notes?: string;
      action: 'allow' | 'deny';
    }
  ) => Promise<void>;

  escalateException: (exceptionId: string, reason: string) => Promise<void>;

  // Actions - Suggestions
  getSimilarPlates: (partialPlate: string) => SimilarPlate[];
  getPlateHistory: (licensePlate: string) => ParkingSession[];

  // Actions - Selection
  selectException: (id: string) => void;
  deselectException: () => void;

  // Actions - Priority
  updatePriority: (
    exceptionId: string,
    priority: ExceptionPriority
  ) => Promise<void>;

  // Actions - Filters
  setPriorityFilter: (priority: ExceptionPriority | 'all') => void;
  setGateFilter: (gate: Gate | 'all') => void;
  setStatusFilter: (status: LPRException['status'] | 'all') => void;
  resetFilters: () => void;

  // Actions - Real-time
  startExceptionSimulation: () => void;
  stopExceptionSimulation: () => void;

  // Actions - Persistence
  persistExceptions: () => void;
  loadPersistedExceptions: () => void;
}

const debouncedSave = createDebouncedSave<LPRException[]>(
  STORAGE_KEYS.EXCEPTIONS,
  500
);

// Priority order for sorting
const priorityOrder: Record<ExceptionPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const useExceptionStore = create<ExceptionStore>()(
  immer((set, get) => ({
    // Initial State
    exceptions: [],
    isLoading: false,
    error: null,
    selectedException: null,
    priorityFilter: 'all',
    gateFilter: 'all',
    statusFilter: 'all',
    simulationIntervalId: null,

    // Computed Getters
    getPendingExceptions: () => {
      const { exceptions, priorityFilter, gateFilter } = get();

      let pending = exceptions.filter((e) => e.status === 'pending');

      // Apply filters
      if (priorityFilter !== 'all') {
        pending = pending.filter((e) => e.priority === priorityFilter);
      }
      if (gateFilter !== 'all') {
        pending = pending.filter((e) => e.gate === gateFilter);
      }

      // Sort by priority (urgent first) then by timestamp (older first)
      pending.sort((a, b) => {
        const priorityDiff =
          priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return (
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });

      // Assign queue positions
      return pending.map((e, index) => ({
        ...e,
        queuePosition: index + 1,
      }));
    },

    getResolvedExceptions: () => {
      return get()
        .exceptions.filter((e) => e.status === 'resolved')
        .sort(
          (a, b) =>
            new Date(b.resolvedAt!).getTime() -
            new Date(a.resolvedAt!).getTime()
        );
    },

    getEscalatedExceptions: () => {
      return get()
        .exceptions.filter((e) => e.status === 'escalated')
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    },

    getQueueCount: () => {
      return get().exceptions.filter((e) => e.status === 'pending').length;
    },

    getUrgentCount: () => {
      return get().exceptions.filter(
        (e) => e.status === 'pending' && e.priority === 'urgent'
      ).length;
    },

    getExceptionById: (id) => {
      return get().exceptions.find((e) => e.id === id);
    },

    // Queue Management Actions
    fetchExceptions: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await simulateNetworkDelay(300, 600);

        const persisted = loadFromStorage<LPRException[]>(
          STORAGE_KEYS.EXCEPTIONS,
          []
        );

        if (persisted.length > 0) {
          set((state) => {
            state.exceptions = persisted;
            state.isLoading = false;
          });
        } else {
          set((state) => {
            state.exceptions = mockExceptions;
            state.isLoading = false;
          });
          get().persistExceptions();
        }
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to fetch exceptions';
          state.isLoading = false;
        });
        useUIStore.getState().showError('Không thể tải danh sách ngoại lệ');
      }
    },

    createException: async (data) => {
      const { showWarning, showInfo } = useUIStore.getState();

      await simulateNetworkDelay(200, 400);

      // Determine priority based on confidence and error type
      let priority: ExceptionPriority;
      if (data.confidence < 20 || data.errorType === 'system_error') {
        priority = 'urgent';
      } else if (data.errorType === 'no_detection' || !data.licensePlate) {
        priority = 'high';
      } else if (data.confidence < 60) {
        priority = 'medium';
      } else {
        priority = 'low';
      }

      const newException: LPRException = {
        id: generateExceptionId(),
        timestamp: getCurrentISOString(),
        gate: data.gate,
        direction: data.direction,
        rawImage: data.image,
        detectedPlate: data.licensePlate,
        confidence: data.confidence,
        errorType: data.errorType,
        status: 'pending',
        priority,
      };

      set((state) => {
        state.exceptions.unshift(newException);
      });

      get().persistExceptions();

      // Show notification based on priority
      if (priority === 'urgent') {
        showWarning(
          `Ngoại lệ KHẨN CẤP tại cổng ${data.gate} - Cần xử lý ngay!`
        );
      } else {
        showInfo(`Ngoại lệ mới tại cổng ${data.gate} - Độ tin cậy: ${data.confidence}%`);
      }

      return newException;
    },

    assignException: async (exceptionId, operatorId) => {
      const { showSuccess, showError } = useUIStore.getState();

      const exception = get().getExceptionById(exceptionId);
      if (!exception) {
        showError('Không tìm thấy ngoại lệ');
        throw new Error('Không tìm thấy ngoại lệ');
      }

      await simulateNetworkDelay(200, 400);

      set((state) => {
        const index = state.exceptions.findIndex((e) => e.id === exceptionId);
        if (index !== -1) {
          state.exceptions[index].resolvedBy = operatorId;
        }
      });

      get().persistExceptions();
      showSuccess(`Đã gán ngoại lệ cho ${operatorId}`);
    },

    resolveException: async (exceptionId, data) => {
      const { showSuccess, showError } = useUIStore.getState();

      const exception = get().getExceptionById(exceptionId);
      if (!exception) {
        showError('Không tìm thấy ngoại lệ');
        throw new Error('Không tìm thấy ngoại lệ');
      }

      if (exception.status !== 'pending') {
        showError('Ngoại lệ này đã được xử lý');
        throw new Error('Ngoại lệ này đã được xử lý');
      }

      // Validate resolved plate
      const plateValidation = validateLicensePlate(data.resolvedPlate);
      if (!plateValidation.isValid) {
        showError(plateValidation.error || 'Biển số không hợp lệ');
        throw new Error(plateValidation.error || 'Biển số không hợp lệ');
      }

      await simulateNetworkDelay(300, 500);

      const now = getCurrentISOString();

      set((state) => {
        const index = state.exceptions.findIndex((e) => e.id === exceptionId);
        if (index !== -1) {
          state.exceptions[index] = {
            ...state.exceptions[index],
            status: 'resolved',
            resolvedPlate: normalizeLicensePlate(data.resolvedPlate),
            resolvedBy: state.exceptions[index].resolvedBy || 'operator_1',
            resolvedAt: now,
            resolutionMethod: data.method,
            resolutionNotes: data.notes,
          };

          // Update selected exception
          if (state.selectedException?.id === exceptionId) {
            state.selectedException = state.exceptions[index];
          }
        }
      });

      get().persistExceptions();

      // Handle action
      if (data.action === 'allow') {
        // Create parking session
        const sessionStore = useSessionStore.getState();
        if (exception.direction === 'entry') {
          await sessionStore.createEntrySession({
            licensePlate: data.resolvedPlate,
            gate: exception.gate,
            confidence: 'high',
          });
        } else {
          // For exit, find active session and complete it
          const activeSessions = sessionStore
            .getSessionsByPlate(data.resolvedPlate)
            .filter((s) => !s.exitTime);
          if (activeSessions.length > 0) {
            await sessionStore.completeExitSession(activeSessions[0].id, {
              exitGate: exception.gate,
              confidence: 'high',
            });
          }
        }
        showSuccess(
          `Đã xử lý ngoại lệ và mở rào chắn cho xe ${data.resolvedPlate}`
        );
      } else {
        showSuccess(`Đã từ chối xe ${data.resolvedPlate}`);
      }
    },

    escalateException: async (exceptionId, reason) => {
      const { showWarning, showError } = useUIStore.getState();

      const exception = get().getExceptionById(exceptionId);
      if (!exception) {
        showError('Không tìm thấy ngoại lệ');
        throw new Error('Không tìm thấy ngoại lệ');
      }

      await simulateNetworkDelay(200, 400);

      set((state) => {
        const index = state.exceptions.findIndex((e) => e.id === exceptionId);
        if (index !== -1) {
          state.exceptions[index].status = 'escalated';
          state.exceptions[index].resolutionNotes = reason;
        }
      });

      get().persistExceptions();
      showWarning(`Đã chuyển ngoại lệ ${exceptionId} lên cấp cao hơn`);
    },

    // Suggestion Actions
    getSimilarPlates: (partialPlate) => {
      if (!partialPlate || partialPlate.length < 3) return [];

      const vehicles = useVehicleStore.getState().vehicles;
      const cleaned = normalizeLicensePlate(partialPlate);

      const suggestions: SimilarPlate[] = [];

      for (const vehicle of vehicles) {
        const vehiclePlate = normalizeLicensePlate(vehicle.licensePlate);
        const distance = levenshteinDistance(cleaned, vehiclePlate);

        if (distance <= 3) {
          // Max 3 character differences
          const confidence = Math.max(
            0,
            Math.round((1 - distance / Math.max(cleaned.length, vehiclePlate.length)) * 100)
          );

          suggestions.push({
            plate: vehicle.licensePlate,
            ownerName: vehicle.ownerName,
            vehicleType: vehicle.type,
            distance,
            confidence,
          });
        }
      }

      // Sort by distance (closest first), then by confidence
      suggestions.sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        return b.confidence - a.confidence;
      });

      return suggestions.slice(0, 5); // Return top 5
    },

    getPlateHistory: (licensePlate) => {
      return useSessionStore.getState().getSessionsByPlate(licensePlate);
    },

    // Selection Actions
    selectException: (id) => {
      const exception = get().getExceptionById(id);
      set((state) => {
        state.selectedException = exception || null;
      });
    },

    deselectException: () => {
      set((state) => {
        state.selectedException = null;
      });
    },

    // Priority Actions
    updatePriority: async (exceptionId, priority) => {
      const { showSuccess, showError } = useUIStore.getState();

      const exception = get().getExceptionById(exceptionId);
      if (!exception) {
        showError('Không tìm thấy ngoại lệ');
        throw new Error('Không tìm thấy ngoại lệ');
      }

      await simulateNetworkDelay(200, 400);

      set((state) => {
        const index = state.exceptions.findIndex((e) => e.id === exceptionId);
        if (index !== -1) {
          state.exceptions[index].priority = priority;
        }
      });

      get().persistExceptions();

      const priorityNames: Record<ExceptionPriority, string> = {
        urgent: 'Khẩn cấp',
        high: 'Cao',
        medium: 'Trung bình',
        low: 'Thấp',
      };

      showSuccess(`Đã cập nhật độ ưu tiên thành: ${priorityNames[priority]}`);
    },

    // Filter Actions
    setPriorityFilter: (priority) => {
      set((state) => {
        state.priorityFilter = priority;
      });
    },

    setGateFilter: (gate) => {
      set((state) => {
        state.gateFilter = gate;
      });
    },

    setStatusFilter: (status) => {
      set((state) => {
        state.statusFilter = status;
      });
    },

    resetFilters: () => {
      set((state) => {
        state.priorityFilter = 'all';
        state.gateFilter = 'all';
        state.statusFilter = 'all';
      });
    },

    // Real-time Simulation
    startExceptionSimulation: () => {
      const { showInfo } = useUIStore.getState();

      get().stopExceptionSimulation();

      const intervalId = setInterval(() => {
        // 40% chance to generate exception
        if (Math.random() < 0.4) {
          const gates: Gate[] = ['A', 'B', 'C', 'D'];
          const gate = gates[Math.floor(Math.random() * gates.length)];

          const errorTypes: ExceptionErrorType[] = [
            'no_detection',
            'low_confidence',
            'damaged_plate',
            'obscured',
          ];
          const errorType =
            errorTypes[Math.floor(Math.random() * errorTypes.length)];

          const direction: 'entry' | 'exit' =
            Math.random() < 0.6 ? 'entry' : 'exit';

          // Generate low confidence score
          const confidence = 20 + Math.floor(Math.random() * 55); // 20-75%

          // Generate partial/incorrect plate
          let plate: string | undefined;
          if (errorType !== 'no_detection' && Math.random() < 0.7) {
            const provinces = ['29', '30', '31', '32'];
            const letters = 'ABCDEFGHKLMNPRSTUVWXYZ';
            const province =
              provinces[Math.floor(Math.random() * provinces.length)];
            const letter = letters[Math.floor(Math.random() * letters.length)];

            // Simulate OCR errors
            const number = Math.floor(Math.random() * 99999)
              .toString()
              .padStart(5, '0');
            plate = `${province}${letter}-${number}`;

            // Add OCR confusion (I/1, O/0, B/8)
            if (Math.random() < 0.3) {
              plate = plate.replace(/1/g, 'I').replace(/0/g, 'O');
            }
          }

          get().createException({
            licensePlate: plate,
            confidence,
            gate,
            direction,
            image: `/mock-images/exception-${Math.floor(Math.random() * 20) + 1}.jpg`,
            errorType,
          });
        }
      }, 120000); // Every 2 minutes

      set((state) => {
        state.simulationIntervalId = intervalId as unknown as number;
      });

      showInfo('Đã bật mô phỏng ngoại lệ tự động');
    },

    stopExceptionSimulation: () => {
      const { simulationIntervalId } = get();
      if (simulationIntervalId) {
        clearInterval(simulationIntervalId);
        set((state) => {
          state.simulationIntervalId = null;
        });
        useUIStore.getState().showInfo('Đã tắt mô phỏng ngoại lệ');
      }
    },

    // Persistence Actions
    persistExceptions: () => {
      debouncedSave(get().exceptions);
    },

    loadPersistedExceptions: () => {
      const persisted = loadFromStorage<LPRException[]>(
        STORAGE_KEYS.EXCEPTIONS,
        []
      );
      if (persisted.length > 0) {
        set((state) => {
          state.exceptions = persisted;
        });
      }
    },
  }))
);
