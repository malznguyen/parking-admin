"use client";

import { useState, useMemo } from "react";
import { mockVehicles, searchVehicles } from "@/lib/mock-data";
import { Vehicle } from "@/types/database";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  RefreshCw,
  Trash2,
  Car,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, differenceInDays, isPast } from "date-fns";
import { vi } from "date-fns/locale";

type TabType = "all" | "student" | "staff";

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Filter vehicles based on search and filters
  const filteredVehicles = useMemo(() => {
    let vehicles = searchQuery ? searchVehicles(searchQuery) : mockVehicles;

    // Filter by tab
    if (activeTab === "student") {
      vehicles = vehicles.filter((v) => v.type === "registered_monthly");
    } else if (activeTab === "staff") {
      vehicles = vehicles.filter((v) => v.type === "registered_staff");
    }

    // Filter by type dropdown
    if (selectedType !== "all") {
      vehicles = vehicles.filter((v) => v.type === selectedType);
    }

    // Filter by status
    if (selectedStatus === "active") {
      vehicles = vehicles.filter((v) => v.isActive);
    } else if (selectedStatus === "expired") {
      vehicles = vehicles.filter((v) => isPast(new Date(v.expiryDate)));
    } else if (selectedStatus === "expiring") {
      vehicles = vehicles.filter((v) => {
        const daysLeft = differenceInDays(
          new Date(v.expiryDate),
          new Date()
        );
        return daysLeft > 0 && daysLeft <= 30;
      });
    }

    return vehicles;
  }, [searchQuery, activeTab, selectedType, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: mockVehicles.length,
      student: mockVehicles.filter((v) => v.type === "registered_monthly")
        .length,
      staff: mockVehicles.filter((v) => v.type === "registered_staff").length,
    };
  }, []);

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysLeft = differenceInDays(expiry, now);

    if (daysLeft < 0) {
      return { text: "Hết hạn", color: "text-[#EF4444]", bgColor: "bg-[#FEE2E2]" };
    } else if (daysLeft <= 30) {
      return {
        text: format(expiry, "dd/MM/yy"),
        color: "text-[#F59E0B]",
        bgColor: "bg-[#FEF3C7]",
      };
    } else if (daysLeft > 365) {
      return { text: "Vĩnh viễn", color: "text-[#0EA5E9]", bgColor: "bg-[#E0F2FE]" };
    }
    return {
      text: format(expiry, "dd/MM/yy"),
      color: "text-[#10B981]",
      bgColor: "bg-[#D1FAE5]",
    };
  };

  const getTypeBadge = (type: Vehicle["type"]) => {
    if (type === "registered_monthly") {
      return (
        <Badge className="bg-[#E0F2FE] text-[#075985] border border-[#0EA5E9] hover:bg-[#E0F2FE]">
          SV Thuê bao
        </Badge>
      );
    } else if (type === "registered_staff") {
      return (
        <Badge className="bg-[#D1FAE5] text-[#047857] border border-[#10B981] hover:bg-[#D1FAE5]">
          CBGV
        </Badge>
      );
    }
    return (
      <Badge className="bg-[#F1F5F9] text-[#475569] border border-[#CBD5E0] hover:bg-[#F1F5F9]">
        Vãng lai
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-scale-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-tight text-foreground">
            Quản lý xe
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý toàn bộ xe đăng ký trong hệ thống
          </p>
        </div>
        <Button className="bg-primary hover:bg-[#009B7D] text-white shadow-brutal-sm gap-2">
          <Plus className="h-4 w-4" />
          Đăng ký xe mới
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm biển số, tên chủ xe, MSSV..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-12 pl-10 bg-white border-border focus:border-primary font-mono"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setCurrentPage(1);
          }}
          className="h-12 w-40 rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Loại xe</option>
          <option value="registered_monthly">SV Thuê bao</option>
          <option value="registered_staff">CBGV</option>
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="h-12 w-40 rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="expiring">Sắp hết hạn</option>
          <option value="expired">Đã hết hạn</option>
        </select>
        <Button
          variant="outline"
          className="h-12 gap-2 border-border hover:bg-secondary"
        >
          <Filter className="h-4 w-4" />
          Lọc
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-8">
          {[
            { key: "all", label: "Tất cả", count: counts.all },
            { key: "student", label: "SV Thuê bao", count: counts.student },
            { key: "staff", label: "CBGV", count: counts.staff },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as TabType);
                setCurrentPage(1);
              }}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label} ({tab.count})
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filteredVehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-border">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F1F5F9]">
            <Car className="h-10 w-10 text-[#94A3B8]" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Chưa có xe đăng ký nào
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Thêm xe đầu tiên của bạn
          </p>
          <Button className="mt-6 bg-primary hover:bg-[#009B7D] text-white gap-2">
            <Plus className="h-4 w-4" />
            Đăng ký xe mới
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-border shadow-brutal-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFB] border-b border-border">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#475569]">
                    Biển số
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#475569]">
                    Chủ xe
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#475569]">
                    Loại
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#475569]">
                    Hết hạn
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#475569]">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {paginatedVehicles.map((vehicle) => {
                  const expiryStatus = getExpiryStatus(vehicle.expiryDate);
                  return (
                    <tr
                      key={vehicle.id}
                      className="table-row-hover transition-all duration-200"
                    >
                      <td className="px-6 py-4">
                        <span className="license-plate text-base bg-[#FEF3C7] px-2 py-1 rounded">
                          {vehicle.licensePlate}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {vehicle.ownerName}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {vehicle.studentId || vehicle.staffId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getTypeBadge(vehicle.type)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-mono text-sm font-medium ${expiryStatus.color}`}
                        >
                          {expiryStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setShowDropdown(
                              showDropdown === vehicle.id ? null : vehicle.id
                            )
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {showDropdown === vehicle.id && (
                          <div className="absolute right-6 top-12 z-50 w-48 bg-white rounded-lg border border-border shadow-brutal-lg animate-fade-scale-in">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setSelectedVehicle(vehicle);
                                  setShowDetailModal(true);
                                  setShowDropdown(null);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-[#F8FAFB] transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                                Xem chi tiết
                              </button>
                              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-[#F8FAFB] transition-colors">
                                <Edit className="h-4 w-4" />
                                Chỉnh sửa
                              </button>
                              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-[#F8FAFB] transition-colors">
                                <RefreshCw className="h-4 w-4" />
                                Gia hạn
                              </button>
                              <div className="my-1 border-t border-border" />
                              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#EF4444] hover:bg-[#FEE2E2] transition-colors">
                                <Trash2 className="h-4 w-4" />
                                Vô hiệu hóa
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-border bg-[#F8FAFB]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm font-medium text-foreground">
              Page {currentPage}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl bg-white shadow-brutal-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-tight">
              Chi tiết xe đăng ký
            </DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="w-48 h-48 bg-[#F1F5F9] rounded-lg flex items-center justify-center border border-border">
                  <Car className="h-16 w-16 text-[#94A3B8]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Biển số xe
                  </div>
                  <div className="license-plate text-3xl mt-1">
                    {selectedVehicle.licensePlate}
                  </div>
                  <div className="mt-3">
                    {selectedVehicle.isActive ? (
                      <Badge className="bg-[#D1FAE5] text-[#047857] border border-[#10B981]">
                        Đang hoạt động
                      </Badge>
                    ) : (
                      <Badge className="bg-[#FEE2E2] text-[#991B1B] border border-[#EF4444]">
                        Không hoạt động
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Thông tin chủ xe
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Họ và tên:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {selectedVehicle.ownerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {selectedVehicle.type === "registered_monthly"
                        ? "MSSV:"
                        : "Mã CBGV:"}
                    </span>
                    <span className="ml-2 font-mono font-medium text-foreground">
                      {selectedVehicle.studentId || selectedVehicle.staffId}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Khoa:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {selectedVehicle.department || "Công nghệ thông tin"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SĐT:</span>
                    <span className="ml-2 font-mono font-medium text-foreground">
                      {selectedVehicle.phoneNumber}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {selectedVehicle.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Thông tin đăng ký
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Loại đăng ký:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {selectedVehicle.type === "registered_monthly"
                        ? "Sinh viên thuê bao tháng"
                        : "Cán bộ giảng viên"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ngày đăng ký:</span>
                    <span className="ml-2 font-mono font-medium text-foreground">
                      {format(
                        new Date(selectedVehicle.registrationDate),
                        "dd/MM/yyyy",
                        { locale: vi }
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ngày hết hạn:</span>
                    <span
                      className={`ml-2 font-mono font-medium ${
                        getExpiryStatus(selectedVehicle.expiryDate).color
                      }`}
                    >
                      {format(
                        new Date(selectedVehicle.expiryDate),
                        "dd/MM/yyyy",
                        { locale: vi }
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Xe:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {selectedVehicle.vehicleModel}, {selectedVehicle.color}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Lịch sử gần đây
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <ArrowDown className="h-4 w-4 text-[#10B981]" />
                    <span className="font-mono text-muted-foreground">
                      17/03/2025 14:23
                    </span>
                    <span className="text-foreground">Vào (Cổng A)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowUp className="h-4 w-4 text-[#EF4444]" />
                    <span className="font-mono text-muted-foreground">
                      17/03/2025 08:15
                    </span>
                    <span className="text-foreground">Ra (Cổng B)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowUp className="h-4 w-4 text-[#EF4444]" />
                    <span className="font-mono text-muted-foreground">
                      16/03/2025 18:30
                    </span>
                    <span className="text-foreground">Ra (Cổng A)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-primary text-primary hover:bg-[#E0F7F4]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Gia hạn
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  );
}
