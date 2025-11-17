// lib/mock-data/vehicles.ts

import { Vehicle } from '@/types/database';
import {
    generateVietnameseName,
    generateLicensePlate,
    generatePhoneNumber,
    generateEmail,
    generateStudentId,
    generateStaffId,
    generateVehicleModel,
    getRandomItem,
    getRandomDate,
} from './generators';
import { COLORS, DEPARTMENTS } from '../constants';

function generateVehicle(type: Vehicle['type'], index: number): Vehicle {
    const name = generateVietnameseName();
    const isStudent = type === 'registered_monthly';
    const registrationDate = getRandomDate(
        new Date(2024, 0, 1),
        new Date(2024, 10, 1)
    );

    const expiryDate = new Date(registrationDate);
    expiryDate.setMonth(expiryDate.getMonth() + (type === 'registered_monthly' ? 6 : 12));

    return {
        id: `VH-${type.substring(0, 3).toUpperCase()}-${String(index).padStart(4, '0')}`,
        licensePlate: generateLicensePlate('hanoi'),
        type,
        ownerName: name,
        phoneNumber: generatePhoneNumber(),
        email: generateEmail(name, isStudent),
        studentId: isStudent ? generateStudentId() : undefined,
        staffId: type === 'registered_staff' ? generateStaffId() : undefined,
        department: type === 'registered_staff' ? getRandomItem(DEPARTMENTS) : undefined,
        registrationDate: registrationDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        isActive: Math.random() > 0.05, // 95% active
        vehicleModel: generateVehicleModel(),
        color: getRandomItem(COLORS),
        notes: Math.random() > 0.8 ? 'Xe đã đăng ký từ năm trước' : undefined,
        createdAt: registrationDate.toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

// Generate 300 registered vehicles
export const mockVehicles: Vehicle[] = [
    // 200 sinh viên thuê bao
    ...Array.from({ length: 200 }, (_, i) =>
        generateVehicle('registered_monthly', i + 1)
    ),

    // 100 CBGV
    ...Array.from({ length: 100 }, (_, i) =>
        generateVehicle('registered_staff', i + 1)
    ),
];

// Helper function để lấy vehicle by license plate
export function getVehicleByPlate(licensePlate: string): Vehicle | undefined {
    return mockVehicles.find(v => v.licensePlate === licensePlate);
}

// Helper function để search vehicles
export function searchVehicles(query: string): Vehicle[] {
    const q = query.toLowerCase();
    return mockVehicles.filter(v =>
        v.licensePlate.toLowerCase().includes(q) ||
        v.ownerName.toLowerCase().includes(q) ||
        v.studentId?.toLowerCase().includes(q) ||
        v.staffId?.toLowerCase().includes(q)
    );
}