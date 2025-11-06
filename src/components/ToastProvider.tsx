"use client";
import React, { createContext, useCallback, useContext, useState, type ReactNode } from "react";
// Diagnostics: log React reference to debug 'React is not defined' runtime error.
if (typeof React === 'undefined') {
  // This should never happen under automatic runtime; helps pinpoint bundler issue.
  console.error('[ToastProvider] React is undefined at module init');
} else {
  // Uncomment for verbose tracing if needed.
  // console.log('[ToastProvider] React OK:', Object.keys(React));
}

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
                {toast.type === "success" ? "âœ…" : toast.type === "error" ? "âš ï¸" : toast.type === "warning" ? "âš ï¸" : "â„¹ï¸"}
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm text-gray-800 font-medium">{toast.message}</p>
              </div>
              <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Chiudi">
                âœ–ï¸
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

