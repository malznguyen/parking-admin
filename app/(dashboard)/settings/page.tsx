"use client";

import { useState } from "react";
import {
  Building2,
  DollarSign,
  DoorOpen,
  User,
  Bell,
  Lock,
  Database,
  Info,
  Save,
  RotateCcw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type SettingsSection =
  | "general"
  | "pricing"
  | "gates"
  | "account"
  | "notifications"
  | "security"
  | "backup"
  | "system";

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("general");

  const sections = [
    { key: "general", label: "Thông tin chung", icon: Building2 },
    { key: "pricing", label: "Bảng giá", icon: DollarSign },
    { key: "gates", label: "Quản lý cổng", icon: DoorOpen },
    { key: "account", label: "Tài khoản", icon: User },
    { key: "notifications", label: "Thông báo", icon: Bell },
    { key: "security", label: "Bảo mật", icon: Lock },
    { key: "backup", label: "Sao lưu", icon: Database },
    { key: "system", label: "Hệ thống", icon: Info },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-tight text-foreground">
              Thông tin chung
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Tên trường
                </label>
                <Input
                  defaultValue="Đại học Công nghiệp Hà Nội"
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Địa chỉ
                </label>
                <Input
                  defaultValue="298 Cầu Diễn, Bắc Từ Liêm, Hà Nội"
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Số điện thoại
                  </label>
                  <Input
                    defaultValue="024 3765 5121"
                    className="h-12 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    defaultValue="parking@haui.edu.vn"
                    className="h-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Tổng số chỗ đỗ xe
                </label>
                <Input
                  type="number"
                  defaultValue="500"
                  className="h-12 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Giờ mở cửa
                  </label>
                  <Input type="time" defaultValue="06:00" className="h-12" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Giờ đóng cửa
                  </label>
                  <Input type="time" defaultValue="22:00" className="h-12" />
                </div>
              </div>
            </div>
            <Button className="bg-primary hover:bg-[#009B7D] text-white gap-2">
              <Save className="h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        );

      case "pricing":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-tight text-foreground">
              Bảng giá đỗ xe
            </h2>
            <div className="space-y-6">
              <div className="border border-border rounded-lg p-4">
                <div className="text-sm font-bold text-foreground mb-4">
                  Xe vãng lai
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Giờ đầu tiên:
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue="5000"
                        className="h-10 w-32 font-mono text-right"
                      />
                      <span className="text-sm text-muted-foreground">đ</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Mỗi giờ tiếp theo:
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue="3000"
                        className="h-10 w-32 font-mono text-right"
                      />
                      <span className="text-sm text-muted-foreground">đ</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Phí qua đêm:
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue="20000"
                        className="h-10 w-32 font-mono text-right"
                      />
                      <span className="text-sm text-muted-foreground">đ</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="text-sm font-bold text-foreground mb-4">
                  Xe đăng ký (Sinh viên)
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      1 tháng:
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue="100000"
                        className="h-10 w-32 font-mono text-right"
                      />
                      <span className="text-sm text-muted-foreground">đ</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      6 tháng:
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue="550000"
                        className="h-10 w-32 font-mono text-right"
                      />
                      <span className="text-sm text-muted-foreground">đ</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="text-sm font-bold text-foreground mb-4">
                  Cán bộ giảng viên
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#D1FAE5] text-[#047857] border border-[#10B981]">
                    Miễn phí
                  </Badge>
                </div>
              </div>
            </div>
            <Button className="bg-primary hover:bg-[#009B7D] text-white gap-2">
              <Save className="h-4 w-4" />
              Cập nhật bảng giá
            </Button>
          </div>
        );

      case "gates":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-tight text-foreground">
              Quản lý cổng
            </h2>
            <div className="space-y-4">
              {["A", "B", "C", "D"].map((gate) => (
                <div
                  key={gate}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-foreground">
                        CỔNG {gate}
                      </span>
                      <Badge className="bg-[#D1FAE5] text-[#047857] border border-[#10B981]">
                        Hoạt động
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      Cài đặt
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#10B981]" />
                      <span className="text-foreground">Camera:</span>
                      <span className="text-muted-foreground">
                        OK (Uptime: 99.2%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#10B981]" />
                      <span className="text-foreground">Rào chắn:</span>
                      <span className="text-muted-foreground">
                        OK (Cycles: 1,247)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#10B981]" />
                      <span className="text-foreground">Cảm biến:</span>
                      <span className="text-muted-foreground">
                        OK (Last: 2 phút trước)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-tight text-foreground">
              Tài khoản
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#E0F7F4] rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <Button variant="outline">Thay đổi ảnh</Button>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Họ và tên
                </label>
                <Input defaultValue="Nguyễn Văn Admin" className="h-12" />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Email
                </label>
                <Input
                  defaultValue="admin@haui.edu.vn"
                  className="h-12"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Số điện thoại
                </label>
                <Input
                  defaultValue="0912345678"
                  className="h-12 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Vai trò
                </label>
                <Badge className="bg-[#E0F2FE] text-[#075985] border border-[#0EA5E9]">
                  Administrator
                </Badge>
              </div>
              <Button variant="outline" className="gap-2">
                <Lock className="h-4 w-4" />
                Đổi mật khẩu
              </Button>
            </div>
            <Button className="bg-primary hover:bg-[#009B7D] text-white gap-2">
              <Save className="h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-tight text-foreground">
              Thông báo
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium text-foreground">
                    Email thông báo
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Nhận thông báo qua email
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium text-foreground">SMS thông báo</div>
                  <div className="text-sm text-muted-foreground">
                    Nhận tin nhắn SMS
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Ngưỡng cảnh báo hàng đợi ngoại lệ
                </label>
                <Input
                  type="number"
                  defaultValue="10"
                  className="h-12 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Tần suất thông báo
                </label>
                <select className="h-12 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none">
                  <option value="immediate">Ngay lập tức</option>
                  <option value="hourly">Mỗi giờ</option>
                  <option value="daily">Hàng ngày</option>
                </select>
              </div>
            </div>
            <Button className="bg-primary hover:bg-[#009B7D] text-white gap-2">
              <Save className="h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-tight text-foreground">
              Bảo mật
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium text-foreground">
                    Xác thực hai yếu tố (2FA)
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Bảo vệ tài khoản với lớp bảo mật bổ sung
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Thời gian hết phiên
                </label>
                <select className="h-12 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none">
                  <option value="15">15 phút</option>
                  <option value="30">30 phút</option>
                  <option value="60">1 giờ</option>
                  <option value="240">4 giờ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  IP Whitelist (tùy chọn)
                </label>
                <Input
                  placeholder="192.168.1.0/24, 10.0.0.0/8"
                  className="h-12 font-mono"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Info className="h-4 w-4" />
                Xem nhật ký hoạt động
              </Button>
            </div>
            <Button className="bg-primary hover:bg-[#009B7D] text-white gap-2">
              <Save className="h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        );

      case "backup":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-tight text-foreground">
              Sao lưu dữ liệu
            </h2>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg bg-[#F8FAFB]">
                <div className="text-sm text-muted-foreground">
                  Sao lưu gần nhất:
                </div>
                <div className="font-mono font-medium text-foreground mt-1">
                  17/03/2025 03:00:00
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Tần suất sao lưu
                </label>
                <select className="h-12 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none">
                  <option value="daily">Hàng ngày</option>
                  <option value="weekly">Hàng tuần</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button className="bg-primary hover:bg-[#009B7D] text-white gap-2">
                  <Database className="h-4 w-4" />
                  Sao lưu ngay
                </Button>
                <Button variant="outline" className="gap-2">
                  <Database className="h-4 w-4" />
                  Tải xuống bản sao lưu
                </Button>
              </div>
            </div>
          </div>
        );

      case "system":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-tight text-foreground">
              Thông tin hệ thống
            </h2>
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-mono font-medium text-foreground">
                  v1.2.0
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Build:</span>
                <span className="font-mono font-medium text-foreground">
                  2024.03.15
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Server uptime:</span>
                <span className="font-mono font-medium text-foreground">
                  45 days 12:34:56
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Database size:</span>
                <span className="font-mono font-medium text-foreground">
                  2.4 GB
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total sessions:</span>
                <span className="font-mono font-medium text-foreground">
                  125,847
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total vehicles:</span>
                <span className="font-mono font-medium text-foreground">
                  1,234
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="gap-2 border-[#F59E0B] text-[#F59E0B] hover:bg-[#FEF3C7]"
            >
              <RotateCcw className="h-4 w-4" />
              Khởi động lại hệ thống
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-scale-in">
      <div className="mb-6">
        <h1 className="font-display text-3xl uppercase tracking-tight text-foreground">
          Cài đặt hệ thống
        </h1>
      </div>

      <div className="flex gap-6 min-h-[calc(100vh-200px)]">
        {/* Sidebar */}
        <div className="w-60 flex-shrink-0">
          <div className="bg-white rounded-lg border border-border shadow-brutal-sm overflow-hidden">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key as SettingsSection)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === section.key
                    ? "bg-[#E0F7F4] text-primary border-l-4 border-l-primary"
                    : "text-muted-foreground hover:bg-[#F8FAFB] hover:text-foreground border-l-4 border-l-transparent"
                }`}
              >
                <section.icon className="h-5 w-5" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-border shadow-brutal-sm p-6 max-w-3xl">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
