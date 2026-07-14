"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useLang } from "@/lib/i18n";
import type { Partner } from "@/lib/types";

export interface PartnerLogoProps {
  p: Partner;
  onClick: () => void;
}

// Card de logo: mostra APENAS a imagem (o nome fica no modal, ao clicar).
// Moldura quadrada padronizada — todos os logos ocupam exatamente o mesmo espaço.
export function PartnerLogo({ p, onClick }: PartnerLogoProps) {
  const initials = p.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <button
      type="button"
      onClick={onClick}
      title={p.name}
      aria-label={p.name}
      className="partner-card group relative shrink-0 flex items-center justify-center w-full min-w-[150px] aspect-square rounded-xl bg-white ring-1 ring-inset ring-slate-200 p-6 hover:ring-primary hover:shadow-card hover:-translate-y-0.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      {/* Padronização profissional: a moldura é um quadrado (aspect-square) com
          width/height fixos (w-full/h-full) e object-contain — assim toda imagem
          fica uniforme dentro do quadrado, sem distorcer e sem cortar o logo. */}
      {p.image ? (
        <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
      ) : (
        <div className="grid place-items-center h-16 w-16 rounded-md bg-primary text-accent font-extrabold text-lg">{initials}</div>
      )}
    </button>
  );
}

export interface PartnerModalProps {
  partner: Partner | null;
  onClose: () => void;
}

export function PartnerModal({ partner, onClose }: PartnerModalProps) {
  const { t } = useLang();
  if (!partner) return null;
  return (
    <Modal open={true} onClose={onClose} title={partner.kind === "supplier" ? t("partners.modalSupplier") : t("partners.modalClient")} size="md"
      footer={<>
        <Button variant="ghost" onClick={onClose}>{t("partners.close")}</Button>
        {partner.url && partner.url !== "#" && (
          <a href={partner.url} target="_blank" rel="noreferrer">
            <Button><Icon name="ExternalLink" className="w-4 h-4" /> {t("partners.visit")}</Button>
          </a>
        )}
      </>}
    >
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="shrink-0 w-full sm:w-40 h-32 rounded-lg bg-bg-soft border border-slate-200 grid place-items-center overflow-hidden">
          {partner.image
            ? <img src={partner.image} alt={partner.name} className="w-full h-full object-contain p-3" />
            : <div className="grid place-items-center h-16 w-16 rounded-md bg-primary text-accent font-extrabold text-xl">
                {partner.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-extrabold text-primary leading-tight">{partner.name}</h3>
          <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-accent/20 text-accent-700 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
            <Icon name={partner.kind === "supplier" ? "Truck" : "Building2"} className="w-3 h-3" />
            {partner.kind === "supplier" ? t("partners.badgeSupplier") : t("partners.badgeClient")}
          </div>
          <p className="mt-3 text-sm text-text-muted leading-relaxed">{partner.about || partner.desc || t("partners.noDesc")}</p>
          {partner.url && partner.url !== "#" && (
            <a
              href={partner.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent-700 font-mono break-all underline underline-offset-2 hover:text-primary transition"
            >
              <Icon name="Link" className="w-3.5 h-3.5 shrink-0" />
              {partner.url}
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}

// Carrossel horizontal usado quando um grupo tem mais de 6 itens.
// Scroll nativo (arrasta/swipe no touch) + setas de navegação no desktop.
// As setas aparecem/somem conforme dá para rolar para cada lado.
function PartnerCarousel({ list, onSelect }: { list: Partner[]; onSelect: (p: Partner) => void }) {
  const { t } = useLang();
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(true);

  const update = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    update();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { el.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [update, list.length]);

  const scrollByCards = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Rola ~80% da área visível (mínimo de um card ≈ 200px + gap 12px).
    const amount = Math.max(el.clientWidth * 0.8, 212);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="no-scrollbar flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scroll-smooth"
      >
        {list.map(p => (
          <div key={p.id} className="snap-start shrink-0">
            <PartnerLogo p={p} onClick={() => onSelect(p)} />
          </div>
        ))}
      </div>

      {/* Setas — só no desktop; no mobile o usuário arrasta/deslza */}
      <button
        type="button" onClick={() => scrollByCards(-1)} disabled={!canPrev} aria-label={t("partners.prev")}
        className="hidden sm:grid place-items-center absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-card text-primary hover:bg-primary hover:text-white transition disabled:opacity-0 disabled:pointer-events-none"
      >
        <Icon name="ChevronLeft" className="w-5 h-5" />
      </button>
      <button
        type="button" onClick={() => scrollByCards(1)} disabled={!canNext} aria-label={t("partners.next")}
        className="hidden sm:grid place-items-center absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-card text-primary hover:bg-primary hover:text-white transition disabled:opacity-0 disabled:pointer-events-none"
      >
        <Icon name="ChevronRight" className="w-5 h-5" />
      </button>
    </div>
  );
}

export function Partners({ partners }: { partners: Partner[] }) {
  const { t } = useLang();
  const [selected, setSelected] = React.useState<Partner | null>(null);
  const suppliers = partners.filter(p => p.kind === "supplier" && p.active);
  const clients = partners.filter(p => p.kind === "client" && p.active);
  return (
    <section id="parceiros" className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-bold uppercase tracking-[.25em] text-accent-700 mb-3">{t("partners.eyebrow")}</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
            {t("partners.title")}
          </h2>
          <p className="mt-3 text-slate-600">{t("partners.subtitle")}</p>
        </div>

        {[
          { title: t("partners.suppliers"), list: suppliers, icon: "Truck" },
          { title: t("partners.clients"), list: clients, icon: "Building2" },
        ].map(group => (
          <div key={group.title} className="mb-12 last:mb-0">
            <div className="flex items-center gap-3 mb-5">
              <Icon name={group.icon} className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold uppercase tracking-wider text-primary">{group.title}</h3>
              <span className="font-mono text-xs text-text-muted">/ {String(group.list.length).padStart(2, "0")}</span>
            </div>
            {group.list.length === 0
              ? <div className="text-sm text-text-muted">{t("partners.none")}</div>
              : group.list.length > 6
                ? <PartnerCarousel list={group.list} onSelect={setSelected} />
                : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {group.list.map(p => (
                      <PartnerLogo key={p.id} p={p} onClick={() => setSelected(p)} />
                    ))}
                  </div>
                )
            }
          </div>
        ))}
      </div>
      <PartnerModal partner={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
