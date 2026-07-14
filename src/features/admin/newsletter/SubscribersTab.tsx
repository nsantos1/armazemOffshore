"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Select } from "@/components/ui/FormControls";
import { Modal } from "@/components/ui/Modal";
import { useConfirm } from "@/components/ui/useConfirm";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { fmtDateShort } from "@/lib/utils";
import { isApiFailure } from "@/lib/types";
import type { NLSubscriber, NLSubscriberStatus } from "@/lib/types";

const PAGE_SIZE = 20;

const STATUS_BADGE: Record<NLSubscriberStatus, { bg: string; label: string }> = {
  active: { bg: "bg-emerald-100 text-emerald-700", label: "Ativo" },
  unsubscribed: { bg: "bg-slate-200 text-slate-700", label: "Cancelado" },
};

const SOURCE_LABEL: Record<string, string> = {
  contact_form: "Fale Conosco", manual: "Cadastro manual", import: "Importação",
};

export function SubscribersTab() {
  const toast = useToast();
  const [confirm, confirmNode] = useConfirm();
  const [list, setList] = React.useState<NLSubscriber[]>(() => api.nlGetSubs());
  const [q, setQ] = React.useState("");
  const [statusF, setStatusF] = React.useState("all");
  const [sourceF, setSourceF] = React.useState("all");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [addOpen, setAddOpen] = React.useState(false);
  const [addEmail, setAddEmail] = React.useState("");

  const reload = () => setList(api.nlGetSubs());
  const sources = ["all", ...new Set(list.map(s => s.source))];

  const filtered = list.filter(s => {
    if (statusF !== "all" && s.status !== statusF) return false;
    if (sourceF !== "all" && s.source !== sourceF) return false;
    if (q && !s.email.toLowerCase().includes(q.toLowerCase())) return false;
    if (from && new Date(s.createdAt) < new Date(from)) return false;
    if (to && new Date(s.createdAt) > new Date(to + "T23:59:59")) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  React.useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]);

  const del = async (s: NLSubscriber) => {
    const ok = await confirm({ title: "Remover inscrito", message: `Remover ${s.email}?`, danger: true, confirmText: "Remover" });
    if (!ok) return;
    api.nlDeleteSub(s.id); reload(); toast("Inscrito removido.", "success");
  };
  const toggleStatus = (s: NLSubscriber) => {
    const next = s.status === "active" ? "unsubscribed" : "active";
    api.nlUpdateSub(s.id, { status: next });
    reload();
  };
  const addManual = () => {
    const r = api.nlAddSub(addEmail, { source: "manual" });
    if (isApiFailure(r)) {
      if (r.reason === "invalid_email") toast("E-mail inválido.", "error");
      else if (r.reason === "already_subscribed") toast("Esse e-mail já está inscrito.", "info");
      return;
    }
    setAddEmail(""); setAddOpen(false); reload();
    toast(r.reactivated ? "Inscrição reativada." : "Inscrito adicionado.", "success");
  };

  const exportCSV = () => {
    const rows = [
      ["E-mail", "Status", "Origem", "Data de cadastro"],
      ...filtered.map(s => [s.email, s.status, s.source, fmtDateShort(s.createdAt)]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `newsletter-inscritos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast(`Exportado: ${filtered.length} inscritos.`, "success");
  };

  const statusBadge = (s: NLSubscriber) => {
    const cfg = STATUS_BADGE[s.status] || STATUS_BADGE.active;
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${cfg.bg}`}>{cfg.label}</span>;
  };
  const sourceLabel = (src: string) => SOURCE_LABEL[src] || src;

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-card overflow-hidden">
      {confirmNode}
      {/* toolbar */}
      <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="Buscar e-mail..." className="pl-9" />
        </div>
        <Select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} className="w-auto">
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="unsubscribed">Cancelados</option>
        </Select>
        <Select value={sourceF} onChange={e => { setSourceF(e.target.value); setPage(1); }} className="w-auto">
          {sources.map(s => <option key={s} value={s}>{s === "all" ? "Todas as origens" : sourceLabel(s)}</option>)}
        </Select>
        <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-auto" />
        <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-auto" />
        <Button variant="outline" size="sm" onClick={exportCSV}><Icon name="Download" className="w-4 h-4" /> Exportar CSV</Button>
        <Button size="sm" onClick={() => setAddOpen(true)}><Icon name="Plus" className="w-4 h-4" /> Adicionar</Button>
      </div>

      {/* table */}
      {filtered.length === 0 ? (
        <div className="p-6"><EmptyState icon="Mail" title="Nenhum inscrito encontrado" hint="Ajuste os filtros ou cadastre um e-mail manualmente." /></div>
      ) : (
      <>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-bg-soft text-left text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-5 py-3">E-mail</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Origem</th>
              <th className="px-3 py-3">Cadastro</th>
              <th className="px-3 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slice.map(s => (
              <tr key={s.id} className="hover:bg-bg-soft">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="grid place-items-center w-8 h-8 rounded-full bg-bg-soft text-primary text-xs font-bold uppercase">
                      {s.email[0]}
                    </span>
                    <span className="font-mono text-primary text-[13px] break-all">{s.email}</span>
                  </div>
                </td>
                <td className="px-3 py-3">{statusBadge(s)}</td>
                <td className="px-3 py-3 text-text-muted">{sourceLabel(s.source)}</td>
                <td className="px-3 py-3 text-text-muted whitespace-nowrap">{fmtDateShort(s.createdAt)}</td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  <button onClick={() => toggleStatus(s)} title={s.status === "active" ? "Marcar como cancelado" : "Reativar"} className="p-2 text-text-muted hover:text-primary">
                    <Icon name={s.status === "active" ? "UserX" : "UserCheck"} className="w-4 h-4" />
                  </button>
                  <button onClick={() => del(s)} title="Excluir" className="p-2 text-text-muted hover:text-red-600"><Icon name="Trash2" className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* pagination */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 text-sm text-text-muted">
        <span>Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}</span>
        <div className="flex gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-bg-soft"><Icon name="ChevronLeft" className="w-4 h-4" /></button>
          <span className="px-3 py-1.5 font-bold text-primary">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-bg-soft"><Icon name="ChevronRight" className="w-4 h-4" /></button>
        </div>
      </div>
      </>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Adicionar inscrito"
        footer={<><Button variant="ghost" onClick={() => setAddOpen(false)}>Cancelar</Button><Button onClick={addManual}><Icon name="Plus" className="w-4 h-4" />Adicionar</Button></>}>
        <Field label="E-mail" hint="O endereço será marcado como origem 'Cadastro manual'.">
          <Input type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)}
                 placeholder="contato@empresa.com.br" autoFocus
                 onKeyDown={e => { if (e.key === "Enter") addManual(); }} />
        </Field>
      </Modal>
    </div>
  );
}
