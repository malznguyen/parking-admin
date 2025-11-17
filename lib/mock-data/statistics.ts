// lib/mock-data/statistics.ts

import { ParkingStatistics } from '@/types/database';
import { getSessionsByDateRange, calculateRevenue } from './sessions';
import { getExceptionsByDateRange } from './exceptions';

export function generateDailyStatistics(date: Date): ParkingStatistics {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const daySessions = getSessionsByDateRange(startOfDay, endOfDay);
    const dayExceptions = getExceptionsByDateRange(startOfDay, endOfDay);

    const registeredCount = daySessions.filter(s => s.vehicleType !== 'visitor').length;
    const visitorCount = daySessions.filter(s => s.vehicleType === 'visitor').length;
    const staffCount = daySessions.filter(s => s.vehicleType === 'registered_staff').length;

    // Calculate peak hour
    const hourCounts = new Array(24).fill(0);
    daySessions.forEach(s => {
        const hour = new Date(s.entryTime).getHours();
        hourCounts[hour]++;
    });
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

    const paidSessions = daySessions.filter(s => s.paymentStatus === 'paid');
    const revenue = {
        total: calculateRevenue(daySessions),
        cash: paidSessions.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.fee, 0),
        momo: paidSessions.filter(s => s.paymentMethod === 'momo').reduce((sum, s) => sum + s.fee, 0),
        banking: paidSessions.filter(s => s.paymentMethod === 'banking').reduce((sum, s) => sum + s.fee, 0),
        card: paidSessions.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.fee, 0),
    };

    const totalDuration = daySessions
        .filter(s => s.parkingDuration)
        .reduce((sum, s) => sum + (s.parkingDuration || 0), 0);
    const averageDuration = totalDuration / daySessions.filter(s => s.parkingDuration).length || 0;

    return {
        date: date.toISOString().split('T')[0],
        totalVehicles: daySessions.length,
        registeredVehicles: registeredCount,
        visitorVehicles: visitorCount,
        staffVehicles: staffCount,

        peakHour: `${peakHour}:00`,
        peakOccupancy: Math.max(...hourCounts),
        averageOccupancy: Math.floor(daySessions.length / 14), // Assuming 14 business hours

        revenue,

        exceptions: {
            total: dayExceptions.length,
            resolved: dayExceptions.filter(e => e.status === 'resolved').length,
            pending: dayExceptions.filter(e => e.status === 'pending').length,
        },

        averageParkingDuration: Math.floor(averageDuration),
        turnoverRate: daySessions.length / 500, // Total spots
    };
}

// Generate statistics for last 30 days
export const mockStatistics: ParkingStatistics[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return generateDailyStatistics(date);
});