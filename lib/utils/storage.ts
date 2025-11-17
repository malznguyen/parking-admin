// lib/utils/storage.ts

const STORAGE_PREFIX = 'haui-parking:';

// Storage keys
export const STORAGE_KEYS = {
  VEHICLES: `${STORAGE_PREFIX}vehicles`,
  SESSIONS: `${STORAGE_PREFIX}sessions`,
  EXCEPTIONS: `${STORAGE_PREFIX}exceptions`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  STATS: `${STORAGE_PREFIX}stats`,
  BACKUPS: `${STORAGE_PREFIX}backups`,
  LAST_SYNC: `${STORAGE_PREFIX}last-sync`,
} as const;

// Generic storage operations
export function saveToStorage<T>(key: string, data: T): boolean {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('[Storage] Quota exceeded, clearing old data...');
      clearOldBackups();
      // Retry once
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch {
        console.error('[Storage] Failed to save after clearing backups');
        return false;
      }
    }
    console.error('[Storage] Save failed:', error);
    return false;
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error('[Storage] Load failed:', error);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('[Storage] Remove failed:', error);
  }
}

export function clearAllStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('[Storage] Clear all failed:', error);
  }
}

// Clear old backups to free space
function clearOldBackups(): void {
  try {
    const backups = loadFromStorage<any[]>(STORAGE_KEYS.BACKUPS, []);
    if (backups.length > 3) {
      // Keep only last 3 backups
      const recentBackups = backups.slice(-3);
      saveToStorage(STORAGE_KEYS.BACKUPS, recentBackups);
    }
  } catch (error) {
    console.error('[Storage] Clear old backups failed:', error);
  }
}

// Debounced save function creator
export function createDebouncedSave<T>(key: string, delay: number = 500) {
  let timeoutId: NodeJS.Timeout | null = null;

  return (data: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      saveToStorage(key, data);
      timeoutId = null;
    }, delay);
  };
}

// Get storage usage info
export function getStorageInfo(): { used: number; total: number; percentage: number } {
  let used = 0;

  for (const key of Object.keys(localStorage)) {
    const value = localStorage.getItem(key);
    if (value) {
      used += key.length + value.length;
    }
  }

  // Most browsers have ~5MB limit
  const total = 5 * 1024 * 1024; // 5MB in bytes
  const percentage = (used / total) * 100;

  return {
    used,
    total,
    percentage: Math.round(percentage * 100) / 100,
  };
}

// Format bytes for display
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Cross-tab synchronization
export function setupStorageSync(onSync: (key: string, newValue: any) => void): () => void {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key && event.key.startsWith(STORAGE_PREFIX) && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        onSync(event.key, parsed);
      } catch (error) {
        console.error('[Storage Sync] Parse error:', error);
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}

// Backup operations
export interface BackupData {
  timestamp: string;
  version: string;
  data: {
    vehicles: any[];
    sessions: any[];
    exceptions: any[];
    settings: any;
  };
}

export function createBackup(data: BackupData['data']): BackupData {
  const backup: BackupData = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    data,
  };

  const backups = loadFromStorage<BackupData[]>(STORAGE_KEYS.BACKUPS, []);
  backups.push(backup);

  // Keep only last 5 backups
  const recentBackups = backups.slice(-5);
  saveToStorage(STORAGE_KEYS.BACKUPS, recentBackups);

  return backup;
}

export function getLatestBackup(): BackupData | null {
  const backups = loadFromStorage<BackupData[]>(STORAGE_KEYS.BACKUPS, []);
  if (backups.length === 0) return null;
  return backups[backups.length - 1];
}

export function getAllBackups(): BackupData[] {
  return loadFromStorage<BackupData[]>(STORAGE_KEYS.BACKUPS, []);
}

// Check if data needs migration
export function checkDataVersion(key: string): string | null {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return parsed._version || '1.0.0';
  } catch {
    return null;
  }
}

// Update last sync timestamp
export function updateLastSync(): void {
  saveToStorage(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
}

export function getLastSync(): string | null {
  return loadFromStorage<string | null>(STORAGE_KEYS.LAST_SYNC, null);
}
