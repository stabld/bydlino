"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, AlertCircle, Info } from "lucide-react";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; text: string };

const ToastContext = createContext<(text: string, kind?: ToastKind) => void>(() => {});

/** Krátká hláška v dolní části obrazovky. Používej pro potvrzení akcí a chyby. */
export function useToast() {
  return useContext(ToastContext);
}

const ICONS = { success: Check, error: AlertCircle, info: Info } as const;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((text: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, kind, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-6"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.kind];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="pointer-events-auto flex w-full max-w-xs items-center gap-2.5 rounded-2xl border border-line bg-surface2 px-4 py-3 shadow-card"
              >
                <Icon
                  className={
                    "h-4 w-4 shrink-0 " +
                    (toast.kind === "error"
                      ? "text-danger"
                      : toast.kind === "success"
                        ? "text-success"
                        : "text-accent")
                  }
                  strokeWidth={2.25}
                />
                <span className="text-sm text-fg">{toast.text}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
