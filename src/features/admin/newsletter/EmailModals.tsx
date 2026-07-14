"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { fmtDate } from "@/lib/utils";
import type { NLCampaign, Settings } from "@/lib/types";

// Forma mínima exigida pelo template de e-mail — campanha ou rascunho em edição (ComposeTab).
export interface EmailFrameData {
  subject: string;
  preheader: string;
  content: string;
  coverImage: string | null;
}

export interface EmailFrameProps {
  data: EmailFrameData;
  settings: Settings | null | undefined;
  narrow?: boolean;
}

// Renderiza o template de e-mail (header navy + corpo branco + footer com unsub).
export function EmailFrame({ data, settings, narrow = false }: EmailFrameProps) {
  return (
    <div className={`mx-auto rounded-xl overflow-hidden border border-slate-200 bg-white ${narrow ? "max-w-[380px]" : "max-w-[640px]"}`}>
      {/* Inbox preview row */}
      <div className="px-4 py-2 bg-slate-100 text-xs text-text-muted flex items-center justify-between border-b border-slate-200">
        <span className="font-semibold text-primary">Armazém Offshore &lt;newsletter@armazemoffshore.com.br&gt;</span>
        <span className="text-[10px]">agora</span>
      </div>
      {/* Header navy with logo */}
      <div className="bg-primary px-6 py-5 flex items-center justify-center">
        <img src="/assets/armazem_offshore_logo.png" alt="Armazém Offshore" className="h-12 w-auto object-contain" />
      </div>
      {data.coverImage && (
        <img src={data.coverImage} alt="" className="w-full h-auto block" />
      )}
      <div className="px-6 py-7">
        <h2 className="text-2xl font-extrabold text-primary leading-tight" style={{ fontFamily: "Montserrat" }}>{data.subject || "Assunto da campanha"}</h2>
        {data.preheader && <p className="mt-1 text-sm text-text-muted">{data.preheader}</p>}
        <div className="mt-5 article-body text-[15px]" dangerouslySetInnerHTML={{ __html: data.content || "<p>(sem conteúdo)</p>" }} />

        <div className="mt-7 text-center">
          <a href="#" className="inline-flex items-center gap-2 rounded-md bg-accent text-primary px-5 py-3 text-sm font-bold no-underline">
            Visite o site <span aria-hidden>→</span>
          </a>
        </div>
      </div>
      {/* Footer */}
      <div className="bg-primary-900 text-white px-6 py-5 text-xs">
        <div className="font-bold text-accent">Armazém Offshore — Suprimentos Industriais</div>
        <div className="mt-1 text-white/70">{settings?.bases?.[0]?.address || "Macaé/RJ"} · {settings?.phone || ""}</div>
        <div className="mt-1 text-white/70">CNPJ XX.XXX.XXX/0001-XX</div>
        <div className="mt-3 flex flex-wrap gap-3 text-white/70">
          <a href="#" className="hover:text-accent">Site</a>
          <a href="#" className="hover:text-accent">Instagram</a>
          <a href="#" className="hover:text-accent">LinkedIn</a>
        </div>
        <div className="mt-4 pt-3 border-t border-white/10 text-white/50 text-[11px] leading-relaxed">
          Você recebeu este e-mail porque se inscreveu na nossa newsletter.{" "}
          <a href="#" className="underline hover:text-accent">Cancelar inscrição</a> · <a href="#" className="underline hover:text-accent">Política de privacidade</a>.
        </div>
      </div>
    </div>
  );
}

export interface EmailPreviewModalProps {
  open: boolean;
  onClose: () => void;
  data: EmailFrameData;
  settings: Settings;
}

export function EmailPreviewModal({ open, onClose, data, settings }: EmailPreviewModalProps) {
  const [view, setView] = React.useState<"desktop" | "mobile">("desktop");
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Pré-visualização do e-mail" size="xl"
      footer={<Button onClick={onClose}>Fechar</Button>}>
      <div className="flex items-center justify-center mb-4">
        <div className="inline-flex rounded-md bg-bg-soft p-1">
          {([
            { id: "desktop", l: "Desktop", i: "Monitor" },
            { id: "mobile", l: "Mobile", i: "Smartphone" },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              className={`inline-flex items-center gap-2 rounded px-4 py-1.5 text-sm font-semibold transition ${view === t.id ? "bg-primary text-white" : "text-primary hover:bg-white"}`}>
              <Icon name={t.i} className="w-4 h-4" /> {t.l}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-bg-soft rounded-lg p-4 max-h-[70vh] overflow-y-auto nice-scroll">
        <EmailFrame data={data} settings={settings} narrow={view === "mobile"} />
      </div>
    </Modal>
  );
}

export interface CampaignDetailModalProps {
  camp: NLCampaign | null;
  onClose: () => void;
}

export function CampaignDetailModal({ camp, onClose }: CampaignDetailModalProps) {
  if (!camp) return null;
  const openRate = camp.sentCount ? Math.round((camp.opensCount / camp.sentCount) * 100) : 0;
  const clickRate = camp.sentCount ? Math.round((camp.clicksCount / camp.sentCount) * 100) : 0;
  return (
    <Modal open={true} onClose={onClose} title="Detalhes da campanha" size="xl"
      footer={<Button onClick={onClose}>Fechar</Button>}>
      <div className="grid lg:grid-cols-[260px_1fr] gap-5">
        <div className="space-y-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Status</div>
            <div className="mt-1">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${camp.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {camp.status === "sent" ? "Enviada" : camp.status}
              </span>
            </div>
          </div>
          {camp.sentAt && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Data de envio</div>
              <div className="font-semibold text-primary">{fmtDate(camp.sentAt)}</div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted">Enviados</div>
              <div className="font-mono font-bold text-primary text-lg">{camp.sentCount || 0}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted">Abertos</div>
              <div className="font-mono font-bold text-primary text-lg">{camp.opensCount || 0}</div>
              <div className="text-[10px] text-text-muted">{openRate}%</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted">Cliques</div>
              <div className="font-mono font-bold text-primary text-lg">{camp.clicksCount || 0}</div>
              <div className="text-[10px] text-text-muted">{clickRate}%</div>
            </div>
          </div>
        </div>
        <div className="bg-bg-soft rounded-lg p-4 max-h-[60vh] overflow-y-auto nice-scroll">
          <EmailFrame data={camp} settings={api.getSettings()} />
        </div>
      </div>
    </Modal>
  );
}
