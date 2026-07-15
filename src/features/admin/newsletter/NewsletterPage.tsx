"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { fetchCampaigns, fetchSubscribers } from "@/lib/newsletter-client";
import type { NavigateFn } from "@/lib/types";
import { ComposeTab } from "./ComposeTab";
import { HistoryTab } from "./HistoryTab";
import { SubscribersTab } from "./SubscribersTab";

type NewsletterTab = "subs" | "compose" | "history";

export interface NewsletterPageProps {
  navigate: NavigateFn;
  initialTab?: NewsletterTab;
}

const TABS: { id: NewsletterTab; label: string; icon: string }[] = [
  { id: "subs", label: "Inscritos", icon: "Users" },
  { id: "compose", label: "Enviar campanha", icon: "Send" },
  { id: "history", label: "Histórico", icon: "History" },
];

export function NewsletterPage({ navigate, initialTab }: NewsletterPageProps) {
  const [tab, setTab] = React.useState<NewsletterTab>(initialTab || "subs");
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-primary">Newsletter</h2>
            <p className="text-xs text-text-muted">Gestão de inscritos e envio de campanhas.</p>
          </div>
          <NewsletterStats />
        </div>
        <div className="mt-4 inline-flex rounded-md bg-bg-soft p-1 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition ${tab === t.id ? "bg-primary text-white" : "text-primary hover:bg-white"}`}>
              <Icon name={t.icon} className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "subs" && <SubscribersTab />}
      {tab === "compose" && <ComposeTab navigate={navigate} setTab={(t) => setTab(t as NewsletterTab)} />}
      {tab === "history" && <HistoryTab navigate={navigate} />}
    </div>
  );
}

function NewsletterStats() {
  const [stats, setStats] = React.useState({ active: 0, total: 0, sent: 0 });
  React.useEffect(() => {
    (async () => {
      try {
        const [subs, camps] = await Promise.all([fetchSubscribers(), fetchCampaigns()]);
        setStats({ active: subs.activeCount, total: subs.total, sent: camps.filter(c => c.status === "sent").length });
      } catch { /* silencioso */ }
    })();
  }, []);
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <span className="rounded-md bg-primary text-white px-3 py-1.5 font-bold">{stats.active} inscritos ativos</span>
      <span className="rounded-md bg-bg-soft text-primary px-3 py-1.5 font-semibold">{stats.total} totais</span>
      <span className="rounded-md bg-accent text-primary px-3 py-1.5 font-bold">{stats.sent} campanhas enviadas</span>
    </div>
  );
}
