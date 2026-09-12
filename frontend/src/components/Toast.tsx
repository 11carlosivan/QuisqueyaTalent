'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (item: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  showConfirm: (options: ConfirmDialogOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Emisor de eventos global para invocar toasts desde cualquier función o archivo sin necesidad de hooks
type ToastListener = (toast: Omit<ToastItem, 'id'>) => void;
type ConfirmListener = (options: ConfirmDialogOptions) => void;

let globalToastListener: ToastListener | null = null;
let globalConfirmListener: ConfirmListener | null = null;

export const toast = {
  success: (message: string, title?: string, duration?: number) => {
    if (globalToastListener) {
      globalToastListener({ type: 'success', message, title, duration });
    } else if (typeof window !== 'undefined') {
      console.log('Toast (success):', message);
    }
  },
  error: (message: string, title?: string, duration?: number) => {
    if (globalToastListener) {
      globalToastListener({ type: 'error', message, title, duration });
    } else if (typeof window !== 'undefined') {
      console.error('Toast (error):', message);
    }
  },
  warning: (message: string, title?: string, duration?: number) => {
    if (globalToastListener) {
      globalToastListener({ type: 'warning', message, title, duration });
    } else if (typeof window !== 'undefined') {
      console.warn('Toast (warning):', message);
    }
  },
  info: (message: string, title?: string, duration?: number) => {
    if (globalToastListener) {
      globalToastListener({ type: 'info', message, title, duration });
    } else if (typeof window !== 'undefined') {
      console.info('Toast (info):', message);
    }
  },
  confirm: (options: ConfirmDialogOptions) => {
    if (globalConfirmListener) {
      globalConfirmListener(options);
    } else if (typeof window !== 'undefined') {
      if (window.confirm(`${options.title ? options.title + '\n' : ''}${options.message}`)) {
        options.onConfirm();
      } else if (options.onCancel) {
        options.onCancel();
      }
    }
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastItem = { ...item, id };
      setToasts((prev) => [...prev.slice(-4), newToast]); // Mantener máximo 5 toasts simultáneos
      return id;
    },
    []
  );

  const showConfirm = useCallback((options: ConfirmDialogOptions) => {
    setConfirmDialog(options);
  }, []);

  useEffect(() => {
    globalToastListener = (item) => showToast(item);
    globalConfirmListener = (opts) => showConfirm(opts);

    // Interceptar llamadas nativas a window.alert para convertirlas en toasts estilizados automáticamente
    if (typeof window !== 'undefined') {
      const originalAlert = window.alert;
      window.alert = (msg?: any) => {
        const strMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);
        // Si el mensaje parece un error o advertencia, clasificamos acordemente
        const lower = strMsg.toLowerCase();
        if (lower.includes('error') || lower.includes('falló') || lower.includes('fallo') || lower.includes('inconveniente')) {
          toast.error(strMsg, 'Atención');
        } else if (lower.includes('éxito') || lower.includes('exito') || lower.includes('guardado') || lower.includes('vinculado') || lower.includes('cread')) {
          toast.success(strMsg, 'Excelente');
        } else if (lower.includes('aviso') || lower.includes('requiere') || lower.includes('por favor') || lower.includes('ingresa')) {
          toast.warning(strMsg, 'Aviso');
        } else {
          toast.info(strMsg, 'Notificación');
        }
      };

      return () => {
        globalToastListener = null;
        globalConfirmListener = null;
        window.alert = originalAlert;
      };
    }

    return () => {
      globalToastListener = null;
      globalConfirmListener = null;
    };
  }, [showToast, showConfirm]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, showConfirm }}>
      {children}

      {/* CONTENEDOR FLOTANTE DE TOASTS (TOP-RIGHT O TOP-CENTER) */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
        ))}
      </div>

      {/* MODAL DE CONFIRMACIÓN ESTILIZADO (Reemplazo de window.confirm) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                  confirmDialog.type === 'danger'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : confirmDialog.type === 'warning'
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}
              >
                {confirmDialog.type === 'danger' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : confirmDialog.type === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {confirmDialog.title || '¿Estás seguro de realizar esta acción?'}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (confirmDialog.onCancel) confirmDialog.onCancel();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
              >
                {confirmDialog.cancelText || 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await confirmDialog.onConfirm();
                  } finally {
                    setConfirmDialog(null);
                  }
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition cursor-pointer ${
                  confirmDialog.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : confirmDialog.type === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                }`}
              >
                {confirmDialog.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const duration = item.duration ?? 4500;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (duration <= 0) return;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const interval = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= step) {
            clearInterval(interval);
            onDismiss();
            return 0;
          }
          return prev - step;
        });
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [duration, isPaused, onDismiss]);

  const config = {
    success: {
      badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: CheckCircle2,
      border: 'border-emerald-500/30',
      progressBar: 'bg-emerald-500',
      glow: 'shadow-emerald-500/10',
      defaultTitle: '¡Operación Exitosa!',
    },
    error: {
      badgeBg: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      icon: AlertCircle,
      border: 'border-rose-500/30',
      progressBar: 'bg-rose-500',
      glow: 'shadow-rose-500/10',
      defaultTitle: 'Ha ocurrido un problema',
    },
    warning: {
      badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      icon: AlertTriangle,
      border: 'border-amber-500/30',
      progressBar: 'bg-amber-500',
      glow: 'shadow-amber-500/10',
      defaultTitle: 'Advertencia',
    },
    info: {
      badgeBg: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      icon: Sparkles,
      border: 'border-blue-500/30',
      progressBar: 'bg-blue-600',
      glow: 'shadow-blue-500/10',
      defaultTitle: 'Información',
    },
  }[item.type];

  const Icon = config.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto w-full bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl ${config.glow} border ${config.border} flex flex-col justify-between relative overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 animate-in slide-in-from-top-3 fade-in duration-200`}
    >
      <div className="flex items-start gap-3">
        {/* Icono temático */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${config.badgeBg}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Contenido del Toast */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="text-xs font-bold text-slate-900 tracking-tight leading-tight">
            {item.title || config.defaultTitle}
          </h4>
          <p className="text-[11.5px] text-slate-600 mt-1 leading-normal break-words">
            {item.message}
          </p>
        </div>

        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          title="Cerrar notificación"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Barra de progreso de auto-cierre */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
          <div
            className={`h-full ${config.progressBar} transition-all duration-75`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return toast;
  }
  return context;
};
