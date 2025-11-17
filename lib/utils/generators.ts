// lib/utils/generators.ts

import { v4 as uuidv4 } from 'uuid';
import { VehicleType } from '@/types/database';

// Generate vehicle ID
export function generateVehicleId(type: VehicleType, existingIds: string[] = []): string {
  const typeMap: Record<VehicleType, string> = {
    registered_monthly: 'REG',
    registered_staff: 'STF',
    visitor: 'VIS',
  };

  const prefix = `VH-${typeMap[type]}-`;

  // Find the highest existing number
  const existingNumbers = existingIds
    .filter(id => id.startsWith(prefix))
    .map(id => parseInt(id.replace(prefix, ''), 10))
    .filter(num => !isNaN(num));

  const nextNumber = existingNumbers.length > 0
    ? Math.max(...existingNumbers) + 1
    : 1;

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

// Generate session ID
export function generateSessionId(date: Date = new Date()): string {
  const dateStr = formatDateCompact(date);
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `SS-${dateStr}-${random}`;
}

// Generate exception ID
export function generateExceptionId(date: Date = new Date()): string {
  const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `EX-${yearMonth}-${random}`;
}

// Generate unique ID (for general use)
export function generateUniqueId(): string {
  return uuidv4();
}

// Format date as YYYYMMDD
export function formatDateCompact(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
}

// Format date for display
export function formatDateDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Format datetime for display
export function formatDateTimeDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format time only
export function formatTimeDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Calculate parking duration in minutes
export function calculateDuration(entryTime: Date | string, exitTime: Date | string): number {
  const entry = typeof entryTime === 'string' ? new Date(entryTime) : entryTime;
  const exit = typeof exitTime === 'string' ? new Date(exitTime) : exitTime;
  return Math.floor((exit.getTime() - entry.getTime()) / (1000 * 60));
}

// Format duration for display (minutes to readable format)
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} phút`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} giờ`;
  }

  return `${hours} giờ ${remainingMinutes} phút`;
}

// Format currency (VND)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format number with thousand separators
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

// Generate random visitor plate (for simulation)
export function generateRandomVisitorPlate(): string {
  const provinces = ['30', '31', '32', '33', '34', '35', '36', '17', '18', '19', '20'];
  const letters = 'ABCDEFGHKLMNPRSTUVWXYZ'; // Exclude I, O, Q

  const province = provinces[Math.floor(Math.random() * provinces.length)];
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const number = Math.floor(Math.random() * 99999).toString().padStart(5, '0');

  return `${province}${letter}-${number}`;
}

// Generate random confidence score
export function generateRandomConfidence(): number {
  // Weighted towards high confidence (80-100)
  const rand = Math.random();
  if (rand < 0.7) {
    // 70% chance: high confidence (85-100)
    return Math.floor(85 + Math.random() * 15);
  } else if (rand < 0.9) {
    // 20% chance: medium confidence (60-84)
    return Math.floor(60 + Math.random() * 24);
  } else {
    // 10% chance: low confidence (30-59)
    return Math.floor(30 + Math.random() * 29);
  }
}

// Get ISO string for current time
export function getCurrentISOString(): string {
  return new Date().toISOString();
}

// Get date X days ago
export function getDateDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Get date X months from now
export function getDateMonthsFromNow(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

// Check if date is today
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

// Check if time is overnight (between 23:00 and 05:00)
export function isOvernightParking(entryTime: Date | string, exitTime: Date | string): boolean {
  const entry = typeof entryTime === 'string' ? new Date(entryTime) : entryTime;
  const exit = typeof exitTime === 'string' ? new Date(exitTime) : exitTime;

  // If entry is before midnight and exit is after 5 AM next day
  const entryHour = entry.getHours();
  const exitHour = exit.getHours();
  const daysDiff = Math.floor((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff >= 1) return true;
  if (entryHour >= 23 && exitHour >= 5) return true;

  return false;
}

// Simulate network delay
export function simulateNetworkDelay(minMs: number = 200, maxMs: number = 500): Promise<void> {
  const delay = minMs + Math.random() * (maxMs - minMs);
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Get hour string (for charts)
export function getHourString(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

// Get array of hours for a day
export function getDayHours(): string[] {
  return Array.from({ length: 24 }, (_, i) => getHourString(i));
}

// Chunk array into smaller arrays
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
