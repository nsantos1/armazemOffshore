"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/FormControls";
import { StripedPlaceholder } from "@/components/ui/StripedPlaceholder";
import { useConfirm } from "@/components/ui/useConfirm";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { deleteAdminPost, fetchAdminPosts } from "@/lib/posts-client";
import { fmtDateShort } from "@/lib/utils";
import type { NavigateFn, Post } from "@/lib/types";

export function PostsListPage({ navigate }: { navigate: NavigateFn }) {
  const toast = useToast();
  const [confirm, confirmNode] = useConfirm();
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [catFilter, setCatFilter] = React.useState("all");

  const reload = React.useCallback(async () => {
    setLoading(true);
    try { setPosts(await fetchAdminPosts()); }
    catch (e) { toast(e instanceof Error ? e.message : "Falha ao carregar posts.", "error"); }
    finally { setLoading(false); }
  }, [toast]);
  React.useEffect(() => { reload(); }, [reload]);

  const cats = ["all", ...api.getCategories()];
  const catCounts = posts.reduce<Record<string, number>>((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});

  const filtered = posts.filter(p => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (catFilter !== "all" && p.category !== catFilter) return false;
    if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const del = async (p: Post) => {
    const ok = await confirm({ title: "Excluir post", message: `Tem certeza que deseja excluir "${p.title}"?`, danger: true, confirmText: "Excluir" });
    if (!ok) return;
    try {
      await deleteAdminPost(p.id);
      setPosts(list => list.filter(x => x.id !== p.id));
      toast("Post excluído.", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Falha ao excluir.", "error");
    }
  };

  return (
    <div className="space-y-4">
      {confirmNode}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between">
          <div>
            <h2 className="font-bold text-primary">Notícias</h2>
            <p className="text-xs text-text-muted">{filtered.length} de {posts.length} posts</p>
          </div>
          <Button onClick={() => navigate("/ac-admin/posts/new")}><Icon name="Plus" className="w-4 h-4" /> Novo post</Button>
        </div>

        <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar título..." className="pl-9" />
          </div>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-auto">
            <option value="all">Todos os status</option>
            <option value="published">Publicados</option>
            <option value="draft">Rascunhos</option>
          </Select>
          <Select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-auto min-w-[220px]">
            <option value="all">Todas as categorias ({posts.length})</option>
            {cats.filter(c => c !== "all").map(c => (
              <option key={c} value={c}>{c} ({catCounts[c] || 0})</option>
            ))}
          </Select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-text-muted"><Icon name="Loader2" className="w-6 h-6 animate-spin mx-auto" /><div className="mt-2 text-sm">Carregando posts...</div></div>
        ) : filtered.length === 0 ? (
          <div className="p-6"><EmptyState icon="Newspaper" title="Nenhum post encontrado" hint="Ajuste os filtros ou crie um novo post."
            action={<Button onClick={() => navigate("/ac-admin/posts/new")}><Icon name="Plus" className="w-4 h-4" /> Criar post</Button>} /></div>
        ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-bg-soft text-left text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-5 py-3">Título</th>
              <th className="px-3 py-3 uppercase tracking-wider">Categoria do post</th>
              <th className="px-3 py-3">Autor</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Publicação</th>
              <th className="px-3 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-bg-soft">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md overflow-hidden shrink-0">
                      {p.cover ? <img src={p.cover} alt="" className="w-full h-full object-cover" /> :
                        <StripedPlaceholder hue={p.coverHue || 210} className="w-full h-full" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-primary truncate max-w-[420px]">{p.title}</div>
                      <div className="text-xs text-text-muted truncate max-w-[420px]">/{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-700 whitespace-nowrap">
                    {p.category}
                  </span>
                </td>
                <td className="px-3 py-3 text-text-muted">{p.author}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {p.status === "published" ? "Publicado" : "Rascunho"}
                  </span>
                </td>
                <td className="px-3 py-3 text-text-muted">{fmtDateShort(p.publishedAt)}</td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  <button onClick={() => window.open(`#/blog/${p.slug}`)} title="Ver" className="p-2 text-text-muted hover:text-primary disabled:opacity-30" disabled={p.status !== "published"}>
                    <Icon name="Eye" className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigate(`/ac-admin/posts/${p.id}`)} title="Editar" className="p-2 text-text-muted hover:text-primary"><Icon name="Pencil" className="w-4 h-4" /></button>
                  <button onClick={() => del(p)} title="Excluir" className="p-2 text-text-muted hover:text-red-600"><Icon name="Trash2" className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        )}
      </div>
    </div>
  );
}
