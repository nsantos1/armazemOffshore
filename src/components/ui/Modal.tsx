"use client";

import * as React from "react";
import { Icon } from "@/components/icons";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
}

export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  if (!open) return null;
  const sz: Record<ModalSize, string> = {
    sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-primary-900/60 backdrop-blur-sm" />
      <div onClick={e => e.stopPropagation()} className={`relative w-full ${sz[size]} rounded-xl bg-white shadow-deep animate-fadein`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-bold text-primary">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1.5 text-text-muted hover:bg-bg-soft" aria-label="Fechar">
            <Icon name="X" className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3 bg-bg-soft rounded-b-xl">{footer}</div>}
      </div>
    </div>
  );
}
