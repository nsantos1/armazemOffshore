"use client";

import * as React from "react";
import { Icon } from "@/components/icons";

export interface EmptyStateProps {
  icon?: string;
  title: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "Inbox", title, hint, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-soft text-primary">
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-primary">{title}</h3>
      {hint && <p className="mt-1 text-sm text-text-muted">{hint}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
