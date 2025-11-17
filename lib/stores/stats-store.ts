// lib/stores/stats-store.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ParkingStatistics, ParkingSession } from '@/types/database';
import { mockStatistics } from '@/lib/mock-data';
import { PARKING_CONFIG } from '@/lib/constants';
import {
  saveToStorage,
  loadFromStorage,
  STORAGE_KEYS,
} from '@/lib/utils/storage';
import {
  simulateNetworkDelay,
  formatDateDisplay,
  getHourString,
  getDateDaysAgo,
} from '@/lib/utils/generators';
import { useSessionStore } from './session-store';
import { useExceptionStore } from './exception-store';

interface CurrentStats {
  occupiedSpots: number;
  availableSpots: number;
  occupancyRate: number;
  todayRevenue: number;
  pendingExceptions: number;
  todaySessions: number;
  averageDuration: number;
}

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ActivityData {
  time: string;
  vehicles: number;
  entries: number;
  exits: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  count: number;
}

interface VehicleTypeData {
  type: string;
  typeName: string;
  value: number;
  percentage: number;
}

interface GateDistributionData {
  gate: string;
  count: number;
  percentage: number;
}

interface TopVehicle {
  rank: number;
  licensePlate: string;
  ownerName?: string;
  totalSessions: number;
  totalDuration: number;
  averageDuration: number;
}

interface StatsStore {
  // State
  dailyStats: ParkingStatistics[];
  currentStats: CurrentStats;
  isLoading: boolean;
  error: string | null;

  // Real-time subscription
  updateIntervalId: number | null;
  subscribers: Array<(stats: CurrentStats) => void>;

  // Computed Getters
  getLast30DaysRevenue: () => number;
  getAverageDailyRevenue: () => number;
  getPeakHourToday: () => string;
  getOccupancyTrend: () => 'increasing' | 'decreasing' | 'stable';

  // Actions
  fetchStats: () => Promise<void>;
  refreshCurrentStats: () => void;
  calculateRevenueByDateRange: (start: Date, end: Date) => number;
  calculateOccupancyByHour: (date: Date) => Array<{ hour: string; count: number }>;
  getTopVehicles: (limit: number, sortBy: 'frequency' | 'duration') => TopVehicle[];

  // Chart Data Generators
  getActivityChartData: (hours?: number) => ActivityData[];
  getRevenueChartData: (days?: number) => RevenueData[];
  getVehicleTypeData: () => VehicleTypeData[];
  getGateDistributionData: () => GateDistributionData[];
  getWeeklyComparisonData: () => { day: string; thisWeek: number; lastWeek: number }[];

  // Real-time Subscription
  subscribeToUpdates: (callback: (stats: CurrentStats) => void) => () => void;
  startAutoRefresh: (intervalMs?: number) => void;
  stopAutoRefresh: () => void;

  // Persistence
  persistStats: () => void;
}

export const useStatsStore = create<StatsStore>()(
  immer((set, get) => ({
    // Initial State
    dailyStats: [],
    currentStats: {
      occupiedSpots: 0,
      availableSpots: PARKING_CONFIG.TOTAL_SPOTS,
      occupancyRate: 0,
      todayRevenue: 0,
      pendingExceptions: 0,
      todaySessions: 0,
      averageDuration: 0,
    },
    isLoading: false,
    error: null,
    updateIntervalId: null,
    subscribers: [],

    // Computed Getters
    getLast30DaysRevenue: () => {
      const { dailyStats } = get();
      const last30Days = dailyStats.slice(-30);
      return last30Days.reduce((sum, day) => sum + day.revenue.total, 0);
    },

    getAverageDailyRevenue: () => {
      const { dailyStats } = get();
      if (dailyStats.length === 0) return 0;
      const last30Days = dailyStats.slice(-30);
      const total = last30Days.reduce((sum, day) => sum + day.revenue.total, 0);
      return Math.round(total / last30Days.length);
    },

    getPeakHourToday: () => {
      const sessions = useSessionStore.getState().getTodaySessions();
      const hourCounts: Record<number, number> = {};

      sessions.forEach((session) => {
        const hour = new Date(session.entryTime).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      let maxHour = 0;
      let maxCount = 0;

      for (const [hour, count] of Object.entries(hourCounts)) {
        if (count > maxCount) {
          maxCount = count;
          maxHour = parseInt(hour);
        }
      }

      return getHourString(maxHour);
    },

    getOccupancyTrend: () => {
      const { dailyStats } = get();
      if (dailyStats.length < 3) return 'stable';

      const recent = dailyStats.slice(-3);
      const avgOccupancy = recent.map((d) => d.averageOccupancy);

      if (avgOccupancy[2] > avgOccupancy[1] && avgOccupancy[1] > avgOccupancy[0]) {
        return 'increasing';
      }
      if (avgOccupancy[2] < avgOccupancy[1] && avgOccupancy[1] < avgOccupancy[0]) {
        return 'decreasing';
      }

      return 'stable';
    },

    // Actions
    fetchStats: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await simulateNetworkDelay(300, 600);

        const persisted = loadFromStorage<ParkingStatistics[]>(
          STORAGE_KEYS.STATS,
          []
        );

        if (persisted.length > 0) {
          set((state) => {
            state.dailyStats = persisted;
            state.isLoading = false;
          });
        } else {
          set((state) => {
            state.dailyStats = mockStatistics;
            state.isLoading = false;
          });
          get().persistStats();
        }

        // Refresh current stats
        get().refreshCurrentStats();
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Failed to fetch stats';
          state.isLoading = false;
        });
      }
    },

    refreshCurrentStats: () => {
      const sessionStore = useSessionStore.getState();
      const exceptionStore = useExceptionStore.getState();

      const occupiedSpots = sessionStore.getOccupiedSpots();
      const availableSpots = sessionStore.getAvailableSpots();
      const occupancyRate = sessionStore.getOccupancyRate();
      const todayRevenue = sessionStore.getTodayRevenue();
      const todaySessions = sessionStore.getTodaySessions();
      const pendingExceptions = exceptionStore.getQueueCount();

      // Calculate average duration from today's completed sessions
      const completedToday = todaySessions.filter((s) => s.exitTime);
      const totalDuration = completedToday.reduce(
        (sum, s) => sum + (s.parkingDuration || 0),
        0
      );
      const averageDuration =
        completedToday.length > 0
          ? Math.round(totalDuration / completedToday.length)
          : 0;

      const newStats: CurrentStats = {
        occupiedSpots,
        availableSpots,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        todayRevenue,
        pendingExceptions,
        todaySessions: todaySessions.length,
        averageDuration,
      };

      set((state) => {
        state.currentStats = newStats;
      });

      // Notify subscribers
      get().subscribers.forEach((callback) => callback(newStats));
    },

    calculateRevenueByDateRange: (start, end) => {
      const sessions = useSessionStore.getState().getSessionsByDateRange(start, end);
      return sessions
        .filter((s) => s.paymentStatus === 'paid')
        .reduce((sum, s) => sum + s.fee, 0);
    },

    calculateOccupancyByHour: (date) => {
      const sessions = useSessionStore.getState().sessions;
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      const hourData: Array<{ hour: string; count: number }> = [];

      for (let h = 0; h < 24; h++) {
        const hourStart = new Date(targetDate);
        hourStart.setHours(h, 0, 0, 0);
        const hourEnd = new Date(targetDate);
        hourEnd.setHours(h + 1, 0, 0, 0);

        const count = sessions.filter((s) => {
          const entryTime = new Date(s.entryTime);
          const exitTime = s.exitTime ? new Date(s.exitTime) : new Date();

          // Vehicle was parked during this hour
          return entryTime < hourEnd && exitTime >= hourStart;
        }).length;

        hourData.push({
          hour: getHourString(h),
          count,
        });
      }

      return hourData;
    },

    getTopVehicles: (limit, sortBy) => {
      const sessions = useSessionStore.getState().sessions;
      const vehicleStats: Record<
        string,
        { totalSessions: number; totalDuration: number; ownerName?: string }
      > = {};

      sessions.forEach((session) => {
        if (!vehicleStats[session.licensePlate]) {
          vehicleStats[session.licensePlate] = {
            totalSessions: 0,
            totalDuration: 0,
          };
        }

        vehicleStats[session.licensePlate].totalSessions++;
        if (session.parkingDuration) {
          vehicleStats[session.licensePlate].totalDuration +=
            session.parkingDuration;
        }
      });

      const sortedVehicles = Object.entries(vehicleStats)
        .map(([plate, stats]) => ({
          licensePlate: plate,
          ...stats,
          averageDuration: Math.round(stats.totalDuration / stats.totalSessions),
        }))
        .sort((a, b) => {
          if (sortBy === 'frequency') {
            return b.totalSessions - a.totalSessions;
          }
          return b.totalDuration - a.totalDuration;
        })
        .slice(0, limit)
        .map((v, index) => ({
          rank: index + 1,
          ...v,
        }));

      return sortedVehicles;
    },

    // Chart Data Generators
    getActivityChartData: (hours = 24) => {
      const sessions = useSessionStore.getState().sessions;
      const now = new Date();
      const data: ActivityData[] = [];

      for (let i = hours - 1; i >= 0; i--) {
        const hourStart = new Date(now);
        hourStart.setHours(now.getHours() - i, 0, 0, 0);
        const hourEnd = new Date(hourStart);
        hourEnd.setHours(hourEnd.getHours() + 1);

        const entries = sessions.filter((s) => {
          const entryTime = new Date(s.entryTime);
          return entryTime >= hourStart && entryTime < hourEnd;
        }).length;

        const exits = sessions.filter((s) => {
          if (!s.exitTime) return false;
          const exitTime = new Date(s.exitTime);
          return exitTime >= hourStart && exitTime < hourEnd;
        }).length;

        data.push({
          time: getHourString(hourStart.getHours()),
          vehicles: entries + exits,
          entries,
          exits,
        });
      }

      return data;
    },

    getRevenueChartData: (days = 30) => {
      const sessions = useSessionStore.getState().sessions;
      const data: RevenueData[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = getDateDaysAgo(i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const daySessions = sessions.filter((s) => {
          if (!s.paymentTime) return false;
          const paymentTime = new Date(s.paymentTime);
          return paymentTime >= date && paymentTime < nextDate;
        });

        const revenue = daySessions.reduce((sum, s) => sum + s.fee, 0);

        data.push({
          date: formatDateDisplay(date),
          revenue,
          count: daySessions.length,
        });
      }

      return data;
    },

    getVehicleTypeData: () => {
      const sessions = useSessionStore.getState().getTodaySessions();
      const typeCounts: Record<string, number> = {
        registered_monthly: 0,
        registered_staff: 0,
        visitor: 0,
      };

      sessions.forEach((s) => {
        typeCounts[s.vehicleType]++;
      });

      const total = sessions.length || 1;

      const typeNames: Record<string, string> = {
        registered_monthly: 'Sinh viên',
        registered_staff: 'Cán bộ',
        visitor: 'Khách',
      };

      return Object.entries(typeCounts).map(([type, value]) => ({
        type,
        typeName: typeNames[type] || type,
        value,
        percentage: Math.round((value / total) * 100),
      }));
    },

    getGateDistributionData: () => {
      const sessions = useSessionStore.getState().getTodaySessions();
      const gateCounts: Record<string, number> = {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
      };

      sessions.forEach((s) => {
        gateCounts[s.entryGate]++;
      });

      const total = sessions.length || 1;

      return Object.entries(gateCounts).map(([gate, count]) => ({
        gate: `Cổng ${gate}`,
        count,
        percentage: Math.round((count / total) * 100),
      }));
    },

    getWeeklyComparisonData: () => {
      const sessions = useSessionStore.getState().sessions;
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const data: { day: string; thisWeek: number; lastWeek: number }[] = [];

      const now = new Date();
      const currentDayOfWeek = now.getDay();

      for (let i = 0; i < 7; i++) {
        // This week
        const thisWeekDate = new Date(now);
        thisWeekDate.setDate(now.getDate() - currentDayOfWeek + i);
        thisWeekDate.setHours(0, 0, 0, 0);
        const thisWeekEnd = new Date(thisWeekDate);
        thisWeekEnd.setDate(thisWeekEnd.getDate() + 1);

        // Last week
        const lastWeekDate = new Date(thisWeekDate);
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);
        const lastWeekEnd = new Date(lastWeekDate);
        lastWeekEnd.setDate(lastWeekEnd.getDate() + 1);

        const thisWeekCount = sessions.filter((s) => {
          const entryTime = new Date(s.entryTime);
          return entryTime >= thisWeekDate && entryTime < thisWeekEnd;
        }).length;

        const lastWeekCount = sessions.filter((s) => {
          const entryTime = new Date(s.entryTime);
          return entryTime >= lastWeekDate && entryTime < lastWeekEnd;
        }).length;

        data.push({
          day: days[i],
          thisWeek: thisWeekCount,
          lastWeek: lastWeekCount,
        });
      }

      return data;
    },

    // Real-time Subscription
    subscribeToUpdates: (callback) => {
      set((state) => {
        state.subscribers.push(callback);
      });

      // Initial update
      callback(get().currentStats);

      // Return unsubscribe function
      return () => {
        set((state) => {
          state.subscribers = state.subscribers.filter((cb) => cb !== callback);
        });
      };
    },

    startAutoRefresh: (intervalMs = 5000) => {
      get().stopAutoRefresh();

      const intervalId = setInterval(() => {
        get().refreshCurrentStats();
      }, intervalMs);

      set((state) => {
        state.updateIntervalId = intervalId as unknown as number;
      });
    },

    stopAutoRefresh: () => {
      const { updateIntervalId } = get();
      if (updateIntervalId) {
        clearInterval(updateIntervalId);
        set((state) => {
          state.updateIntervalId = null;
        });
      }
    },

    // Persistence
    persistStats: () => {
      saveToStorage(STORAGE_KEYS.STATS, get().dailyStats);
    },
  }))
);
