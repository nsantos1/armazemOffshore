"use client";

import { Icon } from "@/components/icons";
import { useLang } from "@/lib/i18n";
import type { Base } from "@/lib/types";

export interface InteractiveMapProps {
  bases: Base[];
  activeId: string | null;
}

// Mapa controlado externamente pelos cards de endereço (ver Contact.tsx).
export function InteractiveMap({ bases, activeId }: InteractiveMapProps) {
  const { t } = useLang();
  const list = bases && bases.length ? bases : [];
  const active = list.find(b => b.id === activeId) || list[0];
  if (!active) return null;
  const q = encodeURIComponent(active.mapQuery || active.address || active.city);
  const src = `https://www.google.com/maps?q=${q}&output=embed&z=17`;
  return (
    <div className="mt-6 rounded-xl overflow-hidden border border-white/10 bg-white/5">
      <div className="flex items-center gap-2 px-4 py-3 bg-primary-900/60 border-b border-white/10">
        <Icon name="Navigation" className="w-4 h-4 text-accent" />
        <span className="font-bold text-white text-sm">{active.label} · {active.city}</span>
        <span className="hidden sm:inline text-white/40">|</span>
        <span className="hidden sm:inline text-xs text-white/70 truncate flex-1">{active.address}</span>
        <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noreferrer"
           className="ml-auto sm:ml-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:text-accent">
          <Icon name="ExternalLink" className="w-3.5 h-3.5" /> {t("contact.openMaps")}
        </a>
      </div>
      <div className="aspect-[16/9] bg-slate-200">
        <iframe
          key={active.id}
          title={`${t("contact.mapTitle")} — ${active.label}`}
          src={src}
          className="w-full h-full block"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>
  );
}
