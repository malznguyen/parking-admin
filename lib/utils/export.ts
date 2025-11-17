// lib/utils/export.ts

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Vehicle, ParkingSession, LPRException } from '@/types/database';
import {
  formatDateDisplay,
  formatDateTimeDisplay,
  formatCurrency,
  formatDuration,
} from './generators';

// Helper to add BOM for UTF-8 CSV
const BOM = '\uFEFF';

// Convert array of objects to CSV string
export function objectsToCSV(data: Record<string, unknown>[], headers?: Record<string, string>): string {
  if (data.length === 0) return '';

  const keys = Object.keys(data[0]);
  const headerRow = headers
    ? keys.map((key) => headers[key] || key)
    : keys;

  const csvRows = [headerRow.join(',')];

  for (const obj of data) {
    const values = keys.map((key) => {
      const value = obj[key];
      // Escape quotes and wrap in quotes if contains comma or quotes
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }

  return BOM + csvRows.join('\n');
}

// Export to CSV file
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  headers?: Record<string, string>
): void {
  const csv = objectsToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${filename}.csv`);
}

// Export to Excel file
export function exportToExcel(
  data: Record<string, unknown>[],
  filename: string,
  sheetName: string = 'Data',
  headers?: Record<string, string>
): void {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();

  // Transform data with headers
  let transformedData = data;
  if (headers) {
    transformedData = data.map((row) => {
      const newRow: Record<string, unknown> = {};
      for (const key of Object.keys(row)) {
        const headerName = headers[key] || key;
        newRow[headerName] = row[key];
      }
      return newRow;
    });
  }

  const ws = XLSX.utils.json_to_sheet(transformedData);

  // Auto-size columns
  const colWidths = Object.keys(transformedData[0] || {}).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...transformedData.map((row) => String(row[key] ?? '').length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Write file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// Export to PDF file
export function exportToPDF(
  data: Record<string, unknown>[],
  title: string,
  headers?: Record<string, string>,
  options?: {
    orientation?: 'portrait' | 'landscape';
    subtitle?: string;
  }
): void {
  const doc = new jsPDF({
    orientation: options?.orientation || 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 20);

  // Add subtitle if provided
  if (options?.subtitle) {
    doc.setFontSize(12);
    doc.text(options.subtitle, 14, 28);
  }

  // Add date
  doc.setFontSize(10);
  doc.text(`Xuất ngày: ${formatDateTimeDisplay(new Date())}`, 14, options?.subtitle ? 35 : 28);

  // Prepare table data
  const keys = Object.keys(data[0] || {});
  const tableHeaders = headers
    ? keys.map((key) => headers[key] || key)
    : keys;

  const tableData = data.map((row) => keys.map((key) => String(row[key] ?? '')));

  // Add table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: options?.subtitle ? 40 : 32,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
  });

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Trang ${i} / ${pageCount}`,
      doc.internal.pageSize.getWidth() - 25,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Save file
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

// Helper function to download file
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export Vehicles
export function exportVehicles(
  vehicles: Vehicle[],
  format: 'csv' | 'excel' | 'pdf' = 'excel'
): void {
  const headers: Record<string, string> = {
    id: 'Mã xe',
    licensePlate: 'Biển số',
    type: 'Loại',
    ownerName: 'Chủ xe',
    phoneNumber: 'Số điện thoại',
    email: 'Email',
    studentId: 'MSSV',
    staffId: 'Mã CB',
    department: 'Đơn vị',
    registrationDate: 'Ngày đăng ký',
    expiryDate: 'Ngày hết hạn',
    isActive: 'Trạng thái',
    vehicleModel: 'Model',
    color: 'Màu sắc',
  };

  const typeMap: Record<string, string> = {
    registered_monthly: 'Sinh viên',
    registered_staff: 'Cán bộ',
    visitor: 'Khách',
  };

  const data = vehicles.map((v) => ({
    id: v.id,
    licensePlate: v.licensePlate,
    type: typeMap[v.type] || v.type,
    ownerName: v.ownerName,
    phoneNumber: v.phoneNumber,
    email: v.email || '',
    studentId: v.studentId || '',
    staffId: v.staffId || '',
    department: v.department || '',
    registrationDate: formatDateDisplay(v.registrationDate),
    expiryDate: formatDateDisplay(v.expiryDate),
    isActive: v.isActive ? 'Hoạt động' : 'Vô hiệu',
    vehicleModel: v.vehicleModel || '',
    color: v.color || '',
  }));

  const filename = `DanhSachXe_${new Date().toISOString().slice(0, 10)}`;

  switch (format) {
    case 'csv':
      exportToCSV(data, filename, headers);
      break;
    case 'excel':
      exportToExcel(data, filename, 'Danh sách xe', headers);
      break;
    case 'pdf':
      exportToPDF(data, 'Danh sách xe đăng ký', headers, {
        subtitle: 'Hệ thống quản lý bãi đỗ xe - ĐH Công nghiệp Hà Nội',
      });
      break;
  }
}

// Export Sessions
export function exportSessions(
  sessions: ParkingSession[],
  format: 'csv' | 'excel' | 'pdf' = 'excel',
  dateRange?: { start: Date; end: Date }
): void {
  const headers: Record<string, string> = {
    id: 'Mã phiên',
    licensePlate: 'Biển số',
    vehicleType: 'Loại xe',
    entryTime: 'Giờ vào',
    entryGate: 'Cổng vào',
    exitTime: 'Giờ ra',
    exitGate: 'Cổng ra',
    parkingDuration: 'Thời gian đỗ',
    fee: 'Phí (VND)',
    paymentStatus: 'Thanh toán',
    paymentMethod: 'Phương thức',
    isOvernight: 'Qua đêm',
  };

  const typeMap: Record<string, string> = {
    registered_monthly: 'Sinh viên',
    registered_staff: 'Cán bộ',
    visitor: 'Khách',
  };

  const statusMap: Record<string, string> = {
    unpaid: 'Chưa thanh toán',
    paid: 'Đã thanh toán',
    exempted: 'Miễn phí',
  };

  const methodMap: Record<string, string> = {
    cash: 'Tiền mặt',
    momo: 'MoMo',
    banking: 'Chuyển khoản',
    card: 'Thẻ',
    free: 'Miễn phí',
  };

  // Filter by date range if provided
  let filteredSessions = sessions;
  if (dateRange) {
    filteredSessions = sessions.filter((s) => {
      const entryTime = new Date(s.entryTime);
      return entryTime >= dateRange.start && entryTime <= dateRange.end;
    });
  }

  const data = filteredSessions.map((s) => ({
    id: s.id,
    licensePlate: s.licensePlate,
    vehicleType: typeMap[s.vehicleType] || s.vehicleType,
    entryTime: formatDateTimeDisplay(s.entryTime),
    entryGate: `Cổng ${s.entryGate}`,
    exitTime: s.exitTime ? formatDateTimeDisplay(s.exitTime) : 'Đang đỗ',
    exitGate: s.exitGate ? `Cổng ${s.exitGate}` : '-',
    parkingDuration: s.parkingDuration
      ? formatDuration(s.parkingDuration)
      : '-',
    fee: formatCurrency(s.fee),
    paymentStatus: statusMap[s.paymentStatus] || s.paymentStatus,
    paymentMethod: s.paymentMethod
      ? methodMap[s.paymentMethod] || s.paymentMethod
      : '-',
    isOvernight: s.isOvernight ? 'Có' : 'Không',
  }));

  const filename = `PhienDoXe_${new Date().toISOString().slice(0, 10)}`;
  const subtitle = dateRange
    ? `Từ ${formatDateDisplay(dateRange.start)} đến ${formatDateDisplay(dateRange.end)}`
    : 'Tất cả phiên đỗ xe';

  switch (format) {
    case 'csv':
      exportToCSV(data, filename, headers);
      break;
    case 'excel':
      exportToExcel(data, filename, 'Phiên đỗ xe', headers);
      break;
    case 'pdf':
      exportToPDF(data, 'Báo cáo phiên đỗ xe', headers, {
        subtitle,
        orientation: 'landscape',
      });
      break;
  }
}

// Export Exceptions
export function exportExceptions(
  exceptions: LPRException[],
  format: 'csv' | 'excel' | 'pdf' = 'excel'
): void {
  const headers: Record<string, string> = {
    id: 'Mã ngoại lệ',
    timestamp: 'Thời gian',
    gate: 'Cổng',
    direction: 'Hướng',
    detectedPlate: 'Biển phát hiện',
    confidence: 'Độ tin cậy',
    errorType: 'Loại lỗi',
    status: 'Trạng thái',
    resolvedPlate: 'Biển đã sửa',
    resolvedBy: 'Người xử lý',
    resolvedAt: 'Thời gian xử lý',
    resolutionMethod: 'Phương pháp',
    priority: 'Độ ưu tiên',
  };

  const errorTypeMap: Record<string, string> = {
    no_detection: 'Không nhận diện',
    low_confidence: 'Độ tin cậy thấp',
    damaged_plate: 'Biển hỏng',
    obscured: 'Bị che khuất',
    system_error: 'Lỗi hệ thống',
  };

  const statusMap: Record<string, string> = {
    pending: 'Chờ xử lý',
    resolved: 'Đã xử lý',
    escalated: 'Chuyển cấp cao',
  };

  const methodMap: Record<string, string> = {
    manual_input: 'Nhập thủ công',
    image_enhancement: 'Tăng cường ảnh',
    video_review: 'Xem video',
    denied_entry: 'Từ chối',
  };

  const priorityMap: Record<string, string> = {
    urgent: 'Khẩn cấp',
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp',
  };

  const data = exceptions.map((e) => ({
    id: e.id,
    timestamp: formatDateTimeDisplay(e.timestamp),
    gate: `Cổng ${e.gate}`,
    direction: e.direction === 'entry' ? 'Vào' : 'Ra',
    detectedPlate: e.detectedPlate || '-',
    confidence: `${e.confidence}%`,
    errorType: errorTypeMap[e.errorType] || e.errorType,
    status: statusMap[e.status] || e.status,
    resolvedPlate: e.resolvedPlate || '-',
    resolvedBy: e.resolvedBy || '-',
    resolvedAt: e.resolvedAt ? formatDateTimeDisplay(e.resolvedAt) : '-',
    resolutionMethod: e.resolutionMethod
      ? methodMap[e.resolutionMethod] || e.resolutionMethod
      : '-',
    priority: priorityMap[e.priority] || e.priority,
  }));

  const filename = `NgoaiLe_${new Date().toISOString().slice(0, 10)}`;

  switch (format) {
    case 'csv':
      exportToCSV(data, filename, headers);
      break;
    case 'excel':
      exportToExcel(data, filename, 'Ngoại lệ', headers);
      break;
    case 'pdf':
      exportToPDF(data, 'Báo cáo ngoại lệ LPR', headers, {
        subtitle: 'Hệ thống quản lý bãi đỗ xe - ĐH Công nghiệp Hà Nội',
        orientation: 'landscape',
      });
      break;
  }
}

// Generate Revenue Report
export function generateRevenueReport(
  sessions: ParkingSession[],
  dateRange: { start: Date; end: Date },
  format: 'csv' | 'excel' | 'pdf' = 'pdf'
): void {
  const filteredSessions = sessions.filter((s) => {
    if (!s.paymentTime) return false;
    const paymentTime = new Date(s.paymentTime);
    return paymentTime >= dateRange.start && paymentTime <= dateRange.end;
  });

  // Group by date
  const dailyRevenue: Record<string, { revenue: number; count: number }> = {};

  filteredSessions.forEach((s) => {
    const date = new Date(s.paymentTime!).toISOString().slice(0, 10);
    if (!dailyRevenue[date]) {
      dailyRevenue[date] = { revenue: 0, count: 0 };
    }
    dailyRevenue[date].revenue += s.fee;
    dailyRevenue[date].count++;
  });

  const headers: Record<string, string> = {
    date: 'Ngày',
    count: 'Số lượt',
    revenue: 'Doanh thu (VND)',
    average: 'TB/lượt (VND)',
  };

  const data = Object.entries(dailyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stats]) => ({
      date: formatDateDisplay(date),
      count: stats.count,
      revenue: formatCurrency(stats.revenue),
      average: formatCurrency(Math.round(stats.revenue / stats.count)),
    }));

  // Add total row
  const totalRevenue = Object.values(dailyRevenue).reduce(
    (sum, d) => sum + d.revenue,
    0
  );
  const totalCount = Object.values(dailyRevenue).reduce(
    (sum, d) => sum + d.count,
    0
  );

  data.push({
    date: 'TỔNG CỘNG',
    count: totalCount,
    revenue: formatCurrency(totalRevenue),
    average: formatCurrency(Math.round(totalRevenue / (totalCount || 1))),
  });

  const filename = `BaoCaoDoanhThu_${formatDateDisplay(dateRange.start)}_${formatDateDisplay(dateRange.end)}`;
  const subtitle = `Từ ${formatDateDisplay(dateRange.start)} đến ${formatDateDisplay(dateRange.end)}`;

  switch (format) {
    case 'csv':
      exportToCSV(data, filename, headers);
      break;
    case 'excel':
      exportToExcel(data, filename, 'Doanh thu', headers);
      break;
    case 'pdf':
      exportToPDF(data, 'Báo cáo doanh thu', headers, {
        subtitle,
        orientation: 'portrait',
      });
      break;
  }
}
