// types/database.ts

export type VehicleType = 'registered_monthly' | 'registered_staff' | 'visitor';
export type PaymentStatus = 'unpaid' | 'paid' | 'exempted';
export type PaymentMethod = 'cash' | 'momo' | 'banking' | 'card' | 'free';
export type ExceptionStatus = 'pending' | 'resolved' | 'escalated';
export type LPRConfidence = 'high' | 'medium' | 'low' | 'failed';

export interface Vehicle {
    id: string;
    licensePlate: string;
    type: VehicleType;
    ownerName: string;
    phoneNumber: string;
    email?: string;
    studentId?: string;        // Nếu là sinh viên
    staffId?: string;          // Nếu là CBGV
    department?: string;       // Khoa/Phòng ban
    registrationDate: string;
    expiryDate: string;
    isActive: boolean;
    notes?: string;
    vehicleModel?: string;     // Xe máy/Xe đạp điện
    color?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ParkingSession {
    id: string;
    vehicleId?: string;        // null nếu là xe vãng lai
    licensePlate: string;
    vehicleType: VehicleType;

    // Entry info
    entryTime: string;
    entryGate: 'A' | 'B' | 'C' | 'D';  // 4 cổng HaUI
    entryImage: string;
    entryConfidence: LPRConfidence;
    entryOperator?: string;    // Nếu nhập thủ công

    // Exit info
    exitTime?: string;
    exitGate?: 'A' | 'B' | 'C' | 'D';
    exitImage?: string;
    exitConfidence?: LPRConfidence;
    exitOperator?: string;

    // Payment
    parkingDuration?: number;  // Phút
    fee: number;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    paymentTime?: string;

    // Status
    isOvernight: boolean;      // Qua đêm
    isException: boolean;      // Có lỗi xảy ra
    notes?: string;
}

export interface LPRException {
    id: string;
    sessionId?: string;
    timestamp: string;
    gate: 'A' | 'B' | 'C' | 'D';
    direction: 'entry' | 'exit';

    // LPR Info
    rawImage: string;
    processedImage?: string;
    detectedPlate?: string;
    confidence: number;        // 0-100
    errorType: 'no_detection' | 'low_confidence' | 'damaged_plate' | 'obscured' | 'system_error';

    // Resolution
    status: ExceptionStatus;
    resolvedPlate?: string;
    resolvedBy?: string;
    resolvedAt?: string;
    resolutionMethod?: 'manual_input' | 'image_enhancement' | 'video_review' | 'denied_entry';
    resolutionNotes?: string;

    // Priority
    priority: 'low' | 'medium' | 'high' | 'urgent';
    queuePosition?: number;
}

export interface ParkingStatistics {
    date: string;
    totalVehicles: number;
    registeredVehicles: number;
    visitorVehicles: number;
    staffVehicles: number;

    peakHour: string;
    peakOccupancy: number;
    averageOccupancy: number;

    revenue: {
        total: number;
        cash: number;
        momo: number;
        banking: number;
        card: number;
    };

    exceptions: {
        total: number;
        resolved: number;
        pending: number;
    };

    averageParkingDuration: number; // Phút
    turnoverRate: number;           // Số lần xe vào/ra trên mỗi chỗ
}

export interface SystemStatus {
    timestamp: string;
    gates: {
        id: 'A' | 'B' | 'C' | 'D';
        status: 'online' | 'offline' | 'maintenance';
        camera: {
            status: 'operational' | 'degraded' | 'offline';
            lastCheck: string;
            uptime: number; // Phần trăm
        };
        barrier: {
            status: 'operational' | 'stuck_open' | 'stuck_closed' | 'offline';
            lastCheck: string;
            cycleCount: number;
        };
        loopSensor: {
            status: 'operational' | 'faulty' | 'offline';
            lastTrigger: string;
        };
    }[];

    server: {
        cpu: number;
        memory: number;
        storage: number;
        uptime: string;
    };

    database: {
        status: 'healthy' | 'slow' | 'error';
        responseTime: number;
        lastBackup: string;
    };
}