// lib/mock-data/generators.ts

import { VIETNAMESE_NAMES, VEHICLE_BRANDS, COLORS, DEPARTMENTS } from '../constants';

export function generateVietnameseName(): string {
    const first = VIETNAMESE_NAMES.firstNames[Math.floor(Math.random() * VIETNAMESE_NAMES.firstNames.length)];
    const middle = VIETNAMESE_NAMES.middleNames[Math.floor(Math.random() * VIETNAMESE_NAMES.middleNames.length)];
    const last = VIETNAMESE_NAMES.lastNames[Math.floor(Math.random() * VIETNAMESE_NAMES.lastNames.length)];
    return `${first} ${middle} ${last}`;
}

export function generateLicensePlate(type: 'hanoi' | 'other' = 'hanoi'): string {
    if (type === 'hanoi') {
        // Biển số Hà Nội: 29, 30, 31, 32, 33, 40
        const hanoiCodes = ['29', '30', '31', '32', '33', '40'];
        const code = hanoiCodes[Math.floor(Math.random() * hanoiCodes.length)];
        const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
        const numbers = Math.floor(10000 + Math.random() * 90000); // 10000-99999
        return `${code}${letter}${letter === 'A' ? '1' : ''}-${numbers}`;
    } else {
        const code = Math.floor(10 + Math.random() * 90); // 10-99
        const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const numbers = Math.floor(10000 + Math.random() * 90000);
        return `${code}${letter}-${numbers}`;
    }
}

export function generatePhoneNumber(): string {
    const prefixes = ['091', '094', '088', '086', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(1000000 + Math.random() * 9000000);
    return `${prefix}${suffix}`;
}

export function generateEmail(name: string, isStudent: boolean): string {
    const nameParts = name.toLowerCase().split(' ');
    const lastName = nameParts[nameParts.length - 1];
    const firstInitial = nameParts[0][0];

    if (isStudent) {
        const studentNumber = Math.floor(100000 + Math.random() * 900000);
        return `${firstInitial}${lastName}${studentNumber}@student.haui.edu.vn`;
    } else {
        return `${firstInitial}${lastName}@haui.edu.vn`;
    }
}

export function generateStudentId(): string {
    // Format: 2021xxxxx (năm + 5 số)
    const year = 2020 + Math.floor(Math.random() * 5); // 2020-2024
    const number = Math.floor(10000 + Math.random() * 90000);
    return `${year}${number}`;
}

export function generateStaffId(): string {
    // Format: GV-xxxxx hoặc NV-xxxxx
    const type = Math.random() > 0.6 ? 'GV' : 'NV'; // 60% giảng viên, 40% nhân viên
    const number = Math.floor(1000 + Math.random() * 9000);
    return `${type}-${number}`;
}

export function generateVehicleModel(): string {
    const brand = VEHICLE_BRANDS[Math.floor(Math.random() * VEHICLE_BRANDS.length)];
    const models: Record<string, string[]> = {
        'Honda': ['Wave', 'Blade', 'Winner', 'Vision', 'SH', 'Air Blade'],
        'Yamaha': ['Sirius', 'Exciter', 'Janus', 'Grande', 'FreeGo'],
        'Suzuki': ['Raider', 'Satria', 'Impulse', 'Axelo'],
        'SYM': ['Attila', 'Galaxy', 'Elegant'],
        'Piaggio': ['Liberty', 'Vespa', 'Medley'],
        'Pega': ['Pega+', 'Pega Cap A'],
        'VinFast': ['Klara', 'Impes', 'Ludo', 'Theon'],
        'Yadea': ['Xmen', 'E3', 'E5'],
    };

    const modelList = models[brand] || ['Standard'];
    const model = modelList[Math.floor(Math.random() * modelList.length)];
    return `${brand} ${model}`;
}

export function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

export function getRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function getBusinessHourTime(date: Date): Date {
    // Random time between 7:00 - 20:00
    const hour = 7 + Math.floor(Math.random() * 13);
    const minute = Math.floor(Math.random() * 60);
    const newDate = new Date(date);
    newDate.setHours(hour, minute, 0, 0);
    return newDate;
}