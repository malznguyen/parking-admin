// lib/utils/validation.ts

import { Vehicle, VehicleType } from '@/types/database';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

// License Plate Validation - Vietnamese Format
export function validateLicensePlate(plate: string): ValidationResult {
  if (!plate || plate.trim() === '') {
    return { isValid: false, error: 'Biển số xe không được để trống' };
  }

  const cleanPlate = plate.trim().toUpperCase();

  // Vietnamese motorcycle plate format: XX[X]-XXXXX or XXX[X]-XXXXX
  // Examples: 29A-12345, 29X1-12345, 30B-98765
  const plateRegex = /^[0-9]{2}[A-Z][0-9]?-[0-9]{5}$/;

  if (!plateRegex.test(cleanPlate)) {
    return {
      isValid: false,
      error: 'Biển số không đúng định dạng (VD: 29A-12345 hoặc 29X1-12345)'
    };
  }

  return { isValid: true };
}

// Phone Number Validation - Vietnamese Format
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Số điện thoại không được để trống' };
  }

  const cleanPhone = phone.replace(/\s|-/g, '');

  // Vietnamese phone number: 10 digits starting with 0
  // Common prefixes: 09x, 08x, 07x, 03x, 05x
  const phoneRegex = /^(0)(3[2-9]|5[2-9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;

  if (!phoneRegex.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)'
    };
  }

  return { isValid: true };
}

// Email Validation
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: true }; // Email is optional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Email không hợp lệ' };
  }

  return { isValid: true };
}

// Student ID Validation - HAUI Format
export function validateStudentId(id: string): ValidationResult {
  if (!id || id.trim() === '') {
    return { isValid: false, error: 'Mã số sinh viên không được để trống' };
  }

  // Format: YYYYXXXXX (year 2015-2025 + 5 digits)
  const studentIdRegex = /^(201[5-9]|202[0-5])[0-9]{5}$/;

  if (!studentIdRegex.test(id.trim())) {
    return {
      isValid: false,
      error: 'Mã SV không hợp lệ (VD: 202012345)'
    };
  }

  return { isValid: true };
}

// Staff ID Validation
export function validateStaffId(id: string): ValidationResult {
  if (!id || id.trim() === '') {
    return { isValid: false, error: 'Mã cán bộ không được để trống' };
  }

  // Format: GV-XXXX or NV-XXXX
  const staffIdRegex = /^(GV|NV)-[0-9]{4}$/;

  if (!staffIdRegex.test(id.trim().toUpperCase())) {
    return {
      isValid: false,
      error: 'Mã CB không hợp lệ (VD: GV-0001 hoặc NV-0123)'
    };
  }

  return { isValid: true };
}

// Expiry Date Validation
export function validateExpiryDate(date: string): ValidationResult {
  if (!date) {
    return { isValid: false, error: 'Ngày hết hạn không được để trống' };
  }

  const expiryDate = new Date(date);
  const now = new Date();

  if (isNaN(expiryDate.getTime())) {
    return { isValid: false, error: 'Ngày không hợp lệ' };
  }

  if (expiryDate <= now) {
    return { isValid: false, error: 'Ngày hết hạn phải sau ngày hiện tại' };
  }

  return { isValid: true };
}

// Owner Name Validation
export function validateOwnerName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Họ tên không được để trống' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 3) {
    return { isValid: false, error: 'Họ tên phải có ít nhất 3 ký tự' };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Họ tên không được quá 50 ký tự' };
  }

  return { isValid: true };
}

// Complete Vehicle Form Validation
export function validateVehicleForm(data: Partial<Vehicle>): ValidationErrors {
  const errors: ValidationErrors = {};

  // License Plate (required)
  const plateResult = validateLicensePlate(data.licensePlate || '');
  if (!plateResult.isValid) {
    errors.licensePlate = plateResult.error!;
  }

  // Owner Name (required)
  const nameResult = validateOwnerName(data.ownerName || '');
  if (!nameResult.isValid) {
    errors.ownerName = nameResult.error!;
  }

  // Phone Number (required)
  const phoneResult = validatePhoneNumber(data.phoneNumber || '');
  if (!phoneResult.isValid) {
    errors.phoneNumber = phoneResult.error!;
  }

  // Email (optional)
  if (data.email) {
    const emailResult = validateEmail(data.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error!;
    }
  }

  // Student ID (required for registered_monthly)
  if (data.type === 'registered_monthly') {
    const studentIdResult = validateStudentId(data.studentId || '');
    if (!studentIdResult.isValid) {
      errors.studentId = studentIdResult.error!;
    }
  }

  // Staff ID (required for registered_staff)
  if (data.type === 'registered_staff') {
    const staffIdResult = validateStaffId(data.staffId || '');
    if (!staffIdResult.isValid) {
      errors.staffId = staffIdResult.error!;
    }
  }

  // Expiry Date (required for registered types)
  if (data.type !== 'visitor' && data.expiryDate) {
    const expiryResult = validateExpiryDate(data.expiryDate);
    if (!expiryResult.isValid) {
      errors.expiryDate = expiryResult.error!;
    }
  }

  // Vehicle Model (optional, max 50 chars)
  if (data.vehicleModel && data.vehicleModel.length > 50) {
    errors.vehicleModel = 'Model xe không được quá 50 ký tự';
  }

  return errors;
}

// Check if validation errors exist
export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

// Format Vietnamese phone number for display
export function formatPhoneNumber(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }
  return phone;
}

// Normalize license plate for comparison
export function normalizeLicensePlate(plate: string): string {
  return plate.trim().toUpperCase().replace(/\s/g, '');
}

// Calculate Levenshtein distance for similar plate suggestions
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}
