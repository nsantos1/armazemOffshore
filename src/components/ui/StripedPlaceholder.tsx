"use client";

import * as React from "react";

export interface StripedPlaceholderProps {
  label?: React.ReactNode;
  hue?: number;
  className?: string;
  children?: React.ReactNode;
}

// Placeholder listrado e sutil, usado quando não há imagem enviada (capas, banners, logos).
export function StripedPlaceholder({ label, hue = 210, className = "", children }: StripedPlaceholderProps) {
  const bg = `repeating-linear-gradient(135deg, oklch(0.32 0.06 ${hue}) 0 14px, oklch(0.30 0.06 ${hue}) 14px 28px)`;
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: `oklch(0.30 0.06 ${hue})`, backgroundImage: bg }}
    >
      {children}
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-[.2em] text-white/70 px-2 py-1 rounded bg-black/20 backdrop-blur-[1px]">{label}</span>
        </div>
      )}
    </div>
  );
}
