'use client';

import React, { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 5;
const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }): ReactNode {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info'): void => {
      const id = crypto.randomUUID();

      setToasts((prev) => {
        const next = [...prev, { id, message, type }];

        // Keep at most MAX_TOASTS — drop oldest if exceeded
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
      });

      const timer = setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');

  return ctx;
}

// ─── Container ────────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<ToastType, { border: string; icon: string; label: string }> = {
  success: { border: 'border-green-500', icon: '✓', label: 'text-green-600' },
  error: { border: 'border-red-500', icon: '✕', label: 'text-red-600' },
  warning: { border: 'border-yellow-400', icon: '⚠', label: 'text-yellow-600' },
  info: { border: 'border-blue-500', icon: 'ℹ', label: 'text-blue-600' },
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps): ReactNode {
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed top-4 right-4 z-9999 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]"
    >
      {toasts.map((toast) => {
        const styles = TYPE_STYLES[toast.type];

        return (
          <div
            key={toast.id}
            role="alert"
            className={`flex items-start gap-3 bg-white rounded-lg shadow-lg border-l-4 px-4 py-3 ${styles.border} animate-in slide-in-from-right-4 duration-200`}
          >
            <span className={`text-lg font-bold shrink-0 ${styles.label}`}>{styles.icon}</span>
            <p className="flex-1 text-sm text-default-700 wrap-break-word">{toast.message}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 text-default-400 hover:text-default-700 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
