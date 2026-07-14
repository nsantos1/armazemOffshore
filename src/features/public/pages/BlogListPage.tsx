"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { EmptyState } from "@/components/ui/EmptyState";
import { StripedPlaceholder } from "@/components/ui/StripedPlaceholder";
import { useLang } from "@/lib/i18n";
import { fmtDate } from "@/lib/utils";
import type { NavigateFn, Post } from "@/lib/types";

export interface BlogListPageProps {
  posts: Post[];
  navigate: NavigateFn;
}

export function BlogListPage({ posts, navigate }: BlogListPageProps) {
  const { t } = useLang();
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("Todas");
  const [tag, setTag] = React.useState<string | null>(null);

  const published = posts.filter(p => p.status === "published")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const catCounts = published.reduce<Record<string, number>>((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
  // Categorias derivadas dos próprios posts publicados (fonte no servidor).
  const cats = ["Todas", ...Object.keys(catCounts).sort((a, b) => a.localeCompare(b, "pt-BR"))];
  const allTags = Array.from(new Set(published.flatMap(p => p.tags || [])));

  const list = published.filter(p => {
    if (cat !== "Todas" && p.category !== cat) return false;
    if (tag && !(p.tags || []).includes(tag)) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!p.title.toLowerCase().includes(s) && !p.excerpt.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const [featured, ...rest] = list;

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-primary text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[.06]"
             style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="text-xs text-white/60 flex items-center gap-2 mb-4">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="hover:text-accent">{t("blog.home")}</a>
            <Icon name="ChevronRight" className="w-3 h-3" />
            <span className="text-white/90">{t("blog.news")}</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-[.25em] text-accent mb-3">{t("blog.pressRoom")}</div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{t("blog.listTitle")}</h1>
              <p className="mt-3 text-white/75 max-w-xl">{t("blog.listSubtitle")}</p>
            </div>
            <div className="relative w-full md:w-80">
              <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                value={q} onChange={e => setQ(e.target.value)}
                placeholder={t("blog.search")}
                className="w-full rounded-full bg-white/10 border border-white/15 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-accent focus:bg-white/15"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white sticky top-16 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {cats.map(c => {
            const count = c === "Todas" ? published.length : (catCounts[c] || 0);
            return (
              <button key={c} onClick={() => setCat(c)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${cat === c ? "bg-primary text-white" : "bg-bg-soft text-primary hover:bg-slate-200"}`}>
                {c === "Todas" ? t("blog.all") : c}
                <span className={`inline-flex items-center justify-center min-w-[20px] rounded-full px-1.5 text-[10px] font-bold ${cat === c ? "bg-white/20 text-white" : "bg-white text-text-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {list.length === 0 ? (
            <EmptyState icon="Newspaper" title={t("blog.empty")} hint={t("blog.emptyHint")} />
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <a href={`/blog/${featured.slug}`} onClick={(e) => { e.preventDefault(); navigate(`/blog/${featured.slug}`); }}
                   className="group block rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-card hover:shadow-deep transition mb-10">
                  <div className="grid lg:grid-cols-2 gap-0">
                    <div className="post-cover aspect-[16/10] lg:aspect-auto lg:min-h-[360px]">
                      {featured.cover ? <img src={featured.cover} alt="" /> :
                        <StripedPlaceholder hue={featured.coverHue || 210} label="capa em destaque" className="w-full h-full min-h-[280px]" />}
                    </div>
                    <div className="p-8 lg:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span className="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-700">{featured.category}</span>
                        <span>{fmtDate(featured.publishedAt)}</span>
                        <span>·</span>
                        <span>{featured.readTime} {t("blog.readTime")}</span>
                      </div>
                      <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-primary leading-tight group-hover:text-primary-700 transition">
                        {featured.title}
                      </h2>
                      <p className="mt-3 text-slate-600 leading-relaxed">{featured.excerpt}</p>
                      <div className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">
                        {t("blog.read")} <Icon name="ArrowRight" className="w-4 h-4 transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </a>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map(p => (
                  <a key={p.id} href={`/blog/${p.slug}`}
                     onClick={(e) => { e.preventDefault(); navigate(`/blog/${p.slug}`); }}
                     className="group block rounded-xl overflow-hidden bg-white border border-slate-200 shadow-card hover:shadow-deep hover:-translate-y-0.5 transition">
                    <div className="post-cover aspect-[16/10]">
                      {p.cover ? <img src={p.cover} alt={p.title} /> :
                        <StripedPlaceholder hue={p.coverHue || 210} label="capa" className="w-full h-full" />}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span className="inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-700">{p.category}</span>
                        <span>{fmtDate(p.publishedAt)}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-primary leading-snug group-hover:text-primary-700 transition line-clamp-2">{p.title}</h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{p.excerpt}</p>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}

          {/* Tag cloud */}
          {allTags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-slate-200">
              <div className="text-xs font-bold uppercase tracking-[.25em] text-text-muted mb-3">{t("blog.tags")}</div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setTag(null)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${!tag ? "bg-primary text-white" : "bg-bg-soft text-primary hover:bg-slate-200"}`}>{t("blog.all")}</button>
                {allTags.map(t => (
                  <button key={t} onClick={() => setTag(t === tag ? null : t)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tag === t ? "bg-primary text-white" : "bg-bg-soft text-primary hover:bg-slate-200"}`}>
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
