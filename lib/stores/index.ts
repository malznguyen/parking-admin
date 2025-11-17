// lib/stores/index.ts

// Export all stores
export { useUIStore } from './ui-store';
export type { Toast } from './ui-store';

export { useVehicleStore } from './vehicle-store';
export { useSessionStore } from './session-store';
export { useExceptionStore } from './exception-store';
export { useStatsStore } from './stats-store';
export { useSettingsStore } from './settings-store';

// Re-export types from database
export type {
  Vehicle,
  VehicleType,
  ParkingSession,
  PaymentStatus,
  PaymentMethod,
  LPRException,
  ExceptionStatus,
  LPRConfidence,
  ParkingStatistics,
  SystemStatus,
} from '@/types/database';

// Store initialization helper
export async function initializeStores(): Promise<void> {
  const { useVehicleStore } = await import('./vehicle-store');
  const { useSessionStore } = await import('./session-store');
  const { useExceptionStore } = await import('./exception-store');
  const { useStatsStore } = await import('./stats-store');
  const { useSettingsStore } = await import('./settings-store');

  // Fetch all data in parallel
  await Promise.all([
    useVehicleStore.getState().fetchVehicles(),
    useSessionStore.getState().fetchSessions(),
    useExceptionStore.getState().fetchExceptions(),
    useStatsStore.getState().fetchStats(),
    useSettingsStore.getState().fetchSettings(),
  ]);

  // Start auto-refresh for stats
  useStatsStore.getState().startAutoRefresh(5000);
}

// Cleanup helper for unmounting
export function cleanupStores(): void {
  const { useSessionStore } = require('./session-store');
  const { useExceptionStore } = require('./exception-store');
  const { useStatsStore } = require('./stats-store');

  useSessionStore.getState().stopRealtimeSimulation();
  useExceptionStore.getState().stopExceptionSimulation();
  useStatsStore.getState().stopAutoRefresh();
}

// Reset all stores to initial state (for testing)
export async function resetAllStores(): Promise<void> {
  const { clearAllStorage } = await import('@/lib/utils/storage');
  clearAllStorage();

  // Re-initialize with fresh data
  await initializeStores();
}
