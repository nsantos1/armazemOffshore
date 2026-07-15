"use client";

import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { StripedPlaceholder } from "@/components/ui/StripedPlaceholder";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { fmtDate } from "@/lib/utils";
import type { NavigateFn, Post, Settings } from "@/lib/types";

// Faixa de certificação ISO, sem dados externos.
export function IsoBand() {
  const { t } = useLang();
  return (
    <section className="iso-stripe-bg text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid place-items-center w-14 h-14 rounded-full bg-accent text-primary shrink-0">
            <Icon name="ShieldCheck" className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[.25em] text-accent font-bold">{t("iso.eyebrow")}</div>
            <div className="text-lg sm:text-xl font-extrabold leading-tight">{t("iso.title")}</div>
            <div className="text-sm text-white/75">{t("iso.subtitle")}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/70">
          <Icon name="BadgeCheck" className="w-4 h-4 text-accent" />
          <span>{t("iso.audit")}</span>
          <span className="mx-2 opacity-40">|</span>
          <Icon name="FileCheck2" className="w-4 h-4 text-accent" />
          <span>{t("iso.indicators")}</span>
        </div>
      </div>
    </section>
  );
}

export function About({ settings }: { settings: Settings }) {
  const { t } = useLang();
  return (
    <section id="quem-somos" className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.25em] text-accent-700 mb-3">{t("about.eyebrow")}</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
            {t("about.titleLead")}<span className="relative inline-block whitespace-nowrap"><span className="relative z-10">{t("about.titleMark")}</span><span className="absolute inset-x-0 bottom-1 h-3 bg-accent/60 -z-0" /></span>{t("about.titleTail")}
          </h2>
          <p className="mt-5 text-base lg:text-lg text-slate-600 leading-relaxed">{settings.about}</p>

          <div className="mt-8 grid sm:grid-cols-3 gap-3">
            {settings.bases.map((b, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-primary/30 transition">
                <div className="flex items-center gap-2 text-primary">
                  <Icon name="MapPin" className="w-4 h-4 text-accent-700" />
                  <span className="text-xs font-bold uppercase tracking-wider">{b.label}</span>
                </div>
                <div className="mt-1 font-bold text-primary">{b.city}</div>
                <div className="text-xs text-text-muted leading-relaxed mt-1">{b.address}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-card">
            <img src="/assets/basePortoAcu-IA.jpeg" alt="Base de Apoio Porto do Açu" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden sm:block">
            <div className="rounded-xl bg-white p-5 shadow-deep border border-slate-200 w-64">
              <div className="text-4xl font-extrabold text-primary">39+</div>
              <div className="text-sm text-text-muted">{t("about.yearsCard")}</div>
            </div>
          </div>
          <div className="absolute -top-6 -right-6 hidden sm:block">
            <div className="rounded-xl bg-primary p-5 text-white w-56 shadow-deep">
              <Icon name="Anchor" className="w-6 h-6 text-accent" />
              <div className="mt-2 font-bold">{t("about.acuTitle")}</div>
              <div className="text-xs text-white/70">{t("about.acuText")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Pillars({ settings }: { settings: Settings }) {
  const { t } = useLang();
  return (
    <section className="bg-bg-soft py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-[.25em] text-accent-700 mb-3">{t("pillars.eyebrow")}</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
            {t("pillars.title")}
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {settings.pillars.map((p, i) => (
            <div key={i} className="group relative rounded-xl bg-white p-6 lg:p-8 shadow-card border border-slate-200 hover:border-accent transition">
              <div className="flex items-center justify-between">
                <div className="grid place-items-center w-12 h-12 rounded-lg bg-primary text-accent">
                  <Icon name={p.icon} className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs text-text-muted">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-primary">{p.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{p.text}</p>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-accent scale-x-0 origin-left transition-transform group-hover:scale-x-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Solutions({ settings }: { settings: Settings }) {
  const { t } = useLang();
  return (
    <section id="solucoes" className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[.25em] text-accent-700 mb-3">{t("solutions.eyebrow")}</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
              {t("solutions.title")}
            </h2>
            <p className="mt-3 text-slate-600">{t("solutions.subtitle")}</p>
          </div>
          <a href={api.getSettings().storeUrl} target="_blank" rel="noreferrer">
            <Button variant="primary"><Icon name="ShoppingBag" className="w-4 h-4" /> {t("solutions.cta")}</Button>
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
          {settings.solutions.map((s, i) => (
            <div key={i} className="group relative bg-white p-6 lg:p-8 hover:bg-bg-soft transition">
              <div className="flex items-start justify-between">
                <div className="grid place-items-center w-12 h-12 rounded-lg bg-bg-soft text-primary group-hover:bg-primary group-hover:text-accent transition">
                  <Icon name={s.icon} className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs text-text-muted">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-primary">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export interface LatestNewsProps {
  posts: Post[];
  navigate: NavigateFn;
}

export function LatestNews({ posts, navigate }: LatestNewsProps) {
  const { t } = useLang();
  const recent = posts.filter(p => p.status === "published")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);
  if (!recent.length) return null;

  return (
    <section className="bg-bg-soft py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[.25em] text-accent-700 mb-3">{t("news.eyebrow")}</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">{t("news.title")}</h2>
          </div>
          <a href="/blog" onClick={(e) => { e.preventDefault(); navigate("/blog"); }}>
            <Button variant="outline">{t("news.viewAll")} <Icon name="ArrowRight" className="w-4 h-4" /></Button>
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {recent.map(p => (
            <a key={p.id} href={`/blog/${p.slug}`}
               onClick={(e) => { e.preventDefault(); navigate(`/blog/${p.slug}`); }}
               className="group block rounded-xl overflow-hidden bg-white border border-slate-200 shadow-card hover:shadow-deep hover:-translate-y-0.5 transition">
              <div className="post-cover aspect-[16/10]">
                {p.cover ? <img src={p.cover} alt={p.title} /> :
                  <StripedPlaceholder hue={p.coverHue || 210} label="capa do post" className="w-full h-full" />}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-700">{p.category}</span>
                  <span>{fmtDate(p.publishedAt)}</span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-primary leading-snug group-hover:text-primary-700 transition">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">{p.excerpt}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary">
                  {t("news.read")} <Icon name="ArrowUpRight" className="w-4 h-4" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
