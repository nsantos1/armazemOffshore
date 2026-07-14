"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { StripedPlaceholder } from "@/components/ui/StripedPlaceholder";
import { api } from "@/lib/api";
import { fetchAdminPosts } from "@/lib/posts-client";
import { fmtDateShort } from "@/lib/utils";
import type { NavigateFn, Post } from "@/lib/types";

export function DashboardPage({ navigate }: { navigate: NavigateFn }) {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [banners] = React.useState(() => api.getBanners());
  const [partners] = React.useState(() => api.getPartners());

  React.useEffect(() => {
    fetchAdminPosts().then(setPosts).catch(() => setPosts([]));
  }, []);

  const published = posts.filter(p => p.status === "published");
  const drafts = posts.filter(p => p.status === "draft");
  const activeBanners = banners.filter(b => b.active);

  const stats = [
    { label: "Posts publicados", value: published.length, icon: "FileCheck2", trend: "+2 este mês" },
    { label: "Rascunhos", value: drafts.length, icon: "FilePen", trend: "em produção" },
    { label: "Banners ativos", value: activeBanners.length, icon: "Megaphone", trend: `${banners.length} no total` },
    { label: "Parceiros", value: partners.length, icon: "Users", trend: "fornecedores + clientes" },
  ];

  const recent = [...posts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl bg-primary text-white p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[.05]"
             style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[.25em] text-accent font-bold">Boa volta</div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold">Visão geral do conteúdo público.</h2>
            <p className="mt-2 text-white/75 max-w-lg text-sm">Acompanhe banners, notícias e parceiros — tudo o que o cliente final enxerga no site armazemoffshore.com.br.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="accent" onClick={() => navigate("/ac-admin/posts/new")}><Icon name="Plus" className="w-4 h-4" /> Novo post</Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => navigate("/ac-admin/banners")}>
              <Icon name="Megaphone" className="w-4 h-4" /> Gerenciar banners
            </Button>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="rounded-xl bg-white border border-slate-200 p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="grid place-items-center w-10 h-10 rounded-lg bg-primary text-accent">
                <Icon name={s.icon} className="w-5 h-5" />
              </div>
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">0{i + 1}</span>
            </div>
            <div className="mt-4 text-3xl font-extrabold text-primary">{s.value}</div>
            <div className="mt-1 text-sm text-text-muted">{s.label}</div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-text-muted">{s.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent posts */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-primary">Conteúdo recente</h3>
            <button onClick={() => navigate("/ac-admin/posts")} className="text-sm font-semibold text-primary hover:text-primary-700">Ver todos →</button>
          </div>
          <ul className="divide-y divide-slate-100">
            {recent.map(p => (
              <li key={p.id} className="px-5 py-3 flex items-center gap-3 hover:bg-bg-soft transition">
                <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
                  {p.cover ? <img src={p.cover} alt="" className="w-full h-full object-cover" /> :
                    <StripedPlaceholder hue={p.coverHue || 210} className="w-full h-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-primary truncate">{p.title}</div>
                  <div className="text-xs text-text-muted">{p.category} · {fmtDateShort(p.publishedAt)}</div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {p.status === "published" ? "Publicado" : "Rascunho"}
                </span>
                <button onClick={() => navigate(`/ac-admin/posts/${p.id}`)} className="text-text-muted hover:text-primary p-2"><Icon name="ChevronRight" className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
          <h3 className="font-bold text-primary">Ações rápidas</h3>
          <div className="mt-3 space-y-2">
            {[
              { i: "Plus", l: "Criar nova notícia", to: "/ac-admin/posts/new" },
              { i: "Image", l: "Adicionar banner", to: "/ac-admin/banners" },
              { i: "Mail", l: "Enviar newsletter", to: "/ac-admin/newsletter" },
              { i: "UserPlus", l: "Cadastrar parceiro", to: "/ac-admin/partners" },
              { i: "Palette", l: "Atualizar identidade", to: "/ac-admin/identity" },
              { i: "Settings", l: "Editar dados de contato", to: "/ac-admin/settings" },
            ].map((q, i) => (
              <button key={i} onClick={() => navigate(q.to)} className="w-full flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2.5 text-sm font-semibold text-primary hover:bg-bg-soft hover:border-primary/30 transition">
                <span className="flex items-center gap-2"><Icon name={q.i} className="w-4 h-4 text-primary" /> {q.l}</span>
                <Icon name="ArrowRight" className="w-4 h-4 text-text-muted" />
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-lg bg-primary p-4 text-white">
            <div className="flex items-center gap-2 text-accent font-bold text-sm"><Icon name="ShieldCheck" className="w-4 h-4" /> ISO 9001:2015</div>
            <div className="mt-1 text-xs text-white/75">Certificação ativa. Próxima auditoria interna em 60 dias.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
