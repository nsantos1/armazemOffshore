"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Textarea, Toggle } from "@/components/ui/FormControls";
import { Modal } from "@/components/ui/Modal";
import { StripedPlaceholder } from "@/components/ui/StripedPlaceholder";
import { useConfirm } from "@/components/ui/useConfirm";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { flushPersist } from "@/lib/storage";
import { uploadImage } from "@/lib/uploads-client";
import type { Banner } from "@/lib/types";

type BannerDraft = Omit<Banner, "id"> & { id: string | null };

export function BannersPage() {
  const toast = useToast();
  const [confirm, confirmNode] = useConfirm();
  const [list, setList] = React.useState<Banner[]>(() => api.getBanners());
  const [editing, setEditing] = React.useState<BannerDraft | null>(null);
  const reload = () => setList(api.getBanners());

  const startNew = () => setEditing({ id: null, title: "", subtitle: "", ctaText: "Saiba mais", ctaLink: "#contato", image: null, hue: 210, position: "left", active: true, order: list.length + 1 });
  // Confirma no servidor antes de avisar sucesso (evita "salvou" que não persistiu).
  const confirmSaved = async (okMsg: string) => {
    const ok = await flushPersist();
    toast(ok ? okMsg : "Não foi possível salvar no servidor. Tente novamente.", ok ? "success" : "error");
  };
  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { toast("Informe o título.", "error"); return; }
    if (editing.id) api.updateBanner(editing.id, editing);
    else api.createBanner(editing);
    setEditing(null); reload();
    await confirmSaved("Banner salvo.");
  };
  const del = async (b: Banner) => {
    const ok = await confirm({ title: "Excluir banner", message: `Excluir "${b.title}"?`, danger: true, confirmText: "Excluir" });
    if (!ok) return;
    api.deleteBanner(b.id); reload();
    await confirmSaved("Banner excluído.");
  };
  const toggleActive = async (b: Banner) => {
    api.updateBanner(b.id, { active: !b.active }); reload();
    if (!(await flushPersist())) toast("Não foi possível salvar no servidor.", "error");
  };
  const move = async (b: Banner, dir: 1 | -1) => {
    const ids = list.map(x => x.id);
    const i = ids.indexOf(b.id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    api.reorderBanners(ids); reload();
    if (!(await flushPersist())) toast("Não foi possível salvar no servidor.", "error");
  };

  const onImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const url = await uploadImage(file);
      setEditing(b => b && ({ ...b, image: url }));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Falha ao enviar a imagem.", "error");
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {confirmNode}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="font-bold text-primary">Banners da Home</h2>
          <p className="text-xs text-text-muted">Carrossel exibido no topo do site. Você pode ativar/desativar e reordenar.</p>
        </div>
        <Button onClick={startNew}><Icon name="Plus" className="w-4 h-4" /> Novo banner</Button>
      </div>

      {list.length === 0 ? (
        <EmptyState icon="Megaphone" title="Nenhum banner cadastrado" hint="Crie o primeiro banner do site público."
          action={<Button onClick={startNew}><Icon name="Plus" className="w-4 h-4" />Criar banner</Button>} />
      ) : (
      <div className="grid md:grid-cols-2 gap-4">
        {list.map((b, idx) => (
          <div key={b.id} className="rounded-xl bg-white border border-slate-200 shadow-card overflow-hidden">
            <div className="aspect-[16/7] relative">
              {b.image ? <img src={b.image} alt="" className="w-full h-full object-cover" /> :
                <StripedPlaceholder hue={b.hue || 210} label="banner" className="w-full h-full" />}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/50 to-transparent" />
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                <div className="text-lg font-extrabold leading-tight line-clamp-1">{b.title}</div>
                <div className="text-xs text-white/80 line-clamp-1">{b.subtitle}</div>
              </div>
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="rounded-full bg-white/90 text-primary text-[10px] font-mono px-2 py-0.5">#{String(idx + 1).padStart(2, "0")}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${b.active ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"}`}>{b.active ? "Ativo" : "Inativo"}</span>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-2">
              <div className="text-xs text-text-muted">CTA: <span className="text-primary font-semibold">{b.ctaText}</span> → <span className="font-mono">{b.ctaLink}</span></div>
              <div className="flex gap-1">
                <button onClick={() => move(b, -1)} title="Subir" className="p-2 text-text-muted hover:text-primary disabled:opacity-30" disabled={idx === 0}><Icon name="ArrowUp" className="w-4 h-4" /></button>
                <button onClick={() => move(b, 1)} title="Descer" className="p-2 text-text-muted hover:text-primary disabled:opacity-30" disabled={idx === list.length - 1}><Icon name="ArrowDown" className="w-4 h-4" /></button>
                <button onClick={() => toggleActive(b)} title="Ativar/Desativar" className="p-2 text-text-muted hover:text-primary"><Icon name={b.active ? "EyeOff" : "Eye"} className="w-4 h-4" /></button>
                <button onClick={() => setEditing({ ...b })} title="Editar" className="p-2 text-text-muted hover:text-primary"><Icon name="Pencil" className="w-4 h-4" /></button>
                <button onClick={() => del(b)} title="Excluir" className="p-2 text-text-muted hover:text-red-600"><Icon name="Trash2" className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)}
        title={editing?.id ? "Editar banner" : "Novo banner"}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button><Button onClick={save}><Icon name="Save" className="w-4 h-4" />Salvar</Button></>}
        size="lg">
        {editing && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Field label="Título"><Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="Headline principal" /></Field>
              <Field label="Subtítulo"><Textarea rows={3} value={editing.subtitle} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} placeholder="Texto de apoio (1-2 linhas)" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Texto do botão"><Input value={editing.ctaText} onChange={e => setEditing({ ...editing, ctaText: e.target.value })} /></Field>
                <Field label="Link do botão"><Input value={editing.ctaLink} onChange={e => setEditing({ ...editing, ctaLink: e.target.value })} placeholder="#contato ou URL" /></Field>
              </div>
              <Field label="Cor de fundo (placeholder)" hint="0-360 (matiz)">
                <Input type="range" min={0} max={360} value={editing.hue || 210} onChange={e => setEditing({ ...editing, hue: Number(e.target.value) })} />
              </Field>
              <Toggle checked={editing.active} onChange={v => setEditing({ ...editing, active: v })} label="Banner ativo no site" />
            </div>
            <div>
              <div className="aspect-[16/9] rounded-lg overflow-hidden border border-slate-200 relative">
                {editing.image ? <img src={editing.image} alt="" className="w-full h-full object-cover" /> :
                  <StripedPlaceholder hue={editing.hue || 210} label="prévia da imagem" className="w-full h-full" />}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/50 to-transparent" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                  <div className="text-xl font-extrabold leading-tight">{editing.title || "Título do banner"}</div>
                  <div className="text-sm text-white/80 mt-1">{editing.subtitle || "Subtítulo do banner..."}</div>
                  <div className="mt-3"><span className="inline-flex items-center gap-2 rounded-md bg-accent text-primary px-3 py-1.5 text-xs font-bold">{editing.ctaText || "Botão"}</span></div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-primary-700">
                  <Icon name="Upload" className="w-4 h-4" /> {editing.image ? "Trocar" : "Enviar"} imagem
                  <input type="file" className="hidden" accept="image/*" onChange={onImage} />
                </label>
                {editing.image && <Button variant="ghost" size="sm" onClick={() => setEditing({ ...editing, image: null })}><Icon name="X" className="w-4 h-4" />Remover</Button>}
              </div>
              <p className="mt-2 text-xs text-text-muted">Recomendado: 1920×900px (16:9). Formato JPG/PNG.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
