"use client";
import React, { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = { showToast: (message: string, type?: ToastType) => void };

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto animate-fade-in bg-white shadow-soft-xl rounded-soft-lg border-2 overflow-hidden max-w-sm"
            role={toast.type === "error" ? "alert" : "status"}
            aria-live={toast.type === "error" ? "assertive" : "polite"}
            aria-atomic="true"
            style={{
              borderColor:
                toast.type === "success" ? "#A6B5A0" : toast.type === "error" ? "#dc2626" : toast.type === "warning" ? "#f59e0b" : "#6b7280",
            }}
          >
            <div className="flex items-start gap-3 p-4">
              <div className="flex-shrink-0 text-2xl" aria-hidden>
                {toast.type === "success" ? "✅" : toast.type === "error" ? "⚠️" : toast.type === "warning" ? "⚠️" : "ℹ️"}
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm text-gray-800 font-medium">{toast.message}</p>
              </div>
              <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Chiudi">
                ✖️
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  return context ?? { showToast: () => {} };
}

