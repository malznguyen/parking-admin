"use client";

import { useState, useMemo, useEffect } from "react";
import { useExceptionStore } from "@/lib/stores/exception-store";
import { useVehicleStore } from "@/lib/stores/vehicle-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { LPRException } from "@/types/database";
import {
  AlertTriangle,
  Clock,
  Check,
  X,
  ZoomIn,
  ZoomOut,
  ArrowDown,
  ArrowUp,
  Camera,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";

export default function ExceptionsPage() {
  const {
    fetchExceptions,
    getPendingExceptions,
    resolveException,
    getSimilarPlates,
    setPriorityFilter: setStorePriorityFilter,
    setGateFilter: setStoreGateFilter,
    isLoading,
  } = useExceptionStore();
  const { vehicles } = useVehicleStore();
  const { showError, showWarning } = useUIStore();

  const [selectedException, setSelectedException] =
    useState<LPRException | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [gateFilter, setGateFilter] = useState<string>("all");
  const [manualPlate, setManualPlate] = useState("");
  const [notes, setNotes] = useState("");
  const [zoom, setZoom] = useState(1);
  const [isResolving, setIsResolving] = useState(false);

  // Fetch exceptions on mount
  useEffect(() => {
    fetchExceptions();
  }, [fetchExceptions]);

  // Update store filters when local state changes
  useEffect(() => {
    setStorePriorityFilter(priorityFilter as any);
  }, [priorityFilter, setStorePriorityFilter]);

  useEffect(() => {
    setStoreGateFilter(gateFilter as any);
  }, [gateFilter, setStoreGateFilter]);

  const pendingExceptions = useMemo(() => {
    return getPendingExceptions();
  }, [getPendingExceptions]);

  const handleConfirmOpen = async () => {
    if (!selectedException) return;

    if (!manualPlate.trim()) {
      showError("Vui lòng nhập biển số xe");
      return;
    }

    setIsResolving(true);
    try {
      await resolveException(selectedException.id, {
        resolvedPlate: manualPlate.toUpperCase(),
        method: "manual_input",
        notes: notes || undefined,
        action: "allow",
      });

      // Clear form and selection
      setManualPlate("");
      setNotes("");
      setSelectedException(null);
    } catch (error) {
      // Error already shown by store
      console.error("Resolution failed:", error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleDeny = async () => {
    if (!selectedException) return;

    setIsResolving(true);
    try {
      await resolveException(selectedException.id, {
        resolvedPlate: manualPlate.toUpperCase() || "DENIED",
        method: "denied_entry",
        notes: notes || "Từ chối vào/ra bãi",
        action: "deny",
      });

      // Clear form and selection
      setManualPlate("");
      setNotes("");
      setSelectedException(null);
    } catch (error) {
      // Error already shown by store
      console.error("Denial failed:", error);
    } finally {
      setIsResolving(false);
    }
  };

  const getPriorityBadge = (priority: LPRException["priority"]) => {
    const styles = {
      urgent: "bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]",
      high: "bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]",
      medium: "bg-[#E0F2FE] text-[#075985] border-[#0EA5E9]",
      low: "bg-[#F1F5F9] text-[#475569] border-[#94A3B8]",
    };
    const labels = {
      urgent: "KHẨN CẤP",
      high: "CAO",
      medium: "TRUNG BÌNH",
      low: "THẤP",
    };
    return (
      <Badge className={`${styles[priority]} border text-[10px] font-bold`}>
        {labels[priority]}
      </Badge>
    );
  };

  const getPriorityBorderColor = (priority: LPRException["priority"]) => {
    const colors = {
      urgent: "border-l-[#EF4444]",
      high: "border-l-[#F59E0B]",
      medium: "border-l-[#0EA5E9]",
      low: "border-l-[#94A3B8]",
    };
    return colors[priority];
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence <= 40) return "text-[#EF4444]";
    if (confidence <= 70) return "text-[#F59E0B]";
    if (confidence <= 85) return "text-[#0EA5E9]";
    return "text-[#10B981]";
  };

  const getErrorDescription = (errorType: LPRException["errorType"]) => {
    const descriptions = {
      no_detection: "Không phát hiện biển số",
      low_confidence: "Độ tin cậy thấp",
      damaged_plate: "Biển số hư hỏng",
      obscured: "Biển số bị che khuất",
      system_error: "Lỗi hệ thống",
    };
    return descriptions[errorType];
  };

  // Get suggestions based on detected plate
  const suggestions = useMemo(() => {
    if (!selectedException?.detectedPlate) return [];
    const similarPlates = getSimilarPlates(selectedException.detectedPlate);
    return similarPlates.slice(0, 3).map((s) => ({
      plate: s.plate,
      description: `${s.vehicleType === "registered_monthly" ? "Xe đăng ký - SV" : "Xe đăng ký - CBGV"} ${s.ownerName?.split(" ").pop() || ""} [${s.confidence}%]`,
    }));
  }, [selectedException, getSimilarPlates]);

  return (
    <div className="space-y-6 animate-fade-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-tight text-foreground">
            Xử lý ngoại lệ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Xử lý các trường hợp camera không đọc được biển số
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#FEF3C7] border border-[#F59E0B] rounded-lg px-4 py-2">
          <Clock className="h-4 w-4 text-[#F59E0B]" />
          <span className="font-mono text-sm font-bold text-[#92400E]">
            Queue: {pendingExceptions.length} chờ xử lý
          </span>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[calc(100vh-220px)]">
        {/* Queue Panel - 60% */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-10 w-36 rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">Tất cả ưu tiên</option>
              <option value="urgent">Khẩn cấp</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
            <select
              value={gateFilter}
              onChange={(e) => setGateFilter(e.target.value)}
              className="h-10 w-36 rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">Tất cả cổng</option>
              <option value="A">Cổng A</option>
              <option value="B">Cổng B</option>
              <option value="C">Cổng C</option>
              <option value="D">Cổng D</option>
            </select>
          </div>

          {/* Exception Cards */}
          <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
            {pendingExceptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-border">
                <Check className="h-12 w-12 text-[#10B981]" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Không có ngoại lệ nào
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tất cả đã được xử lý
                </p>
              </div>
            ) : (
              pendingExceptions.map((exception) => (
                <div
                  key={exception.id}
                  onClick={() => {
                    setSelectedException(exception);
                    setManualPlate(exception.detectedPlate || "");
                    setNotes("");
                    setZoom(1);
                  }}
                  className={`bg-white rounded-lg border border-border shadow-brutal-sm p-5 cursor-pointer transition-all duration-200 hover:shadow-brutal hover:scale-[1.01] border-l-4 ${getPriorityBorderColor(exception.priority)} ${
                    selectedException?.id === exception.id
                      ? "ring-2 ring-primary bg-[#E0F7F4]/30"
                      : ""
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(exception.priority)}
                      <span className="text-sm font-semibold text-foreground">
                        CỔNG {exception.gate}
                      </span>
                      {exception.direction === "entry" ? (
                        <ArrowDown className="h-4 w-4 text-[#10B981]" />
                      ) : (
                        <ArrowUp className="h-4 w-4 text-[#EF4444]" />
                      )}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {format(new Date(exception.timestamp), "HH:mm:ss")}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex gap-4">
                    <div className="w-32 h-24 bg-[#F1F5F9] rounded-md border border-border flex items-center justify-center">
                      <Camera className="h-8 w-8 text-[#94A3B8]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-bold text-foreground">
                          {exception.detectedPlate || "???"}
                        </span>
                        <span
                          className={`font-mono text-sm font-bold ${getConfidenceColor(exception.confidence)}`}
                        >
                          [{Math.round(exception.confidence)}%]
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-sm text-[#F59E0B]">
                        <AlertTriangle className="h-4 w-4" />
                        {getErrorDescription(exception.errorType).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-[#009B7D] text-white font-bold uppercase text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedException(exception);
                        setManualPlate(exception.detectedPlate || "");
                      }}
                    >
                      Nhận xử lý
                    </Button>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(exception.timestamp), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel - 40% */}
        <div className="lg:col-span-2">
          {!selectedException ? (
            <div className="h-full bg-white rounded-lg border border-border flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-[#94A3B8]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Chưa chọn ngoại lệ nào
              </h3>
              <p className="mt-2 text-sm text-muted-foreground text-center">
                Chọn một ngoại lệ từ hàng đợi bên trái để xem chi tiết
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-border shadow-brutal-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold uppercase tracking-tight text-foreground">
                  Chi tiết ngoại lệ
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedException(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Image Viewer */}
              <div className="relative bg-[#F8FAFB] rounded-lg border-2 border-border overflow-hidden">
                <div
                  className="aspect-[4/3] flex items-center justify-center transition-transform duration-200"
                  style={{ transform: `scale(${zoom})` }}
                >
                  <Camera className="h-20 w-20 text-[#94A3B8]" />
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white"
                    onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white"
                    onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="border border-border rounded-lg p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Thông tin
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="font-mono font-medium text-foreground">
                      {format(
                        new Date(selectedException.timestamp),
                        "dd/MM/yyyy HH:mm:ss"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cổng:</span>
                    <span className="font-medium text-foreground">
                      Cổng {selectedException.gate} (
                      {selectedException.direction === "entry" ? "Vào" : "Ra"})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Biển phát hiện:
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {selectedException.detectedPlate || "Không xác định"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Độ tin cậy:</span>
                    <span
                      className={`font-mono font-bold ${getConfidenceColor(selectedException.confidence)}`}
                    >
                      {Math.round(selectedException.confidence)}%{" "}
                      {selectedException.confidence <= 40
                        ? "[THẤP]"
                        : selectedException.confidence <= 70
                          ? "[TRUNG BÌNH]"
                          : "[CAO]"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lỗi:</span>
                    <span className="font-medium text-[#F59E0B]">
                      {getErrorDescription(selectedException.errorType)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Manual Input */}
              <div className="border border-border rounded-lg p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Nhập biển số thủ công
                </div>
                <Input
                  value={manualPlate}
                  onChange={(e) =>
                    setManualPlate(e.target.value.toUpperCase())
                  }
                  placeholder="29X1-12345"
                  className="h-14 text-lg font-mono font-bold border-2 focus:border-primary uppercase"
                />

                {suggestions.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-2">
                      Gợi ý từ hệ thống:
                    </div>
                    <div className="space-y-2">
                      {suggestions.map((s) => (
                        <button
                          key={s.plate}
                          onClick={() => setManualPlate(s.plate)}
                          className="w-full flex items-center justify-between p-3 bg-[#F8FAFB] rounded-md hover:bg-[#E0F7F4] transition-colors text-left"
                        >
                          <span className="font-mono font-bold text-foreground">
                            {s.plate}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            [{s.description}]
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ghi chú (tùy chọn)"
                    className="w-full h-20 rounded-md border border-border bg-white px-3 py-2 text-sm resize-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    className="flex-1 h-12 bg-primary hover:bg-[#009B7D] text-white font-bold gap-2"
                    disabled={!manualPlate || isResolving}
                    onClick={handleConfirmOpen}
                  >
                    {isResolving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Xác nhận mở rào
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 border-[#EF4444] text-[#EF4444] hover:bg-[#FEE2E2] font-bold gap-2"
                    disabled={isResolving}
                    onClick={handleDeny}
                  >
                    {isResolving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Từ chối
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
