"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { Check, AlertTriangle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "warning" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id }]);

    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const styles = {
    success: {
      borderColor: "border-l-[#10B981]",
      icon: <Check className="h-5 w-5 text-[#10B981]" />,
    },
    warning: {
      borderColor: "border-l-[#F59E0B]",
      icon: <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />,
    },
    error: {
      borderColor: "border-l-[#EF4444]",
      icon: <X className="h-5 w-5 text-[#EF4444]" />,
    },
    info: {
      borderColor: "border-l-[#0EA5E9]",
      icon: <Info className="h-5 w-5 text-[#0EA5E9]" />,
    },
  };

  return (
    <div
      className={cn(
        "w-96 bg-white rounded-lg border border-border shadow-brutal-lg p-4 flex items-start gap-3 border-l-4 transition-all duration-300",
        styles[toast.type].borderColor,
        isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-full"
      )}
    >
      <div className="flex-shrink-0">{styles[toast.type].icon}</div>
      <div className="flex-1 text-sm font-medium text-foreground">
        {toast.message}
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Standalone toast notifications (without context)
export function ToastNotification({
  type,
  message,
  onClose,
}: {
  type: ToastType;
  message: string;
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: {
      borderColor: "border-l-[#10B981]",
      icon: <Check className="h-5 w-5 text-[#10B981]" />,
    },
    warning: {
      borderColor: "border-l-[#F59E0B]",
      icon: <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />,
    },
    error: {
      borderColor: "border-l-[#EF4444]",
      icon: <X className="h-5 w-5 text-[#EF4444]" />,
    },
    info: {
      borderColor: "border-l-[#0EA5E9]",
      icon: <Info className="h-5 w-5 text-[#0EA5E9]" />,
    },
  };

  return (
    <div
      className={cn(
        "fixed top-6 right-6 z-[100] w-96 bg-white rounded-lg border border-border shadow-brutal-lg p-4 flex items-start gap-3 border-l-4 transition-all duration-300",
        styles[type].borderColor,
        isVisible
          ? "opacity-100 translate-x-0 animate-slide-in-right"
          : "opacity-0 translate-x-full"
      )}
    >
      <div className="flex-shrink-0">{styles[type].icon}</div>
      <div className="flex-1 text-sm font-medium text-foreground">
        {message}
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
