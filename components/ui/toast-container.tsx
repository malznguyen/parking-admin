'use client';

import { useUIStore } from '@/lib/stores';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);
  const hideToast = useUIStore((state) => state.hideToast);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`
              flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg
              transform transition-all duration-300 ease-out
              animate-in slide-in-from-right-5
              ${colorMap[toast.type]}
            `}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconColorMap[toast.type]}`} />
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className="mt-1 text-xs font-semibold underline hover:no-underline"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => hideToast(toast.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
