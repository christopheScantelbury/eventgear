'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

const toastStyles: Record<ToastType, { wrap: string; icon: ReactNode }> = {
  success: {
    wrap: 'bg-status-available/10 border-status-available/30 border-l-[3px] border-l-status-available text-green-200',
    icon: <CheckCircle size={18} className="shrink-0 mt-0.5 text-status-available" />,
  },
  error: {
    wrap: 'bg-status-lost/10 border-status-lost/30 border-l-[3px] border-l-status-lost text-red-200',
    icon: <AlertCircle size={18} className="shrink-0 mt-0.5 text-status-lost" />,
  },
  info: {
    wrap: 'bg-status-maintenance/10 border-status-maintenance/30 border-l-[3px] border-l-status-maintenance text-blue-200',
    icon: <Info size={18} className="shrink-0 mt-0.5 text-status-maintenance" />,
  },
  warning: {
    wrap: 'bg-amber-500/10 border-amber-500/30 border-l-[3px] border-l-amber-500 text-amber-200',
    icon: <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-500" />,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-2 sm:px-0">
        {toasts.map((t) => {
          const style = toastStyles[t.type];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'flex items-start gap-3 rounded-lg px-4 py-3 shadow-xl text-sm font-medium border',
                'bg-dark-800',
                'animate-in slide-in-from-right-5',
                style.wrap,
              )}
            >
              {style.icon}
              <span className="flex-1 text-text-primary">{t.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
