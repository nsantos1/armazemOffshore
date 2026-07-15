"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { EmptyState } from "@/components/ui/EmptyState";
import { useConfirm } from "@/components/ui/useConfirm";
import { useToast } from "@/components/ui/Toast";
import { createCampaign, deleteCampaign, fetchCampaigns } from "@/lib/newsletter-client";
import { fmtDateShort } from "@/lib/utils";
import type { NavigateFn, NLCampaign, NLCampaignStatus } from "@/lib/types";
import { CampaignDetailModal } from "./EmailModals";

const STATUS_BADGE: Record<string, { bg: string; label: string }> = {
  sent: { bg: "bg-emerald-100 text-emerald-700", label: "Enviada" },
  draft: { bg: "bg-amber-100 text-amber-700", label: "Rascunho" },
  scheduled: { bg: "bg-sky-100 text-sky-700", label: "Agendada" },
  failed: { bg: "bg-red-100 text-red-700", label: "Falha" },
};

export function HistoryTab({ navigate }: { navigate: NavigateFn }) {
  const toast = useToast();
  const [confirm, confirmNode] = useConfirm();
  const [list, setList] = React.useState<NLCampaign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState<NLCampaign | null>(null);
  const reload = React.useCallback(async () => {
    setLoading(true);
    try { setList(await fetchCampaigns()); }
    catch (e) { toast(e instanceof Error ? e.message : "Falha ao carregar campanhas.", "error"); }
    finally { setLoading(false); }
  }, [toast]);
  React.useEffect(() => { reload(); }, [reload]);

  const del = async (c: NLCampaign) => {
    const ok = await confirm({ title: "Excluir campanha", message: `Excluir "${c.subject}"?`, danger: true, confirmText: "Excluir" });
    if (!ok) return;
    try { await deleteCampaign(c.id); setList(l => l.filter(x => x.id !== c.id)); toast("Campanha excluída.", "success"); }
    catch (e) { toast(e instanceof Error ? e.message : "Falha ao excluir.", "error"); }
  };
  const duplicate = async (c: NLCampaign) => {
    try {
      await createCampaign({ subject: `(Cópia) ${c.subject}`, preheader: c.preheader, content: c.content, coverImage: c.coverImage, status: "draft" });
      await reload(); toast("Campanha duplicada como rascunho.", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Falha ao duplicar.", "error");
    }
  };

  const statusBadge = (c: NLCampaign) => {
    const m: { bg: string; label: string } = STATUS_BADGE[c.status as NLCampaignStatus] || { bg: "bg-slate-100 text-slate-700", label: c.status };
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${m.bg}`}>{m.label}</span>;
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-card overflow-hidden">
      {confirmNode}
      {loading ? (
        <div className="p-10 text-center text-text-muted"><Icon name="Loader2" className="w-6 h-6 animate-spin mx-auto" /><div className="mt-2 text-sm">Carregando campanhas...</div></div>
      ) : list.length === 0 ? (
        <div className="p-6"><EmptyState icon="History" title="Nenhuma campanha enviada" hint="Compor sua primeira newsletter na aba 'Enviar campanha'." /></div>
      ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-bg-soft text-left text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-5 py-3">Assunto</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Envio</th>
              <th className="px-3 py-3 text-right">Destinatários</th>
              <th className="px-3 py-3 text-right">Aberturas</th>
              <th className="px-3 py-3 text-right">Cliques</th>
              <th className="px-3 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map(c => {
              const openRate = c.sentCount ? Math.round((c.opensCount / c.sentCount) * 100) : 0;
              const clickRate = c.sentCount ? Math.round((c.clicksCount / c.sentCount) * 100) : 0;
              return (
                <tr key={c.id} onClick={() => setOpen(c)} className="hover:bg-bg-soft cursor-pointer">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-primary line-clamp-1 max-w-[420px]">{c.subject || "(sem assunto)"}</div>
                    {c.preheader && <div className="text-xs text-text-muted line-clamp-1 max-w-[420px]">{c.preheader}</div>}
                  </td>
                  <td className="px-3 py-3">{statusBadge(c)}</td>
                  <td className="px-3 py-3 text-text-muted whitespace-nowrap">{c.sentAt ? fmtDateShort(c.sentAt) : "—"}</td>
                  <td className="px-3 py-3 text-right font-mono">{c.sentCount || "—"}</td>
                  <td className="px-3 py-3 text-right font-mono">{c.status === "sent" ? `${c.opensCount} (${openRate}%)` : "—"}</td>
                  <td className="px-3 py-3 text-right font-mono">{c.status === "sent" ? `${c.clicksCount} (${clickRate}%)` : "—"}</td>
                  <td className="px-3 py-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setOpen(c)} title="Detalhes" className="p-2 text-text-muted hover:text-primary"><Icon name="Eye" className="w-4 h-4" /></button>
                    <button onClick={() => duplicate(c)} title="Duplicar" className="p-2 text-text-muted hover:text-primary"><Icon name="Copy" className="w-4 h-4" /></button>
                    <button onClick={() => del(c)} title="Excluir" className="p-2 text-text-muted hover:text-red-600"><Icon name="Trash2" className="w-4 h-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      <CampaignDetailModal camp={open} onClose={() => setOpen(null)} />
    </div>
  );
}
