"use client";

import * as React from "react";

export type ButtonVariant =
  | "primary" | "accent" | "ghost" | "outline" | "danger" | "dangerGhost" | "soft" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function Button({
  as: Comp = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const v: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white hover:bg-primary-700",
    accent: "bg-accent text-primary hover:bg-accent-600 font-bold",
    ghost: "bg-transparent text-primary hover:bg-primary/5",
    outline: "border border-primary/20 text-primary hover:bg-primary/5",
    danger: "bg-red-600 text-white hover:bg-red-700",
    dangerGhost: "text-red-600 hover:bg-red-50",
    soft: "bg-bg-soft text-primary hover:bg-slate-200",
    dark: "bg-primary-900 text-white hover:bg-primary-800",
  };
  const s: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };
  return (
    <Comp
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${v[variant]} ${s[size]} ${className}`}
      {...rest}
    >
      {children}
    </Comp>
  );
}
