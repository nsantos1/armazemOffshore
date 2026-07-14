"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/FormControls";
import { Modal } from "@/components/ui/Modal";
import { useConfirm } from "@/components/ui/useConfirm";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { flushPersist } from "@/lib/storage";
import { uploadImage } from "@/lib/uploads-client";
import type { Partner, PartnerKind } from "@/lib/types";

type PartnerDraft = Omit<Partner, "id"> & { id: string | null };

const ACCEPT = "image/png,image/jpeg,image/jpg,image/svg+xml";
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export function PartnersPage() {
  const toast = useToast();
  const [confirm, confirmNode] = useConfirm();
  const [tab, setTab] = React.useState<PartnerKind>("supplier");
  const [all, setAll] = React.useState<Partner[]>(() => api.getPartners());
  const [editing, setEditing] = React.useState<PartnerDraft | null>(null);
  const reload = () => setAll(api.getPartners());

  const list = all.filter(p => p.kind === tab);

  const startNew = () => setEditing({ id: null, name: "", desc: "", about: "", url: "https://", image: null, kind: tab, active: true, order: list.length + 1 });
  // Confirma no servidor antes de avisar sucesso.
  const confirmSaved = async (okMsg: string) => {
    const ok = await flushPersist();
    toast(ok ? okMsg : "Não foi possível salvar no servidor. Tente novamente.", ok ? "success" : "error");
  };
  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) { toast("Informe o nome.", "error"); return; }
    if (editing.id) api.updatePartner(editing.id, editing);
    else api.createPartner(editing);
    setEditing(null); reload();
    await confirmSaved("Parceiro salvo.");
  };
  const del = async (p: Partner) => {
    const ok = await confirm({ title: "Excluir parceiro", message: `Excluir "${p.name}"?`, danger: true, confirmText: "Excluir" });
    if (!ok) return;
    api.deletePartner(p.id); reload();
    await confirmSaved("Parceiro excluído.");
  };
  const toggle = async (p: Partner) => {
    api.updatePartner(p.id, { active: !p.active }); reload();
    if (!(await flushPersist())) toast("Não foi possível salvar no servidor.", "error");
  };

  const onImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!/^image\/(png|jpe?g|svg\+xml)$/i.test(f.type)) { toast("Formato inválido. Use PNG, JPG ou SVG.", "error"); return; }
    if (f.size > MAX_BYTES) { toast("Arquivo muito grande (máx. 2 MB).", "error"); return; }
    try {
      const url = await uploadImage(f);
      setEditing(p => p && ({ ...p, image: url }));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Falha ao enviar a imagem.", "error");
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {confirmNode}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-primary">Parceiros</h2>
            <p className="text-xs text-text-muted">Fornecedores e clientes em destaque na seção pública.</p>
          </div>
          <Button onClick={startNew}><Icon name="Plus" className="w-4 h-4" /> Novo {tab === "supplier" ? "fornecedor" : "cliente"}</Button>
        </div>
        <div className="mt-4 inline-flex rounded-md bg-bg-soft p-1">
          {([
            { id: "supplier", l: "Fornecedores", i: "Truck" },
            { id: "client", l: "Clientes", i: "Building2" },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition ${tab === t.id ? "bg-primary text-white" : "text-primary hover:bg-white"}`}>
              <Icon name={t.i} className="w-4 h-4" /> {t.l}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={tab === "supplier" ? "Truck" : "Building2"} title={`Nenhum ${tab === "supplier" ? "fornecedor" : "cliente"} cadastrado`}
          hint="Adicione o primeiro registro." action={<Button onClick={startNew}><Icon name="Plus" className="w-4 h-4" /> Adicionar</Button>} />
      ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(p => (
          <div key={p.id} className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-20 h-20 rounded-lg bg-bg-soft border border-slate-200 grid place-items-center overflow-hidden">
                {p.image
                  ? <img src={p.image} alt={p.name} className="max-h-16 max-w-[68px] object-contain" />
                  : <div className="grid place-items-center h-12 w-12 rounded-md bg-primary text-accent font-extrabold text-sm">
                      {p.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                }
              </div>
              <div className="min-w-0">
                <div className="font-bold text-primary truncate">{p.name}</div>
                <div className="text-xs text-text-muted truncate">{p.desc}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-text-muted line-clamp-2">{p.about || <span className="italic">Sem descrição completa.</span>}</div>
            <div className="mt-4 flex items-center justify-between">
              <Toggle checked={p.active} onChange={() => toggle(p)} label={p.active ? "Ativo" : "Inativo"} />
              <div className="flex gap-1">
                <button onClick={() => setEditing({ ...p })} title="Editar" className="p-2 text-text-muted hover:text-primary"><Icon name="Pencil" className="w-4 h-4" /></button>
                <button onClick={() => del(p)} title="Excluir" className="p-2 text-text-muted hover:text-red-600"><Icon name="Trash2" className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)}
        title={editing?.id ? `Editar ${editing.kind === "supplier" ? "fornecedor" : "cliente"}` : `Novo ${editing?.kind === "supplier" ? "fornecedor" : "cliente"}`}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button><Button onClick={save}><Icon name="Save" className="w-4 h-4" />Salvar</Button></>} size="lg">
        {editing && (
          <div className="grid sm:grid-cols-[200px_1fr] gap-5">
            {/* Image upload */}
            <div>
              <div className="text-sm font-semibold text-primary mb-1.5">Logo / imagem</div>
              <div className="aspect-square rounded-lg border border-slate-200 bg-bg-soft grid place-items-center overflow-hidden">
                {editing.image
                  ? <img src={editing.image} alt={editing.name} className="max-h-[160px] max-w-[160px] object-contain" />
                  : <div className="flex flex-col items-center gap-2 text-text-muted">
                      <div className="grid place-items-center h-14 w-14 rounded-md bg-primary text-accent font-extrabold text-base">
                        {(editing.name || "  ").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??"}
                      </div>
                      <span className="text-[11px] text-text-muted">Sem imagem</span>
                    </div>
                }
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <label className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-white px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-primary-700">
                  <Icon name="Upload" className="w-4 h-4" /> {editing.image ? "Trocar" : "Enviar"}
                  <input type="file" className="hidden" accept={ACCEPT} onChange={onImage} />
                </label>
                {editing.image && <Button variant="ghost" size="sm" onClick={() => setEditing({ ...editing, image: null })}><Icon name="X" className="w-4 h-4" /></Button>}
              </div>
              <p className="mt-1.5 text-[11px] text-text-muted leading-snug">PNG, JPG ou SVG. Máx 2 MB.</p>
            </div>

            <div className="space-y-3">
              <Field label="Nome"><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="Descrição curta" hint="Aparece como subtítulo no card.">
                <Input value={editing.desc} onChange={e => setEditing({ ...editing, desc: e.target.value })} placeholder="ex: Tintas industriais" />
              </Field>
              <Field label="Descrição completa" hint="Exibida no modal de detalhes ao clicar no card.">
                <Textarea rows={4} value={editing.about || ""} onChange={e => setEditing({ ...editing, about: e.target.value })} placeholder="Conte mais sobre este parceiro: área de atuação, especialidades, histórico de relacionamento..." />
              </Field>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Link (opcional)"><Input value={editing.url} onChange={e => setEditing({ ...editing, url: e.target.value })} placeholder="https://..." /></Field>
                <Field label="Tipo">
                  <Select value={editing.kind} onChange={e => setEditing({ ...editing, kind: e.target.value as PartnerKind })}>
                    <option value="supplier">Fornecedor</option>
                    <option value="client">Cliente</option>
                  </Select>
                </Field>
              </div>
              <Toggle checked={editing.active} onChange={v => setEditing({ ...editing, active: v })} label="Exibir no site" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
