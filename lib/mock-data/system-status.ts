// lib/mock-data/system-status.ts

import { SystemStatus } from '@/types/database';
import { PARKING_CONFIG } from '../constants';

export function generateSystemStatus(): SystemStatus {
    return {
        timestamp: new Date().toISOString(),

        gates: PARKING_CONFIG.GATES.map((gateId) => {
            const isOperational = Math.random() > 0.05; // 95% uptime

            return {
                id: gateId,
                status: isOperational ? 'online' : (Math.random() > 0.7 ? 'offline' : 'maintenance'),

                camera: {
                    status: isOperational
                        ? (Math.random() > 0.9 ? 'degraded' : 'operational')
                        : 'offline',
                    lastCheck: new Date(Date.now() - Math.random() * 300000).toISOString(), // Last 5 min
                    uptime: 95 + Math.random() * 4.9, // 95-99.9%
                },

                barrier: {
                    status: isOperational
                        ? (Math.random() > 0.95 ? 'stuck_open' : 'operational')
                        : 'offline',
                    lastCheck: new Date(Date.now() - Math.random() * 600000).toISOString(), // Last 10 min
                    cycleCount: Math.floor(Math.random() * 500) + 100, // 100-600 cycles today
                },

                loopSensor: {
                    status: isOperational
                        ? (Math.random() > 0.98 ? 'faulty' : 'operational')
                        : 'offline',
                    lastTrigger: new Date(Date.now() - Math.random() * 180000).toISOString(), // Last 3 min
                },
            };
        }),

        server: {
            cpu: 30 + Math.random() * 40, // 30-70%
            memory: 50 + Math.random() * 30, // 50-80%
            storage: 60 + Math.random() * 20, // 60-80%
            uptime: '45 days 12:34:56',
        },

        database: {
            status: Math.random() > 0.95 ? 'slow' : 'healthy',
            responseTime: 10 + Math.random() * 40, // 10-50ms
            lastBackup: new Date(Date.now() - 86400000).toISOString(), // 24h ago
        },
    };
}

export const mockSystemStatus = generateSystemStatus();