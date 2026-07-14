"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/FormControls";
import { StripedPlaceholder } from "@/components/ui/StripedPlaceholder";
import { useConfirm } from "@/components/ui/useConfirm";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { fileToDataURL } from "@/lib/utils";
import type { NavigateFn, NLRecipientMode } from "@/lib/types";
import { RichEditor } from "../RichEditor";
import { EmailPreviewModal } from "./EmailModals";

export interface ComposeTabProps {
  navigate: NavigateFn;
  setTab: (tab: string) => void;
}

interface ComposeData {
  subject: string;
  preheader: string;
  content: string;
  coverImage: string | null;
  recipientMode: NLRecipientMode;
}

type ComposeErrors = Partial<Record<"subject" | "content", string>>;

export function ComposeTab({ navigate, setTab }: ComposeTabProps) {
  const toast = useToast();
  const [confirm, confirmNode] = useConfirm();
  const [data, setData] = React.useState<ComposeData>({
    subject: "", preheader: "", content: "",
    coverImage: null, recipientMode: "all_active",
  });
  const set = <K extends keyof ComposeData>(k: K, v: ComposeData[K]) => setData(d => ({ ...d, [k]: v }));
  const [errs, setErrs] = React.useState<ComposeErrors>({});
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [testEmail, setTestEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const activeCount = api.nlGetSubs().filter(s => s.status === "active").length;

  const onCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 2 * 1024 * 1024) { toast("Imagem grande demais (máx 2 MB).", "error"); return; }
    set("coverImage", await fileToDataURL(f));
  };

  const validate = (): boolean => {
    const e: ComposeErrors = {};
    if (!data.subject.trim()) e.subject = "Obrigatório";
    if (data.subject.length > 100) e.subject = "Máx. 100 caracteres";
    if (!data.content.trim() || data.content === "<br>") e.content = "Escreva o conteúdo";
    setErrs(e); return Object.keys(e).length === 0;
  };

  const saveDraft = () => {
    if (!data.subject.trim()) { toast("Informe o assunto para salvar o rascunho.", "error"); return; }
    api.nlCreateCamp({ ...data, status: "draft" });
    toast("Rascunho salvo.", "success");
    setTab("history");
  };
  // Monta o link de descadastro no formato que a página /unsubscribe entende
  // (token na query string + rota no hash): origin/?token=XXX#/unsubscribe
  const unsubUrl = (id: string): string => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/?token=${encodeURIComponent(api.nlSubToken(id))}#/unsubscribe`;
  };

  const sendTest = async () => {
    if (!testEmail || !/^\S+@\S+\.\S+$/.test(testEmail)) { toast("Informe um e-mail válido para teste.", "error"); return; }
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: data.subject,
          html: data.content,
          preheader: data.preheader,
          coverImage: data.coverImage,
          test: true,
          recipients: [{ email: testEmail }],
        }),
      });
      const out = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !out.ok) {
        toast(out?.error || "Não foi possível enviar o e-mail de teste.", "error");
        return;
      }
      toast(`E-mail de teste enviado para ${testEmail}.`, "success");
    } catch {
      toast("Falha de conexão ao enviar o teste.", "error");
    } finally {
      setBusy(false);
    }
  };

  const sendNow = async () => {
    if (!validate()) return;
    const recipients = api.nlGetSubs().filter(s => s.status === "active");
    if (recipients.length === 0) { toast("Não há inscritos ativos para enviar.", "error"); return; }
    const ok = await confirm({
      title: "Confirmar envio",
      message: `Disparar para ${recipients.length} inscritos ativos? Esta ação não pode ser desfeita.`,
      confirmText: "Enviar agora",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: data.subject,
          html: data.content,
          preheader: data.preheader,
          coverImage: data.coverImage,
          recipients: recipients.map(r => ({ email: r.email, unsubscribeUrl: unsubUrl(r.id) })),
        }),
      });
      const out = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !out.ok) {
        toast(out?.error || "Falha no disparo da campanha.", "error");
        return;
      }
      // Registra a campanha no histórico com a contagem REAL de enviados.
      const camp = api.nlCreateCamp({ ...data, status: "draft" });
      api.nlUpdateCamp(camp.id, {
        status: "sent",
        sentAt: new Date().toISOString(),
        sentCount: out.sent ?? recipients.length,
      });
      const failMsg = out.failedCount ? ` (${out.failedCount} falharam)` : "";
      toast(`Campanha enviada para ${out.sent} inscritos${failMsg}.`, out.failedCount ? "error" : "success");
      setTab("history");
    } catch {
      toast("Falha de conexão ao disparar a campanha.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {confirmNode}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5 space-y-3">
            <Field label={`Assunto · ${data.subject.length}/100`} error={errs.subject}>
              <Input value={data.subject} maxLength={100} onChange={e => set("subject", e.target.value)} placeholder="Ex: Boletim Maio/2026 — Novidades do Porto do Açu" />
            </Field>
            <Field label="Pré-cabeçalho (preview text)" hint="Texto curto que aparece no preview do inbox, depois do assunto.">
              <Input value={data.preheader} onChange={e => set("preheader", e.target.value)} placeholder="Texto opcional de até ~100 caracteres" />
            </Field>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-primary">Conteúdo</label>
              <span className="text-xs text-text-muted">{(data.content || "").replace(/<[^>]*>/g, "").length} caracteres</span>
            </div>
            <RichEditor value={data.content} onChange={(html) => set("content", html)} />
            {errs.content && <div className="mt-2 text-xs text-red-600">{errs.content}</div>}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
            <h3 className="font-bold text-primary mb-3">Destinatários</h3>
            <Field label="Para quem enviar">
              <Select value={data.recipientMode} onChange={e => set("recipientMode", e.target.value as NLRecipientMode)}>
                <option value="all_active">Todos os inscritos ativos ({activeCount})</option>
                <option value="manual">Selecionar manualmente</option>
              </Select>
            </Field>
            {data.recipientMode === "manual" && (
              <p className="mt-2 text-xs text-text-muted">A seleção manual abrirá um modal no envio (em desenvolvimento). Para esta versão, será enviado para os ativos.</p>
            )}
            <div className="mt-3 rounded-md bg-bg-soft p-3 text-xs">
              <div className="flex items-center justify-between text-text-muted">
                <span>Inscritos ativos</span><span className="font-mono text-primary font-bold">{activeCount}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
            <h3 className="font-bold text-primary mb-3">Imagem de capa</h3>
            <div className="aspect-[16/10] rounded-lg overflow-hidden border border-slate-200">
              {data.coverImage
                ? <img src={data.coverImage} alt="" className="w-full h-full object-cover" />
                : <StripedPlaceholder hue={210} label="opcional" className="w-full h-full" />}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-primary-700">
                <Icon name="Upload" className="w-4 h-4" /> {data.coverImage ? "Trocar" : "Enviar"} imagem
                <input type="file" className="hidden" accept="image/png,image/jpeg" onChange={onCover} />
              </label>
              {data.coverImage && <Button variant="ghost" size="sm" onClick={() => set("coverImage", null)}><Icon name="X" className="w-4 h-4" /></Button>}
            </div>
            <p className="mt-2 text-xs text-text-muted">PNG/JPG. Recomendado: 1200×630 (≤2 MB).</p>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5 space-y-2">
            <h3 className="font-bold text-primary mb-1">Teste</h3>
            <Field label="Enviar e-mail de teste" hint="Recomendado antes do disparo em massa.">
              <div className="flex gap-2">
                <Input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="seu@email.com" />
                <Button variant="outline" onClick={sendTest} disabled={busy}><Icon name="Send" className="w-4 h-4" /></Button>
              </div>
            </Field>
          </div>
        </aside>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-4 flex flex-wrap items-center justify-end gap-2 sticky bottom-2 z-10">
        <Button variant="ghost" onClick={() => setPreviewOpen(true)}><Icon name="Eye" className="w-4 h-4" /> Pré-visualizar</Button>
        <Button variant="outline" onClick={saveDraft}><Icon name="Save" className="w-4 h-4" /> Salvar como rascunho</Button>
        <Button variant="primary" onClick={sendNow} disabled={busy}>
          {busy ? <><Icon name="Loader2" className="w-4 h-4 animate-spin" /> Enviando...</> : <><Icon name="Send" className="w-4 h-4" /> Enviar agora</>}
        </Button>
      </div>

      <EmailPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} data={data} settings={api.getSettings()} />
    </div>
  );
}
