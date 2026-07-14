"use client";

import * as React from "react";

export interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, hint, error, children, className = "" }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="block text-sm font-semibold text-primary mb-1.5">{label}</span>}
      {children}
      {hint && !error && <span className="block text-xs text-text-muted mt-1">{hint}</span>}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-primary outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 ${props.className || ""}`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-primary outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 ${props.className || ""}`}
    />
  );
}

export function Select({ children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 ${rest.className || ""}`}
    >
      {children}
    </select>
  );
}

export interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: React.ReactNode;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3"
    >
      <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-primary" : "bg-slate-300"}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${checked ? "translate-x-5" : "translate-x-1"}`} />
      </span>
      {label && <span className="text-sm font-medium text-primary">{label}</span>}
    </button>
  );
}
