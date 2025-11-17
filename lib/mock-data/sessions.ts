// lib/mock-data/sessions.ts

import { ParkingSession, LPRConfidence } from '@/types/database';
import { mockVehicles } from './vehicles';
import {
    generateLicensePlate,
    getRandomItem,
    getBusinessHourTime,
} from './generators';
import { PARKING_CONFIG } from '../constants';

function calculateFee(entryTime: Date, exitTime: Date, isRegistered: boolean): number {
    if (isRegistered) return 0; // Miễn phí hoặc đã trả trước

    const durationMinutes = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60);
    const hours = Math.ceil(durationMinutes / 60);

    if (hours <= 1) {
        return PARKING_CONFIG.PRICING.FIRST_HOUR;
    }

    return PARKING_CONFIG.PRICING.FIRST_HOUR +
        (hours - 1) * PARKING_CONFIG.PRICING.ADDITIONAL_HOUR;
}

function getLPRConfidence(): LPRConfidence {
    const rand = Math.random();
    if (rand > 0.85) return 'high';
    if (rand > 0.65) return 'medium';
    if (rand > 0.45) return 'low';
    return 'failed';
}

function generateSession(date: Date, isCurrentlyParked: boolean, index: number): ParkingSession {
    const isRegisteredVehicle = Math.random() > 0.3; // 70% xe đăng ký
    const vehicle = isRegisteredVehicle
        ? getRandomItem(mockVehicles)
        : null;

    const licensePlate = vehicle?.licensePlate || generateLicensePlate(Math.random() > 0.8 ? 'other' : 'hanoi');
    const entryTime = getBusinessHourTime(date);

    const exitTime = isCurrentlyParked
        ? undefined
        : new Date(entryTime.getTime() + (30 + Math.random() * 240) * 60 * 1000); // 30min - 4h

    const entryConfidence = getLPRConfidence();
    const exitConfidence = exitTime ? getLPRConfidence() : undefined;

    const duration = exitTime
        ? Math.floor((exitTime.getTime() - entryTime.getTime()) / (1000 * 60))
        : undefined;

    const fee = exitTime
        ? calculateFee(entryTime, exitTime, isRegisteredVehicle)
        : 0;

    const paymentStatus = exitTime
        ? (isRegisteredVehicle ? 'exempted' : (Math.random() > 0.1 ? 'paid' : 'unpaid'))
        : 'unpaid';

    const paymentMethod = paymentStatus === 'paid'
        ? getRandomItem(['cash', 'momo', 'banking', 'card'] as const)
        : paymentStatus === 'exempted'
            ? 'free'
            : undefined;

    return {
        id: `SS-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(index).padStart(5, '0')}`,
        vehicleId: vehicle?.id,
        licensePlate,
        vehicleType: vehicle?.type || 'visitor',

        entryTime: entryTime.toISOString(),
        entryGate: getRandomItem(PARKING_CONFIG.GATES),
        entryImage: `/mock-images/entry-${Math.floor(Math.random() * 20) + 1}.jpg`,
        entryConfidence,
        entryOperator: entryConfidence === 'failed' ? 'operator_001' : undefined,

        exitTime: exitTime?.toISOString(),
        exitGate: exitTime ? getRandomItem(PARKING_CONFIG.GATES) : undefined,
        exitImage: exitTime ? `/mock-images/exit-${Math.floor(Math.random() * 20) + 1}.jpg` : undefined,
        exitConfidence,
        exitOperator: exitConfidence === 'failed' ? 'operator_002' : undefined,

        parkingDuration: duration,
        fee,
        paymentStatus,
        paymentMethod,
        paymentTime: exitTime && paymentStatus === 'paid' ? exitTime.toISOString() : undefined,

        isOvernight: false,
        isException: entryConfidence === 'failed' || exitConfidence === 'failed',
        notes: undefined,
    };
}

// Generate sessions for last 30 days
export const mockSessions: ParkingSession[] = [];

const today = new Date();
for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    // Số lượng xe vào theo ngày: 150-300 xe/ngày
    const sessionsPerDay = 150 + Math.floor(Math.random() * 150);

    for (let i = 0; i < sessionsPerDay; i++) {
        const isCurrentlyParked = daysAgo === 0 && Math.random() > 0.4; // 60% xe hôm nay đã ra
        mockSessions.push(generateSession(date, isCurrentlyParked, mockSessions.length + 1));
    }
}

// Helper: Get currently parked vehicles
export function getCurrentlyParkedSessions(): ParkingSession[] {
    return mockSessions.filter(s => !s.exitTime);
}

// Helper: Get sessions by date range
export function getSessionsByDateRange(startDate: Date, endDate: Date): ParkingSession[] {
    return mockSessions.filter(s => {
        const entryDate = new Date(s.entryTime);
        return entryDate >= startDate && entryDate <= endDate;
    });
}

// Helper: Calculate revenue
export function calculateRevenue(sessions: ParkingSession[]): number {
    return sessions
        .filter(s => s.paymentStatus === 'paid')
        .reduce((sum, s) => sum + s.fee, 0);
}