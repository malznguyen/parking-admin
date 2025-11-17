// lib/mock-data/index.ts

export * from './vehicles';
export * from './sessions';
export * from './exceptions';
export * from './statistics';
export * from './system-status';
export * from './generators';

// Re-export types
export type * from '@/types/database';

// Utility functions
export function refreshMockData() {
    // This can be used to regenerate data in dev mode
    console.log('Mock data refreshed');
}