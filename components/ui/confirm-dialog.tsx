'use client';

import { useUIStore } from '@/lib/stores';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const iconMap = {
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const buttonColorMap = {
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  info: 'bg-blue-600 hover:bg-blue-700 text-white',
};

const iconColorMap = {
  danger: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export function ConfirmDialog() {
  const modals = useUIStore((state) => state.modals);
  const closeModal = useUIStore((state) => state.closeModal);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const { isOpen, title, message, confirmLabel, cancelLabel, variant, onConfirm } =
    modals.confirmDialog;

  if (!isOpen) return null;

  const Icon = iconMap[variant];

  const handleConfirm = () => {
    onConfirm();
    closeModal('confirmDialog');
  };

  const handleCancel = () => {
    closeModal('confirmDialog');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 p-2 rounded-full bg-opacity-10 ${variant === 'danger' ? 'bg-red-100' : variant === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}
            >
              <Icon className={`w-6 h-6 ${iconColorMap[variant]}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${buttonColorMap[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
