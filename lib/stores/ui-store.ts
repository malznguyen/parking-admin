// lib/stores/ui-store.ts

import { create } from 'zustand';
import { generateUniqueId } from '@/lib/utils/generators';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface Modals {
  vehicleDetail: {
    isOpen: boolean;
    vehicleId: string | null;
  };
  vehicleForm: {
    isOpen: boolean;
    mode: 'create' | 'edit';
    vehicleId?: string;
  };
  sessionDetail: {
    isOpen: boolean;
    sessionId: string | null;
  };
  exceptionDetail: {
    isOpen: boolean;
    exceptionId: string | null;
  };
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  };
}

interface UIStore {
  // Modal State
  modals: Modals;

  // Toast State
  toasts: Toast[];

  // Loading State
  globalLoading: boolean;
  loadingMessage: string;

  // Modal Actions
  openModal: <K extends keyof Modals>(modalName: K, data?: Partial<Modals[K]>) => void;
  closeModal: (modalName: keyof Modals) => void;
  closeAllModals: () => void;

  // Toast Actions
  showToast: (toast: Omit<Toast, 'id'>) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;

  // Toast Shortcuts
  showSuccess: (message: string, action?: Toast['action']) => void;
  showError: (message: string, action?: Toast['action']) => void;
  showWarning: (message: string, action?: Toast['action']) => void;
  showInfo: (message: string, action?: Toast['action']) => void;

  // Loading Actions
  setGlobalLoading: (loading: boolean, message?: string) => void;

  // Confirm Dialog Helper
  showConfirmDialog: (options: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
  }) => void;
}

const initialModals: Modals = {
  vehicleDetail: {
    isOpen: false,
    vehicleId: null,
  },
  vehicleForm: {
    isOpen: false,
    mode: 'create',
    vehicleId: undefined,
  },
  sessionDetail: {
    isOpen: false,
    sessionId: null,
  },
  exceptionDetail: {
    isOpen: false,
    exceptionId: null,
  },
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Xác nhận',
    cancelLabel: 'Hủy',
    variant: 'info',
    onConfirm: () => {},
  },
};

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial State
  modals: initialModals,
  toasts: [],
  globalLoading: false,
  loadingMessage: '',

  // Modal Actions
  openModal: (modalName, data = {}) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: {
          ...state.modals[modalName],
          ...data,
          isOpen: true,
        },
      },
    }));
  },

  closeModal: (modalName) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: {
          ...initialModals[modalName],
          isOpen: false,
        },
      },
    }));
  },

  closeAllModals: () => {
    set({ modals: initialModals });
  },

  // Toast Actions
  showToast: (toastData) => {
    const id = generateUniqueId();
    const toast: Toast = {
      id,
      ...toastData,
    };

    set((state) => {
      // Keep max 5 toasts
      const newToasts = [...state.toasts, toast].slice(-5);
      return { toasts: newToasts };
    });

    // Auto-dismiss
    if (toast.duration > 0) {
      setTimeout(() => {
        get().hideToast(id);
      }, toast.duration);
    }

    return id;
  },

  hideToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },

  // Toast Shortcuts
  showSuccess: (message, action) => {
    get().showToast({
      type: 'success',
      message,
      duration: 4000,
      action,
    });
  },

  showError: (message, action) => {
    get().showToast({
      type: 'error',
      message,
      duration: 8000,
      action,
    });
  },

  showWarning: (message, action) => {
    get().showToast({
      type: 'warning',
      message,
      duration: 6000,
      action,
    });
  },

  showInfo: (message, action) => {
    get().showToast({
      type: 'info',
      message,
      duration: 4000,
      action,
    });
  },

  // Loading Actions
  setGlobalLoading: (loading, message = '') => {
    set({
      globalLoading: loading,
      loadingMessage: message,
    });
  },

  // Confirm Dialog Helper
  showConfirmDialog: ({
    title,
    message,
    onConfirm,
    confirmLabel = 'Xác nhận',
    cancelLabel = 'Hủy',
    variant = 'info',
  }) => {
    set((state) => ({
      modals: {
        ...state.modals,
        confirmDialog: {
          isOpen: true,
          title,
          message,
          confirmLabel,
          cancelLabel,
          variant,
          onConfirm,
        },
      },
    }));
  },
}));
