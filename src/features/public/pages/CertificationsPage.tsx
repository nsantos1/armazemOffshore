"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { useLang } from "@/lib/i18n";
import type { Certifications, NavigateFn } from "@/lib/types";

export interface CertificationsPageProps {
  certs: Certifications;
  navigate: NavigateFn;
}

// Divide o texto em parágrafos (quebra por linha em branco) e ignora vazios.
function paragraphs(text: string): string[] {
  return (text || "").split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
}

// Cada linha não vazia vira um item de lista (usado em "Valores").
function lines(text: string): string[] {
  return (text || "").split(/\n/).map(l => l.trim()).filter(Boolean);
}

export function CertificationsPage({ certs, navigate }: CertificationsPageProps) {
  const { t } = useLang();
  const valores = lines(certs.valores);

  const hasBanner = !!certs.bannerImage;

  return (
    <>
      {/* Cabeçalho */}
      <section className={`relative overflow-hidden text-white ${hasBanner ? "bg-primary-900" : "iso-stripe-bg"}`}>
        {hasBanner && (
          <>
            <img src={certs.bannerImage as string} alt="Certificações Armazém Offshore"
              className="absolute inset-0 w-full h-full object-cover" />
            {/* Overlay para garantir legibilidade do texto sobre a imagem */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-900/70 to-primary-900/40" />
          </>
        )}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:py-20">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-accent transition mb-6"
          >
            <Icon name="ArrowLeft" className="w-4 h-4" /> {t("certs.back")}
          </button>
          <div className="text-xs font-bold uppercase tracking-[.25em] text-accent mb-3">{t("certs.eyebrow")}</div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight max-w-3xl">
            {t("certs.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-white/75 leading-relaxed">
            {t("certs.subtitle")}
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2">
            <Icon name="ShieldCheck" className="w-5 h-5 text-accent" />
            <span className="text-sm font-bold">{t("certs.badge")}</span>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          {/* Visão */}
          <CertBlock icon="Eye" title={t("certs.visao")}>
            {paragraphs(certs.visao).map((p, i) => (
              <p key={i} className="text-base lg:text-lg text-slate-600 leading-relaxed">{p}</p>
            ))}
          </CertBlock>

          {/* Política */}
          <CertBlock icon="FileCheck2" title={t("certs.politica")}>
            {paragraphs(certs.politica).map((p, i) => (
              <p key={i} className="text-base lg:text-lg text-slate-600 leading-relaxed">{p}</p>
            ))}
          </CertBlock>

          {/* Valores */}
          <CertBlock icon="BadgeCheck" title={t("certs.valores")}>
            <ul className="space-y-3">
              {valores.map((v, i) => (
                <li key={i} className="flex items-start gap-3 text-base lg:text-lg text-slate-600 leading-relaxed">
                  <Icon name="Check" className="w-5 h-5 text-accent-700 shrink-0 mt-1" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </CertBlock>

          {/* Qualidade — documentos e âncoras */}
          <CertBlock icon="ShieldCheck" title={t("certs.qualidade")}>
            {certs.qualidadeIntro && (
              <p className="text-base lg:text-lg text-slate-600 leading-relaxed">{certs.qualidadeIntro}</p>
            )}
            <div className="mt-2 grid sm:grid-cols-2 gap-3">
              {certs.anchors.map(a => {
                // Abre em nova aba qualquer destino real (link externo OU arquivo
                // enviado em /documentosPdf); "#"/vazio é apenas placeholder.
                const openInNewTab = !!a.url && a.url !== "#";
                return (
                  <a
                    key={a.id}
                    href={a.url || "#"}
                    target={openInNewTab ? "_blank" : undefined}
                    rel={openInNewTab ? "noreferrer" : undefined}
                    className="group flex items-center justify-between gap-3 rounded-xl bg-white border border-slate-200 shadow-card px-5 py-4 hover:border-primary hover:shadow-deep hover:-translate-y-0.5 transition"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="grid place-items-center w-10 h-10 rounded-lg bg-primary text-accent shrink-0">
                        <Icon name="FileCheck2" className="w-5 h-5" />
                      </span>
                      <span className="font-bold text-primary leading-snug">{a.label}</span>
                    </span>
                    <Icon name="ArrowUpRight" className="w-5 h-5 text-text-muted group-hover:text-primary transition shrink-0" />
                  </a>
                );
              })}
            </div>
          </CertBlock>
        </div>
      </section>
    </>
  );
}

function CertBlock({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="grid lg:grid-cols-[220px_1fr] gap-6 lg:gap-10 items-start">
      <div className="flex items-center gap-3 lg:sticky lg:top-24">
        <div className="grid place-items-center w-12 h-12 rounded-lg bg-primary text-accent shrink-0">
          <Icon name={icon} className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-primary">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
