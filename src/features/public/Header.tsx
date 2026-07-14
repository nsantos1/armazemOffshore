"use client";

import * as React from "react";
import { Icon, LogoLockup } from "@/components/icons";
import { useLang, type Lang } from "@/lib/i18n";
import type { Identity, NavigateFn, Route, Settings } from "@/lib/types";

export interface HeaderProps {
  identity: Identity;
  settings: Settings;
  route: Route;
  navigate: NavigateFn;
}

// Seletor de idioma (globo) — inspirado no seletor de idioma de grandes marcas.
// Abre um painel com as opções Português / English (rádio). Fecha ao clicar fora.
function LangSwitcher() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const choose = (l: Lang) => { setLang(l); setOpen(false); };

  const options: { id: Lang; label: string }[] = [
    { id: "pt", label: t("lang.pt") },
    { id: "en", label: t("lang.en") },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("lang.aria")}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-semibold text-white/85 hover:text-white hover:bg-white/10 transition"
      >
        <Icon name="Globe" className="w-5 h-5" />
        <span className="tabular-nums">{lang === "en" ? t("lang.enShort") : t("lang.ptShort")}</span>
        <Icon name="ChevronDown" className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("lang.aria")}
          className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-deep ring-1 ring-black/5 overflow-hidden z-50"
        >
          <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-text-muted border-b border-slate-100">
            <span className="inline-flex items-center gap-2"><Icon name="Globe" className="w-3.5 h-3.5" /> {t("lang.aria")}</span>
          </div>
          {options.map(o => {
            const active = lang === o.id;
            return (
              <button
                key={o.id}
                role="option"
                aria-selected={active}
                onClick={() => choose(o.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition ${active ? "bg-bg-soft text-primary font-bold" : "text-primary hover:bg-bg-soft"}`}
              >
                <span className={`grid place-items-center w-4 h-4 rounded-full border-2 shrink-0 ${active ? "border-accent" : "border-slate-300"}`}>
                  {active && <span className="w-2 h-2 rounded-full bg-accent" />}
                </span>
                {o.label}
                <span className="ml-auto text-[11px] font-mono text-text-muted">{o.id.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Header({ identity, settings, route, navigate }: HeaderProps) {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goAnchor = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    if (route !== "/") {
      navigate("/" + hash);
    } else {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navItems = [
    { label: t("nav.about"), href: "#quem-somos" },
    { label: t("nav.partners"), href: "#parceiros" },
    { label: t("nav.certs"), href: "/certificacoes", isRoute: true },
    { label: t("nav.news"), href: "/blog", isRoute: true },
    { label: t("nav.contact"), href: "#contato" },
  ];

  return (
    <header className={`sticky top-0 z-40 transition-all ${scrolled ? "bg-primary shadow-lg" : "bg-primary"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="flex items-center" aria-label="Armazém Offshore — Início">
          {identity.logoCustom
            ? <img src={identity.logoCustom} alt={identity.logoAlt} style={{ maxWidth: identity.logoMaxWidth || 180, maxHeight: 44 }} className="h-11 w-auto object-contain" />
            : <LogoLockup />
          }
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map(n => n.isRoute ? (
            <a key={n.label} href={n.href}
              onClick={(e) => { e.preventDefault(); navigate(n.href); }}
              className={`px-3 py-2 text-sm font-medium text-white/85 hover:text-white transition ${route.startsWith("/blog") && n.href === "/blog" ? "text-accent" : ""}`}
            >{n.label}</a>
          ) : (
            <a key={n.label} href={n.href} onClick={goAnchor(n.href)}
              className="px-3 py-2 text-sm font-medium text-white/85 hover:text-white transition">{n.label}</a>
          ))}

          {/* Seletor de idioma — entre "Fale Conosco" e "Loja Virtual" */}
          <div className="mx-1 h-6 w-px bg-white/15" aria-hidden="true" />
          <LangSwitcher />

          <a href={settings.storeUrl} target="_blank" rel="noreferrer"
             className="ml-2 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-bold text-primary hover:bg-accent-600 transition">
            <Icon name="ShoppingBag" className="w-4 h-4" /> {t("nav.store")}
          </a>
        </nav>

        <button className="md:hidden text-white p-2" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <Icon name={open ? "X" : "Menu"} className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-primary">
          <div className="px-4 py-3 flex flex-col gap-1">
            {navItems.map(n => n.isRoute ? (
              <a key={n.label} href={n.href} onClick={(e) => { e.preventDefault(); setOpen(false); navigate(n.href); }}
                className="rounded px-3 py-3 text-sm font-medium text-white/90 hover:bg-white/5">{n.label}</a>
            ) : (
              <a key={n.label} href={n.href} onClick={goAnchor(n.href)}
                className="rounded px-3 py-3 text-sm font-medium text-white/90 hover:bg-white/5">{n.label}</a>
            ))}

            {/* Idioma no mobile */}
            <div className="mt-2 pt-3 border-t border-white/10">
              <div className="px-3 mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/50">
                <Icon name="Globe" className="w-3.5 h-3.5" /> {t("lang.aria")}
              </div>
              <div className="flex gap-2 px-1">
                {([{ id: "pt" as Lang, label: t("lang.pt") }, { id: "en" as Lang, label: t("lang.en") }]).map(o => (
                  <button key={o.id} onClick={() => setLang(o.id)}
                    className={`flex-1 rounded-md px-3 py-2.5 text-sm font-semibold transition ${lang === o.id ? "bg-accent text-primary" : "bg-white/5 text-white/85 hover:bg-white/10"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <a href={settings.storeUrl} target="_blank" rel="noreferrer"
               className="mt-3 inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-bold text-primary">
              <Icon name="ShoppingBag" className="w-4 h-4" /> {t("nav.store")}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
