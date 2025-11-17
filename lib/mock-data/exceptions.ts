// lib/mock-data/exceptions.ts

import { LPRException } from '@/types/database';
import { getRandomItem, getBusinessHourTime } from './generators';
import { PARKING_CONFIG } from '../constants';

function generateException(index: number, isPending: boolean): LPRException {
    const timestamp = getBusinessHourTime(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000));

    const errorTypes = ['no_detection', 'low_confidence', 'damaged_plate', 'obscured', 'system_error'] as const;
    const errorType = getRandomItem(errorTypes);

    const confidence = errorType === 'low_confidence'
        ? 40 + Math.random() * 35  // 40-75
        : errorType === 'no_detection'
            ? 0
            : 20 + Math.random() * 30; // 20-50

    const detectedPlate = errorType !== 'no_detection' && Math.random() > 0.3
        ? `29X${Math.floor(Math.random() * 2) === 0 ? 'I' : '1'}-${Math.floor(10000 + Math.random() * 90000)}` // Lỗi phổ biến: nhầm I và 1
        : undefined;

    const priority = confidence < 20 ? 'urgent'
        : errorType === 'system_error' ? 'high'
            : !detectedPlate ? 'high'
                : confidence < 60 ? 'medium'
                    : 'low';

    const resolvedAt = !isPending
        ? new Date(timestamp.getTime() + (5 + Math.random() * 55) * 60 * 1000) // 5-60 phút
        : undefined;

    return {
        id: `EX-${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(index).padStart(4, '0')}`,
        sessionId: `SS-${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(timestamp.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
        timestamp: timestamp.toISOString(),
        gate: getRandomItem(PARKING_CONFIG.GATES),
        direction: getRandomItem(['entry', 'exit'] as const),

        rawImage: `/mock-images/exception-raw-${Math.floor(Math.random() * 30) + 1}.jpg`,
        processedImage: `/mock-images/exception-processed-${Math.floor(Math.random() * 30) + 1}.jpg`,
        detectedPlate,
        confidence,
        errorType,

        status: isPending ? 'pending' : (Math.random() > 0.9 ? 'escalated' : 'resolved'),
        resolvedPlate: !isPending ? `29X1-${Math.floor(10000 + Math.random() * 90000)}` : undefined,
        resolvedBy: !isPending ? `operator_${Math.floor(Math.random() * 5) + 1}` : undefined,
        resolvedAt: resolvedAt?.toISOString(),
        resolutionMethod: !isPending
            ? getRandomItem(['manual_input', 'image_enhancement', 'video_review', 'denied_entry'] as const)
            : undefined,
        resolutionNotes: !isPending && Math.random() > 0.7
            ? 'Biển số bị bẩn, đã xác nhận qua video'
            : undefined,

        priority,
        queuePosition: isPending ? Math.floor(Math.random() * 20) + 1 : undefined,
    };
}

// Generate exceptions
export const mockExceptions: LPRException[] = [
    // 15 pending exceptions
    ...Array.from({ length: 15 }, (_, i) => generateException(i + 1, true)),

    // 100 resolved exceptions (last 7 days)
    ...Array.from({ length: 100 }, (_, i) => generateException(i + 16, false)),
];

// Helper: Get pending exceptions sorted by priority
export function getPendingExceptions(): LPRException[] {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return mockExceptions
        .filter(e => e.status === 'pending')
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// Helper: Get exceptions by date range
export function getExceptionsByDateRange(startDate: Date, endDate: Date): LPRException[] {
    return mockExceptions.filter(e => {
        const exceptionDate = new Date(e.timestamp);
        return exceptionDate >= startDate && exceptionDate <= endDate;
    });
}