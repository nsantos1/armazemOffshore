"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { StripedPlaceholder } from "@/components/ui/StripedPlaceholder";
import { useLang } from "@/lib/i18n";
import type { Banner, NavigateFn } from "@/lib/types";

export interface HeroProps {
  banners: Banner[];
  navigate: NavigateFn;
}

export function Hero({ banners, navigate }: HeroProps) {
  const { t } = useLang();
  const active = banners.filter(b => b.active);
  const list = active.length ? active : banners.slice(0, 1);
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setI(p => (p + 1) % list.length), 7000);
    return () => clearInterval(t);
  }, [list.length]);

  const b: Partial<Banner> = list[i] || { title: "", subtitle: "", ctaText: t("hero.cta"), ctaLink: "#contato", hue: 210 };

  const onCta = (e: React.MouseEvent) => {
    if (b.ctaLink && b.ctaLink.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(b.ctaLink);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-primary text-white">
      {/* background */}
      <div className="absolute inset-0">
        {b.image
          ? <img src={b.image} alt="" className="w-full h-full object-cover" />
          : <StripedPlaceholder hue={b.hue || 210} className="w-full h-full opacity-60" />
        }
        <div className={`absolute inset-0 ${b.image ? "bg-gradient-to-r from-primary/95 via-primary/70 to-primary/10" : "bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40"}`} />
        {/* faint grid */}
        <div className="absolute inset-0 opacity-[.04]"
             style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 lg:py-28">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1.5 text-xs font-medium tracking-wider uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            {t("hero.badge")}
          </div>
          <h1 className="mt-5 text-balance text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
            {b.title || t("hero.titleFallback")}
          </h1>
          <p className="mt-5 max-w-xl text-base sm:text-lg text-white/80 leading-relaxed">
            {b.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={b.ctaLink || "#contato"} onClick={onCta}>
              <Button variant="accent" size="lg"><Icon name="MessageSquare" className="w-5 h-5" />{b.ctaText || t("hero.cta")}</Button>
            </a>
            <a href="#solucoes" onClick={(e) => { e.preventDefault(); document.querySelector("#solucoes")?.scrollIntoView({ behavior: "smooth" }); }}>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                {t("hero.solutions")} <Icon name="ArrowRight" className="w-5 h-5" />
              </Button>
            </a>
          </div>

          {/* Stats strip */}
          <div className="mt-12 grid grid-cols-3 gap-px bg-white/10 ring-1 ring-white/10 rounded-lg overflow-hidden max-w-2xl">
            {[
              { k: "39+", v: t("hero.statYears") },
              { k: "3", v: t("hero.statBases") },
              { k: "ISO", v: t("hero.statIso") },
            ].map((s, idx) => (
              <div key={idx} className="bg-primary/80 px-4 py-4">
                <div className="text-2xl font-extrabold text-accent">{s.k}</div>
                <div className="text-[11px] uppercase tracking-wider text-white/70">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Banner indicators */}
        {list.length > 1 && (
          <div className="absolute bottom-6 right-6 flex items-center gap-2">
            {list.map((_, idx) => (
              <button key={idx} onClick={() => setI(idx)} aria-label={`Banner ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-accent" : "w-4 bg-white/40 hover:bg-white/70"}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
