// lib/utils/index.ts

// Validation utilities
export {
  validateLicensePlate,
  validatePhoneNumber,
  validateEmail,
  validateStudentId,
  validateStaffId,
  validateExpiryDate,
  validateOwnerName,
  validateVehicleForm,
  hasValidationErrors,
  formatPhoneNumber,
  normalizeLicensePlate,
  levenshteinDistance,
} from './validation';

export type { ValidationResult, ValidationErrors } from './validation';

// Storage utilities
export {
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  clearAllStorage,
  createDebouncedSave,
  getStorageInfo,
  formatBytes,
  setupStorageSync,
  createBackup,
  getLatestBackup,
  getAllBackups,
  checkDataVersion,
  updateLastSync,
  getLastSync,
  STORAGE_KEYS,
} from './storage';

export type { BackupData } from './storage';

// Generator utilities
export {
  generateVehicleId,
  generateSessionId,
  generateExceptionId,
  generateUniqueId,
  formatDateCompact,
  formatDateDisplay,
  formatDateTimeDisplay,
  formatTimeDisplay,
  calculateDuration,
  formatDuration,
  formatCurrency,
  formatNumber,
  generateRandomVisitorPlate,
  generateRandomConfidence,
  getCurrentISOString,
  getDateDaysAgo,
  getDateMonthsFromNow,
  isToday,
  isOvernightParking,
  simulateNetworkDelay,
  getHourString,
  getDayHours,
  chunkArray,
} from './generators';

// Export utilities
export {
  objectsToCSV,
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportVehicles,
  exportSessions,
  exportExceptions,
  generateRevenueReport,
} from './export';

// Image utilities
export {
  getRandomEntryImage,
  getRandomExitImage,
  getRandomExceptionRawImage,
  getRandomExceptionProcessedImage,
  getFallbackImage,
  isValidImagePath,
  getEntryImage,
  getExitImage,
  getExceptionRawImage,
  getExceptionProcessedImage,
} from './image-helpers';
