"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/FormControls";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { flushPersist, uid } from "@/lib/storage";
import { uploadDoc, uploadImage } from "@/lib/uploads-client";
import type { CertAnchor, Certifications } from "@/lib/types";

const BANNER_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";
const BANNER_MAX_BYTES = 3 * 1024 * 1024; // 3 MB

// Tipos aceitos no upload de documentos e limite (espelham o /api/upload-doc).
const DOC_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp";
const DOC_MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export function CertificationsAdminPage() {
  const toast = useToast();
  const [c, setC] = React.useState<Certifications>(() => api.getCertifications());
  const [uploadingIdx, setUploadingIdx] = React.useState<number | null>(null);
  const [saving, setSaving] = React.useState(false);
  const set = <K extends keyof Certifications>(k: K, v: Certifications[K]) => setC(o => ({ ...o, [k]: v }));

  const onBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) { toast("Formato inválido. Use PNG, JPG ou WEBP.", "error"); return; }
    if (f.size > BANNER_MAX_BYTES) { toast("Arquivo muito grande (máx. 3 MB).", "error"); return; }
    try {
      const url = await uploadImage(f);
      setC(o => ({ ...o, bannerImage: url }));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Falha ao enviar a imagem.", "error");
    }
    e.target.value = "";
  };

  const setAnchor = (i: number, k: keyof CertAnchor, v: string) =>
    setC(o => ({ ...o, anchors: o.anchors.map((a, j) => j === i ? { ...a, [k]: v } : a) }));
  const addAnchor = () =>
    setC(o => ({ ...o, anchors: [...o.anchors, { id: `a${uid()}`, label: "Novo documento", url: "#" }] }));
  const rmAnchor = (i: number) =>
    setC(o => ({ ...o, anchors: o.anchors.filter((_, j) => j !== i) }));
  const moveAnchor = (i: number, dir: -1 | 1) =>
    setC(o => {
      const next = [...o.anchors];
      const j = i + dir;
      if (j < 0 || j >= next.length) return o;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...o, anchors: next };
    });

  // Envia o arquivo ao /api/upload-doc, que o grava em /public/documentosPdf,
  // e preenche automaticamente a URL da âncora com o caminho retornado.
  const onUploadDoc = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = ""; // permite reenviar o mesmo arquivo depois
    if (!f) return;
    if (f.size > DOC_MAX_BYTES) { toast("Arquivo muito grande (máx. 25 MB).", "error"); return; }
    setUploadingIdx(i);
    try {
      const url = await uploadDoc(f);
      setAnchor(i, "url", url);
      toast("Arquivo enviado e salvo em documentosPdf. Clique em Salvar página para publicar.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Falha ao enviar o arquivo.", "error");
    } finally {
      setUploadingIdx(null);
    }
  };

  const save = async () => {
    setSaving(true);
    api.setCertifications(c);
    const ok = await flushPersist();
    setSaving(false);
    if (ok) {
      toast("Página de Certificações salva.", "success");
      window.dispatchEvent(new Event("data-changed"));
    } else {
      toast("Não foi possível salvar no servidor. Verifique a conexão e tente de novo.", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-primary">Página de Certificações</h2>
            <p className="text-xs text-text-muted">
              Edite os textos de Visão, Política, Valores e os documentos exibidos na página pública
              <span className="font-mono"> /certificacoes</span>.
            </p>
          </div>
          <a href="#/certificacoes" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm"><Icon name="ExternalLink" className="w-4 h-4" /> Ver página</Button>
          </a>
        </div>
      </div>

      {/* Banner (imagem do topo) */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Image" className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-primary">Banner da página</h2>
        </div>
        <p className="text-xs text-text-muted mb-4">
          Imagem opcional exibida no topo da página de Certificações. Recomendado formato horizontal
          (ex.: 1600×500). PNG, JPG ou WEBP, máx. 3 MB. Sem imagem, o topo usa o padrão azul da marca.
        </p>
        <div className="rounded-lg border border-slate-200 bg-bg-soft overflow-hidden aspect-[16/5] grid place-items-center">
          {c.bannerImage
            ? <img src={c.bannerImage} alt="Banner de Certificações" className="w-full h-full object-cover" />
            : <div className="flex flex-col items-center gap-2 text-text-muted">
                <Icon name="Image" className="w-8 h-8" />
                <span className="text-xs">Nenhum banner enviado</span>
              </div>
          }
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-primary-700">
            <Icon name="Upload" className="w-4 h-4" /> {c.bannerImage ? "Trocar imagem" : "Enviar imagem"}
            <input type="file" className="hidden" accept={BANNER_ACCEPT} onChange={onBanner} />
          </label>
          {c.bannerImage && (
            <Button variant="ghost" size="sm" onClick={() => set("bannerImage", null)}>
              <Icon name="Trash2" className="w-4 h-4" /> Remover
            </Button>
          )}
        </div>
      </div>

      {/* Visão */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Eye" className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-primary">Visão</h2>
        </div>
        <Field label="Texto" hint="Deixe uma linha em branco entre parágrafos.">
          <Textarea rows={4} value={c.visao} onChange={e => set("visao", e.target.value)} />
        </Field>
      </div>

      {/* Política */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="FileCheck2" className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-primary">Política</h2>
        </div>
        <Field label="Texto" hint="Deixe uma linha em branco entre parágrafos.">
          <Textarea rows={4} value={c.politica} onChange={e => set("politica", e.target.value)} />
        </Field>
      </div>

      {/* Valores */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="BadgeCheck" className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-primary">Valores</h2>
        </div>
        <Field label="Lista de valores" hint="Um valor por linha — cada linha vira um item na página.">
          <Textarea rows={6} value={c.valores} onChange={e => set("valores", e.target.value)} />
        </Field>
      </div>

      {/* Qualidade / Documentos */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="ShieldCheck" className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-primary">Qualidade &amp; documentos</h2>
          </div>
          <Button variant="outline" size="sm" onClick={addAnchor}><Icon name="Plus" className="w-4 h-4" /> Novo documento</Button>
        </div>
        <Field label="Texto de introdução (opcional)">
          <Textarea rows={2} value={c.qualidadeIntro} onChange={e => set("qualidadeIntro", e.target.value)} />
        </Field>
        <p className="text-xs text-text-muted mt-4 mb-3">
          Cada documento vira um link (âncora) clicável. Você pode <strong>colar a URL</strong> de destino
          (link do PDF/página) <strong>ou enviar o arquivo</strong> pelo botão de upload — nesse caso o
          arquivo é salvo na pasta <span className="font-mono">documentosPdf</span> e a URL é preenchida
          automaticamente. Use <span className="font-mono">#</span> enquanto o documento não estiver disponível.
        </p>
        <div className="space-y-2">
          {c.anchors.map((a, i) => {
            const isUploaded = /^\/documentosPdf\//i.test(a.url);
            const uploading = uploadingIdx === i;
            return (
              <div key={a.id} className="grid sm:grid-cols-[1.4fr_1.6fr_auto] gap-2 items-start">
                <Input value={a.label} onChange={e => setAnchor(i, "label", e.target.value)} placeholder="Rótulo (ex: Certificação ISO 9001)" />
                <div>
                  <Input value={a.url} onChange={e => setAnchor(i, "url", e.target.value)} placeholder="https://... ou #" className="font-mono text-sm" />
                  {isUploaded && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700">
                      <Icon name="FileCheck2" className="w-3.5 h-3.5" /> Arquivo em documentosPdf
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <label
                    title={uploading ? "Enviando..." : "Enviar arquivo (salva em documentosPdf)"}
                    className={`grid place-items-center w-9 h-9 rounded-md text-text-muted hover:text-primary hover:bg-bg-soft ${uploading ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
                  >
                    <Icon name={uploading ? "Loader2" : "Upload"} className={`w-4 h-4 ${uploading ? "animate-spin" : ""}`} />
                    <input type="file" className="hidden" accept={DOC_ACCEPT} disabled={uploading} onChange={e => onUploadDoc(i, e)} />
                  </label>
                  <button onClick={() => moveAnchor(i, -1)} disabled={i === 0} title="Mover para cima"
                    className="grid place-items-center w-9 h-9 rounded-md text-text-muted hover:text-primary hover:bg-bg-soft disabled:opacity-30 disabled:pointer-events-none"><Icon name="ArrowUp" className="w-4 h-4" /></button>
                  <button onClick={() => moveAnchor(i, 1)} disabled={i === c.anchors.length - 1} title="Mover para baixo"
                    className="grid place-items-center w-9 h-9 rounded-md text-text-muted hover:text-primary hover:bg-bg-soft disabled:opacity-30 disabled:pointer-events-none"><Icon name="ArrowDown" className="w-4 h-4" /></button>
                  <button onClick={() => rmAnchor(i)} title="Excluir"
                    className="grid place-items-center w-9 h-9 rounded-md text-text-muted hover:text-red-600 hover:bg-red-50"><Icon name="Trash2" className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
          {c.anchors.length === 0 && (
            <p className="text-sm text-text-muted italic">Nenhum documento cadastrado.</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button onClick={save} disabled={saving}><Icon name={saving ? "Loader2" : "Save"} className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} /> Salvar página</Button>
      </div>
    </div>
  );
}
