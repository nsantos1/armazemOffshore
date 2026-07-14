"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { uid } from "@/lib/storage";

export type ToastType = "success" | "error" | "info";
export type ToastFn = (message: string, type?: ToastType) => void;

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

const ToastCtx = React.createContext<ToastFn | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = React.useState<ToastItem[]>([]);
  const push = React.useCallback<ToastFn>((message, type = "success") => {
    const id = uid();
    setList(l => [...l, { id, message, type }]);
    setTimeout(() => setList(l => l.filter(t => t.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-[min(360px,calc(100%-2rem))]">
        {list.map(t => {
          const icon = t.type === "error" ? "AlertCircle" : t.type === "info" ? "Info" : "CheckCircle2";
          const bar = t.type === "error" ? "bg-red-500" : t.type === "info" ? "bg-primary" : "bg-emerald-500";
          return (
            <div key={t.id} className="toast-enter flex items-start gap-3 rounded-lg bg-white shadow-deep border border-slate-200 overflow-hidden">
              <span className={`w-1 self-stretch ${bar}`} />
              <span className="py-3"><Icon name={icon} className="w-5 h-5 text-primary" /></span>
              <p className="flex-1 py-3 pr-4 text-sm text-primary">{t.message}</p>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = (): ToastFn => {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>");
  return ctx;
};
