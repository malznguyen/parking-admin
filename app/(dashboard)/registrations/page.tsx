"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVehicleStore } from "@/lib/stores/vehicle-store";
import { useUIStore } from "@/lib/stores/ui-store";
import {
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Upload,
  Check,
  AlertCircle,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { addMonths, format } from "date-fns";
import { vi } from "date-fns/locale";

type RegistrationType = "student" | "staff" | null;
type PackageDuration = 1 | 3 | 6 | 12;

export default function RegistrationsPage() {
  const router = useRouter();
  const { checkDuplicatePlate, addVehicle, isLoading } = useVehicleStore();
  const { showError, showWarning } = useUIStore();

  const [registrationType, setRegistrationType] =
    useState<RegistrationType>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    department: "",
    phone: "",
    email: "",
    licensePlate: "",
    vehicleModel: "",
    vehicleColor: "",
  });
  const [selectedPackage, setSelectedPackage] = useState<PackageDuration>(6);
  const [plateCheckStatus, setPlateCheckStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const packages = [
    { duration: 1, price: 100000, label: "1 tháng" },
    { duration: 3, price: 290000, label: "3 tháng" },
    { duration: 6, price: 550000, label: "6 tháng", recommended: true },
    { duration: 12, price: 1000000, label: "12 tháng" },
  ];

  const checkPlateAvailability = () => {
    if (!formData.licensePlate) {
      showWarning("Vui lòng nhập biển số xe");
      return;
    }
    setPlateCheckStatus("checking");
    setTimeout(() => {
      const isDuplicate = checkDuplicatePlate(formData.licensePlate.toUpperCase());
      setPlateCheckStatus(isDuplicate ? "taken" : "available");
    }, 500);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên";
    }

    if (!formData.idNumber.trim()) {
      errors.idNumber = registrationType === "student"
        ? "Vui lòng nhập MSSV"
        : "Vui lòng nhập mã CBGV";
    }

    if (!formData.department) {
      errors.department = "Vui lòng chọn khoa/phòng ban";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0[0-9]{9,10})$/.test(formData.phone.replace(/\s/g, ""))) {
      errors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.licensePlate.trim()) {
      errors.licensePlate = "Vui lòng nhập biển số xe";
    } else if (!/^[0-9]{2}[A-Z][0-9]?-[0-9]{3,5}$/.test(formData.licensePlate.toUpperCase())) {
      errors.licensePlate = "Biển số không đúng định dạng (VD: 29X1-12345)";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!registrationType) return;

    // Validate form
    if (!validateForm()) {
      showError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Check duplicate plate
    if (checkDuplicatePlate(formData.licensePlate.toUpperCase())) {
      showError("Biển số xe đã tồn tại trong hệ thống");
      setPlateCheckStatus("taken");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate dates
      const registrationDate = new Date();
      const expiryDate = addMonths(registrationDate, selectedPackage);

      // Prepare vehicle data
      const vehicleData = {
        licensePlate: formData.licensePlate.toUpperCase(),
        type: registrationType === "student" ? "registered_monthly" as const : "registered_staff" as const,
        ownerName: formData.fullName,
        phoneNumber: formData.phone,
        email: formData.email || undefined,
        studentId: registrationType === "student" ? formData.idNumber : undefined,
        staffId: registrationType === "staff" ? formData.idNumber : undefined,
        department: formData.department,
        vehicleModel: formData.vehicleModel || undefined,
        color: formData.vehicleColor || undefined,
        registrationDate: registrationDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        isActive: true,
      };

      // Add vehicle to store
      await addVehicle(vehicleData);

      // Reset form
      setFormData({
        fullName: "",
        idNumber: "",
        department: "",
        phone: "",
        email: "",
        licensePlate: "",
        vehicleModel: "",
        vehicleColor: "",
      });
      setRegistrationType(null);
      setPlateCheckStatus("idle");
      setValidationErrors({});

      // Redirect to vehicles page after short delay
      setTimeout(() => {
        router.push("/vehicles");
      }, 1500);
    } catch (error) {
      // Error already shown by store
      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "licensePlate") {
      setPlateCheckStatus("idle");
    }
  };

  const startDate = new Date();
  const endDate = addMonths(startDate, selectedPackage);

  const registrationFee =
    registrationType === "student"
      ? packages.find((p) => p.duration === selectedPackage)?.price || 0
      : 0;
  const cardFee = 50000;
  const totalCost = registrationType === "student" ? registrationFee + cardFee : 0;

  return (
    <div className="space-y-6 animate-fade-scale-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-tight text-foreground">
            Đăng ký xe mới
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Đăng ký xe thuê bao tháng cho sinh viên và CBGV
          </p>
        </div>
        <Link href="/vehicles">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      {/* Registration Type Selection */}
      <div className="bg-white rounded-lg border border-border shadow-brutal-sm p-6">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Chọn loại đăng ký
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => setRegistrationType("student")}
            className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
              registrationType === "student"
                ? "border-primary bg-[#E0F7F4] shadow-glow-primary"
                : "border-border hover:border-primary hover:shadow-brutal"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#E0F2FE] rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-[#0EA5E9]" />
              </div>
              <h3 className="text-xl font-bold text-foreground">SINH VIÊN</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Thuê bao tháng
              </p>
              <div className="mt-4 text-center">
                <p className="font-mono text-2xl font-bold text-primary">
                  100,000đ
                </p>
                <p className="text-base text-muted-foreground">
                  /tháng
                </p>
              </div>
            </div>
            {registrationType === "student" && (
              <div className="absolute top-3 right-3">
                <Check className="h-6 w-6 text-primary" />
              </div>
            )}
          </button>

          <button
            onClick={() => setRegistrationType("staff")}
            className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
              registrationType === "staff"
                ? "border-primary bg-[#E0F7F4] shadow-glow-primary"
                : "border-border hover:border-primary hover:shadow-brutal"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-[#10B981]" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                CÁN BỘ GIẢNG VIÊN
              </h3>
              <p className="text-sm text-muted-foreground mt-2">Đăng ký dài hạn</p>
              <div className="mt-4 text-center">
                <p className="font-mono text-2xl font-bold text-[#10B981]">
                  Miễn phí
                </p>
              </div>
            </div>
            {registrationType === "staff" && (
              <div className="absolute top-3 right-3">
                <Check className="h-6 w-6 text-primary" />
              </div>
            )}
          </button>
        </div>
      </div>

      {registrationType && (
        <>
          {/* Owner Information */}
          <div className="bg-white rounded-lg border border-border shadow-brutal-sm p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-5">
              Thông tin chủ xe
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Họ và tên <span className="text-[#EF4444]">*</span>
                </label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className={`h-12 ${validationErrors.fullName ? "border-[#EF4444]" : ""}`}
                />
                {validationErrors.fullName && (
                  <p className="text-sm text-[#EF4444] mt-1">{validationErrors.fullName}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    {registrationType === "student" ? "MSSV" : "Mã CBGV"}{" "}
                    <span className="text-[#EF4444]">*</span>
                  </label>
                  <Input
                    value={formData.idNumber}
                    onChange={(e) =>
                      handleInputChange("idNumber", e.target.value)
                    }
                    placeholder={
                      registrationType === "student"
                        ? "SV2021xxxxx"
                        : "GV-xxxx"
                    }
                    className={`h-12 font-mono ${validationErrors.idNumber ? "border-[#EF4444]" : ""}`}
                  />
                  {validationErrors.idNumber && (
                    <p className="text-sm text-[#EF4444] mt-1">{validationErrors.idNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Khoa / Phòng ban <span className="text-[#EF4444]">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    className={`h-12 w-full rounded-md border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${validationErrors.department ? "border-[#EF4444]" : "border-border"}`}
                  >
                    <option value="">Chọn khoa</option>
                    <option value="cntt">Công nghệ thông tin</option>
                    <option value="dien">Điện</option>
                    <option value="dien-tu">Điện tử</option>
                    <option value="co-khi">Cơ khí</option>
                    <option value="kinh-te">Kinh tế</option>
                    <option value="ngoai-ngu">Ngoại ngữ</option>
                  </select>
                  {validationErrors.department && (
                    <p className="text-sm text-[#EF4444] mt-1">{validationErrors.department}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Số điện thoại <span className="text-[#EF4444]">*</span>
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="0912345678"
                    className={`h-12 font-mono ${validationErrors.phone ? "border-[#EF4444]" : ""}`}
                  />
                  {validationErrors.phone && (
                    <p className="text-sm text-[#EF4444] mt-1">{validationErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="an@student.haui.edu.vn"
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-white rounded-lg border border-border shadow-brutal-sm p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-5">
              Thông tin xe
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Biển số xe <span className="text-[#EF4444]">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.licensePlate}
                    onChange={(e) =>
                      handleInputChange(
                        "licensePlate",
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="29X1-12345"
                    className={`h-12 font-mono text-lg font-bold uppercase flex-1 ${validationErrors.licensePlate ? "border-[#EF4444]" : ""}`}
                  />
                  <Button
                    variant="outline"
                    onClick={checkPlateAvailability}
                    disabled={
                      !formData.licensePlate || plateCheckStatus === "checking"
                    }
                    className="h-12"
                  >
                    {plateCheckStatus === "checking"
                      ? "Đang kiểm tra..."
                      : "Kiểm tra trùng lặp"}
                  </Button>
                </div>
                {plateCheckStatus === "available" && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-[#10B981]">
                    <Check className="h-4 w-4" />
                    Biển số chưa đăng ký trong hệ thống
                  </div>
                )}
                {plateCheckStatus === "taken" && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-[#EF4444]">
                    <AlertCircle className="h-4 w-4" />
                    Biển số đã được đăng ký
                  </div>
                )}
                {validationErrors.licensePlate && (
                  <p className="text-sm text-[#EF4444] mt-1">{validationErrors.licensePlate}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Loại xe
                  </label>
                  <select
                    value={formData.vehicleModel}
                    onChange={(e) =>
                      handleInputChange("vehicleModel", e.target.value)
                    }
                    className="h-12 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Chọn loại xe</option>
                    <option value="Honda Wave">Honda Wave</option>
                    <option value="Honda Dream">Honda Dream</option>
                    <option value="Honda Vision">Honda Vision</option>
                    <option value="Honda Air Blade">Honda Air Blade</option>
                    <option value="Yamaha Exciter">Yamaha Exciter</option>
                    <option value="Yamaha Sirius">Yamaha Sirius</option>
                    <option value="Xe đạp điện">Xe đạp điện</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Màu xe
                  </label>
                  <select
                    value={formData.vehicleColor}
                    onChange={(e) =>
                      handleInputChange("vehicleColor", e.target.value)
                    }
                    className="h-12 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Chọn màu</option>
                    <option value="Đỏ">Đỏ</option>
                    <option value="Đen">Đen</option>
                    <option value="Trắng">Trắng</option>
                    <option value="Xanh">Xanh</option>
                    <option value="Vàng">Vàng</option>
                    <option value="Bạc">Bạc</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Upload ảnh xe (Tùy chọn)
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 bg-[#F8FAFB] hover:border-primary transition-colors cursor-pointer text-center">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <div className="text-sm text-muted-foreground">
                        Ảnh đã chọn
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setImagePreview(null)}
                      >
                        Xóa ảnh
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-[#94A3B8] mx-auto" />
                      <div className="mt-3 text-sm text-muted-foreground">
                        <span className="text-primary font-medium">
                          Chọn ảnh
                        </span>{" "}
                        hoặc kéo thả ảnh vào đây
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Package Selection (only for students) */}
          {registrationType === "student" && (
            <div className="bg-white rounded-lg border border-border shadow-brutal-sm p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-primary mb-5">
                Thời hạn đăng ký
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-4">
                  Gói đăng ký <span className="text-[#EF4444]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.duration}
                      onClick={() =>
                        setSelectedPackage(pkg.duration as PackageDuration)
                      }
                      className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedPackage === pkg.duration
                          ? "border-primary bg-[#E0F7F4]"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {pkg.recommended && (
                        <div className="absolute -top-2 -right-2">
                          <Badge className="bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]">
                            <Star className="h-3 w-3 mr-1" />
                            Best
                          </Badge>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground">
                          {pkg.label}
                        </div>
                        <div className="text-xl font-bold text-primary mt-2">
                          {(pkg.price / 1000).toFixed(0)}k
                        </div>
                      </div>
                      <div className="mt-3 flex justify-center">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            selectedPackage === pkg.duration
                              ? "border-primary bg-primary"
                              : "border-border"
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <div>
                  Ngày bắt đầu:{" "}
                  <span className="font-mono font-medium text-foreground">
                    {format(startDate, "dd/MM/yyyy", { locale: vi })}
                  </span>
                </div>
                <div>
                  Ngày hết hạn:{" "}
                  <span className="font-mono font-medium text-foreground">
                    {format(endDate, "dd/MM/yyyy", { locale: vi })} (
                    {selectedPackage} tháng)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cost Summary */}
          <div className="bg-[#E0F2FE]/30 rounded-lg border border-[#0EA5E9] p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[#075985] mb-4">
              Tổng chi phí
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Phí đăng ký:</span>
                <span className="font-mono font-medium text-foreground">
                  {registrationFee.toLocaleString("vi-VN")} đ
                </span>
              </div>
              {registrationType === "student" && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Phí phát hành thẻ:</span>
                  <span className="font-mono font-medium text-foreground">
                    {cardFee.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              )}
              <div className="border-t border-[#0EA5E9] pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-foreground">
                    TỔNG CỘNG:
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {totalCost.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              className="h-12 px-8"
              onClick={() => setRegistrationType(null)}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button
              className="h-12 px-8 bg-primary hover:bg-[#009B7D] text-white font-bold gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting || plateCheckStatus === "taken"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                "Đăng ký ngay"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
