// lib/stores/session-store.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  ParkingSession,
  VehicleType,
  PaymentMethod,
  LPRConfidence,
} from '@/types/database';
import { mockSessions } from '@/lib/mock-data';
import { PARKING_CONFIG } from '@/lib/constants';
import {
  saveToStorage,
  loadFromStorage,
  STORAGE_KEYS,
  createDebouncedSave,
} from '@/lib/utils/storage';
import {
  generateSessionId,
  getCurrentISOString,
  simulateNetworkDelay,
  calculateDuration,
  isOvernightParking,
  generateRandomVisitorPlate,
  generateRandomConfidence,
} from '@/lib/utils/generators';
import { useUIStore } from './ui-store';
import { useVehicleStore } from './vehicle-store';

type Gate = 'A' | 'B' | 'C' | 'D';

interface DateRange {
  start: Date;
  end: Date;
}

interface SessionStore {
  // State
  sessions: ParkingSession[];
  isLoading: boolean;
  error: string | null;
  selectedSession: ParkingSession | null;

  // Filters
  dateRange: DateRange;
  gateFilter: Gate | 'all';
  typeFilter: VehicleType | 'all';

  // Real-time simulation
  simulationIntervalId: number | null;

  // Computed Getters
  getCurrentSessions: () => ParkingSession[];
  getHistorySessions: () => ParkingSession[];
  getOccupiedSpots: () => number;
  getAvailableSpots: () => number;
  getOccupancyRate: () => number;
  getTodaySessions: () => ParkingSession[];
  getTodayRevenue: () => number;
  getSessionById: (id: string) => ParkingSession | undefined;

  // Actions - CRUD
  fetchSessions: () => Promise<void>;
  createEntrySession: (data: {
    licensePlate: string;
    gate: Gate;
    vehicleType?: VehicleType;
    confidence: LPRConfidence;
    image?: string;
  }) => Promise<ParkingSession>;

  completeExitSession: (
    sessionId: string,
    data: {
      exitGate: Gate;
      confidence: LPRConfidence;
      image?: string;
    }
  ) => Promise<void>;

  updateSession: (
    sessionId: string,
    updates: Partial<ParkingSession>
  ) => Promise<void>;

  // Actions - Payment
  processPayment: (
    sessionId: string,
    method: PaymentMethod
  ) => Promise<void>;
  calculateFee: (
    entryTime: Date | string,
    exitTime: Date | string,
    vehicleType: VehicleType
  ) => number;

  // Actions - Search & Filter
  setDateRange: (range: DateRange) => void;
  setGateFilter: (gate: Gate | 'all') => void;
  setTypeFilter: (type: VehicleType | 'all') => void;
  searchSessions: (query: string) => ParkingSession[];
  getSessionsByPlate: (licensePlate: string) => ParkingSession[];
  getSessionsByDateRange: (start: Date, end: Date) => ParkingSession[];

  // Actions - Selection
  selectSession: (id: string) => void;
  deselectSession: () => void;

  // Actions - Real-time Simulation
  startRealtimeSimulation: () => void;
  stopRealtimeSimulation: () => void;

  // Actions - Persistence
  persistSessions: () => void;
  loadPersistedSessions: () => void;
}

const debouncedSave = createDebouncedSave<ParkingSession[]>(
  STORAGE_KEYS.SESSIONS,
  500
);

export const useSessionStore = create<SessionStore>()(
  immer((set, get) => ({
    // Initial State
    sessions: [],
    isLoading: false,
    error: null,
    selectedSession: null,
    dateRange: {
      start: new Date(new Date().setHours(0, 0, 0, 0)),
      end: new Date(),
    },
    gateFilter: 'all',
    typeFilter: 'all',
    simulationIntervalId: null,

    // Computed Getters
    getCurrentSessions: () => {
      return get()
        .sessions.filter((s) => !s.exitTime)
        .sort(
          (a, b) =>
            new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
        );
    },

    getHistorySessions: () => {
      return get()
        .sessions.filter((s) => !!s.exitTime)
        .sort(
          (a, b) =>
            new Date(b.exitTime!).getTime() - new Date(a.exitTime!).getTime()
        );
    },

    getOccupiedSpots: () => {
      return get().sessions.filter((s) => !s.exitTime).length;
    },

    getAvailableSpots: () => {
      const occupied = get().getOccupiedSpots();
      return PARKING_CONFIG.TOTAL_SPOTS - occupied;
    },

    getOccupancyRate: () => {
      const occupied = get().getOccupiedSpots();
      return (occupied / PARKING_CONFIG.TOTAL_SPOTS) * 100;
    },

    getTodaySessions: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return get().sessions.filter(
        (s) => new Date(s.entryTime) >= today
      );
    },

    getTodayRevenue: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return get()
        .sessions.filter(
          (s) =>
            s.paymentStatus === 'paid' &&
            s.paymentTime &&
            new Date(s.paymentTime) >= today
        )
        .reduce((sum, s) => sum + s.fee, 0);
    },

    getSessionById: (id) => {
      return get().sessions.find((s) => s.id === id);
    },

    // CRUD Actions
    fetchSessions: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await simulateNetworkDelay(400, 700);

        const persisted = loadFromStorage<ParkingSession[]>(
          STORAGE_KEYS.SESSIONS,
          []
        );

        if (persisted.length > 0) {
          set((state) => {
            state.sessions = persisted;
            state.isLoading = false;
          });
        } else {
          // Initialize with mock data
          set((state) => {
            state.sessions = mockSessions;
            state.isLoading = false;
          });
          get().persistSessions();
        }
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to fetch sessions';
          state.isLoading = false;
        });
        useUIStore.getState().showError('Không thể tải danh sách phiên đỗ');
      }
    },

    createEntrySession: async (data) => {
      const { showSuccess, showError, showWarning } = useUIStore.getState();

      // Check parking capacity
      const available = get().getAvailableSpots();
      if (available <= 0) {
        showError('Bãi xe đã đầy, không thể cho phép vào');
        throw new Error('Bãi xe đã đầy');
      }

      // Warn if almost full
      if (available <= 10) {
        showWarning(`Chỉ còn ${available} chỗ trống!`);
      }

      await simulateNetworkDelay(300, 500);

      // Determine vehicle type
      let vehicleType = data.vehicleType || 'visitor';
      let vehicleId: string | undefined;

      // Check if plate belongs to registered vehicle
      const vehicle = useVehicleStore
        .getState()
        .getVehicleByPlate(data.licensePlate);
      if (vehicle && vehicle.isActive) {
        vehicleType = vehicle.type;
        vehicleId = vehicle.id;
      }

      const now = getCurrentISOString();
      const newSession: ParkingSession = {
        id: generateSessionId(),
        vehicleId,
        licensePlate: data.licensePlate.toUpperCase(),
        vehicleType,
        entryTime: now,
        entryGate: data.gate,
        entryImage: data.image || '/mock-images/entry-default.jpg',
        entryConfidence: data.confidence,
        fee: 0,
        paymentStatus: vehicleType !== 'visitor' ? 'exempted' : 'unpaid',
        isOvernight: false,
        isException: false,
      };

      set((state) => {
        state.sessions.unshift(newSession);
      });

      get().persistSessions();
      showSuccess(`Xe ${data.licensePlate} đã vào cổng ${data.gate}`);

      return newSession;
    },

    completeExitSession: async (sessionId, data) => {
      const { showSuccess, showError } = useUIStore.getState();

      const session = get().getSessionById(sessionId);
      if (!session) {
        showError('Không tìm thấy phiên đỗ xe');
        throw new Error('Không tìm thấy phiên đỗ xe');
      }

      if (session.exitTime) {
        showError('Phiên đỗ xe đã kết thúc');
        throw new Error('Phiên đỗ xe đã kết thúc');
      }

      await simulateNetworkDelay(300, 500);

      const now = getCurrentISOString();
      const duration = calculateDuration(session.entryTime, now);
      const isOvernight = isOvernightParking(session.entryTime, now);
      const fee = get().calculateFee(session.entryTime, now, session.vehicleType);

      set((state) => {
        const index = state.sessions.findIndex((s) => s.id === sessionId);
        if (index !== -1) {
          state.sessions[index] = {
            ...state.sessions[index],
            exitTime: now,
            exitGate: data.exitGate,
            exitImage: data.image || '/mock-images/exit-default.jpg',
            exitConfidence: data.confidence,
            parkingDuration: duration,
            fee,
            isOvernight,
            paymentStatus:
              session.vehicleType !== 'visitor' ? 'exempted' : 'unpaid',
          };
        }
      });

      get().persistSessions();
      showSuccess(
        `Xe ${session.licensePlate} đã ra cổng ${data.exitGate}. Thời gian: ${Math.floor(duration / 60)}h${duration % 60}m`
      );
    },

    updateSession: async (sessionId, updates) => {
      const { showSuccess, showError } = useUIStore.getState();

      const session = get().getSessionById(sessionId);
      if (!session) {
        showError('Không tìm thấy phiên đỗ xe');
        throw new Error('Không tìm thấy phiên đỗ xe');
      }

      await simulateNetworkDelay(200, 400);

      set((state) => {
        const index = state.sessions.findIndex((s) => s.id === sessionId);
        if (index !== -1) {
          state.sessions[index] = {
            ...state.sessions[index],
            ...updates,
          };

          if (state.selectedSession?.id === sessionId) {
            state.selectedSession = state.sessions[index];
          }
        }
      });

      get().persistSessions();
      showSuccess('Cập nhật phiên đỗ xe thành công');
    },

    // Payment Actions
    processPayment: async (sessionId, method) => {
      const { showSuccess, showError } = useUIStore.getState();

      const session = get().getSessionById(sessionId);
      if (!session) {
        showError('Không tìm thấy phiên đỗ xe');
        throw new Error('Không tìm thấy phiên đỗ xe');
      }

      if (session.paymentStatus === 'paid') {
        showError('Phiên đỗ xe đã được thanh toán');
        throw new Error('Phiên đỗ xe đã được thanh toán');
      }

      if (session.paymentStatus === 'exempted') {
        showError('Phiên đỗ xe được miễn phí');
        throw new Error('Phiên đỗ xe được miễn phí');
      }

      await simulateNetworkDelay(500, 800);

      const now = getCurrentISOString();

      set((state) => {
        const index = state.sessions.findIndex((s) => s.id === sessionId);
        if (index !== -1) {
          state.sessions[index].paymentStatus = 'paid';
          state.sessions[index].paymentMethod = method;
          state.sessions[index].paymentTime = now;
        }
      });

      get().persistSessions();

      const methodNames: Record<PaymentMethod, string> = {
        cash: 'Tiền mặt',
        momo: 'MoMo',
        banking: 'Chuyển khoản',
        card: 'Thẻ',
        free: 'Miễn phí',
      };

      showSuccess(
        `Thanh toán thành công: ${new Intl.NumberFormat('vi-VN').format(session.fee)} VND (${methodNames[method]})`
      );
    },

    calculateFee: (entryTime, exitTime, vehicleType) => {
      // Registered vehicles are exempt
      if (vehicleType !== 'visitor') {
        return 0;
      }

      const duration = calculateDuration(entryTime, exitTime);
      const hours = Math.ceil(duration / 60);

      // Check overnight parking
      if (isOvernightParking(entryTime, exitTime)) {
        return PARKING_CONFIG.PRICING.OVERNIGHT;
      }

      // Calculate based on hours
      if (hours <= 1) {
        return PARKING_CONFIG.PRICING.FIRST_HOUR;
      }

      const additionalHours = hours - 1;
      return (
        PARKING_CONFIG.PRICING.FIRST_HOUR +
        additionalHours * PARKING_CONFIG.PRICING.ADDITIONAL_HOUR
      );
    },

    // Search & Filter Actions
    setDateRange: (range) => {
      set((state) => {
        state.dateRange = range;
      });
    },

    setGateFilter: (gate) => {
      set((state) => {
        state.gateFilter = gate;
      });
    },

    setTypeFilter: (type) => {
      set((state) => {
        state.typeFilter = type;
      });
    },

    searchSessions: (query) => {
      const trimmed = query.toLowerCase().trim();
      return get().sessions.filter(
        (s) =>
          s.licensePlate.toLowerCase().includes(trimmed) ||
          s.id.toLowerCase().includes(trimmed)
      );
    },

    getSessionsByPlate: (licensePlate) => {
      const plate = licensePlate.toUpperCase().trim();
      return get()
        .sessions.filter((s) => s.licensePlate === plate)
        .sort(
          (a, b) =>
            new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
        );
    },

    getSessionsByDateRange: (start, end) => {
      return get()
        .sessions.filter((s) => {
          const entryDate = new Date(s.entryTime);
          return entryDate >= start && entryDate <= end;
        })
        .sort(
          (a, b) =>
            new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
        );
    },

    // Selection Actions
    selectSession: (id) => {
      const session = get().getSessionById(id);
      set((state) => {
        state.selectedSession = session || null;
      });
    },

    deselectSession: () => {
      set((state) => {
        state.selectedSession = null;
      });
    },

    // Real-time Simulation
    startRealtimeSimulation: () => {
      const { showInfo } = useUIStore.getState();

      // Stop existing simulation
      get().stopRealtimeSimulation();

      const intervalId = setInterval(() => {
        const rand = Math.random();

        // 30% chance of new entry
        if (rand < 0.3 && get().getAvailableSpots() > 0) {
          const gates: Gate[] = ['A', 'B', 'C', 'D'];
          const gate = gates[Math.floor(Math.random() * gates.length)];

          // 70% registered, 30% visitor
          let plate: string;
          let vehicleType: VehicleType = 'visitor';

          if (Math.random() < 0.7) {
            const vehicles = useVehicleStore.getState().vehicles;
            const activeVehicles = vehicles.filter((v) => v.isActive);
            if (activeVehicles.length > 0) {
              const randomVehicle =
                activeVehicles[Math.floor(Math.random() * activeVehicles.length)];
              plate = randomVehicle.licensePlate;
              vehicleType = randomVehicle.type;
            } else {
              plate = generateRandomVisitorPlate();
            }
          } else {
            plate = generateRandomVisitorPlate();
          }

          const confidenceScore = generateRandomConfidence();
          const confidence: LPRConfidence =
            confidenceScore >= 95
              ? 'high'
              : confidenceScore >= 80
                ? 'medium'
                : confidenceScore >= 60
                  ? 'low'
                  : 'failed';

          get().createEntrySession({
            licensePlate: plate,
            gate,
            vehicleType,
            confidence,
          });
        }

        // 20% chance of exit
        if (rand >= 0.3 && rand < 0.5) {
          const currentSessions = get().getCurrentSessions();
          if (currentSessions.length > 0) {
            const randomSession =
              currentSessions[Math.floor(Math.random() * currentSessions.length)];

            const gates: Gate[] = ['A', 'B', 'C', 'D'];
            const exitGate = gates[Math.floor(Math.random() * gates.length)];

            const confidenceScore = generateRandomConfidence();
            const confidence: LPRConfidence =
              confidenceScore >= 95
                ? 'high'
                : confidenceScore >= 80
                  ? 'medium'
                  : confidenceScore >= 60
                    ? 'low'
                    : 'failed';

            get().completeExitSession(randomSession.id, {
              exitGate,
              confidence,
            });

            // Auto-process payment for visitors
            setTimeout(() => {
              const session = get().getSessionById(randomSession.id);
              if (
                session &&
                session.paymentStatus === 'unpaid' &&
                session.vehicleType === 'visitor'
              ) {
                const methods: PaymentMethod[] = [
                  'cash',
                  'momo',
                  'banking',
                  'card',
                ];
                const method =
                  methods[Math.floor(Math.random() * methods.length)];
                get().processPayment(randomSession.id, method);
              }
            }, 1000);
          }
        }
      }, 30000); // Every 30 seconds

      set((state) => {
        state.simulationIntervalId = intervalId as unknown as number;
      });

      showInfo('Đã bật mô phỏng thời gian thực');
    },

    stopRealtimeSimulation: () => {
      const { simulationIntervalId } = get();
      if (simulationIntervalId) {
        clearInterval(simulationIntervalId);
        set((state) => {
          state.simulationIntervalId = null;
        });
        useUIStore.getState().showInfo('Đã tắt mô phỏng thời gian thực');
      }
    },

    // Persistence Actions
    persistSessions: () => {
      debouncedSave(get().sessions);
    },

    loadPersistedSessions: () => {
      const persisted = loadFromStorage<ParkingSession[]>(
        STORAGE_KEYS.SESSIONS,
        []
      );
      if (persisted.length > 0) {
        set((state) => {
          state.sessions = persisted;
        });
      }
    },
  }))
);
