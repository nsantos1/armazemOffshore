"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { StripedPlaceholder } from "@/components/ui/StripedPlaceholder";
import { applyPostAnalytics } from "@/lib/analytics";
import { useLang } from "@/lib/i18n";
import { fmtDate } from "@/lib/utils";
import type { NavigateFn, Post } from "@/lib/types";

export interface BlogPostPageProps {
  slug: string;
  posts: Post[];
  navigate: NavigateFn;
}

export function BlogPostPage({ slug, posts, navigate }: BlogPostPageProps) {
  const { t } = useLang();
  const post = posts.find(p => p.slug === slug && p.status === "published");
  React.useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  // Google Analytics específico deste post (definido no admin). Dispara de forma
  // invisível apenas aqui, na página pública, e é removido ao sair do post.
  React.useEffect(() => {
    applyPostAnalytics(post?.analyticsTag);
    return () => applyPostAnalytics(null);
  }, [post?.id, post?.analyticsTag]);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-24 text-center">
        <h1 className="text-3xl font-extrabold text-primary">{t("blog.notFound")}</h1>
        <p className="mt-2 text-slate-600">{t("blog.notFoundText")}</p>
        <Button className="mt-6" onClick={() => navigate("/blog")}><Icon name="ArrowLeft" className="w-4 h-4" /> {t("blog.backToBlog")}</Button>
      </div>
    );
  }

  const related = posts
    .filter(p => p.status === "published" && p.id !== post.id)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  return (
    <article className="bg-white">
      {/* Header */}
      <header className="bg-primary text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-12 pb-8">
          <nav className="text-xs text-white/60 flex items-center gap-2 mb-4">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="hover:text-accent">{t("blog.home")}</a>
            <Icon name="ChevronRight" className="w-3 h-3" />
            <a href="/blog" onClick={(e) => { e.preventDefault(); navigate("/blog"); }} className="hover:text-accent">{t("blog.news")}</a>
            <Icon name="ChevronRight" className="w-3 h-3" />
            <span className="text-white/80 line-clamp-1">{post.title}</span>
          </nav>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center rounded-full bg-accent text-primary px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">{post.category}</span>
            <span className="text-white/60">·</span>
            <span className="text-white/80">{fmtDate(post.publishedAt)}</span>
            <span className="text-white/60">·</span>
            <span className="text-white/80">{post.readTime} {t("blog.readTime")}</span>
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">{post.title}</h1>
          <p className="mt-4 text-lg text-white/80 max-w-3xl leading-relaxed">{post.excerpt}</p>
          <div className="mt-6 flex items-center gap-3">
            <div className="grid place-items-center w-10 h-10 rounded-full bg-accent text-primary font-extrabold">
              {(post.author || "").split(" ").map(w => w[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div className="text-sm font-bold">{post.author}</div>
              <div className="text-xs text-white/60">{t("blog.teamSubtitle")}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Cover */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-4">
        <div className="post-cover aspect-[16/8] rounded-2xl shadow-deep">
          {post.cover ? <img src={post.cover} alt={post.title} /> :
            <StripedPlaceholder hue={post.coverHue || 210} label="imagem de capa" className="w-full h-full" />}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <div className="article-body" dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Tags */}
        {(post.tags || []).length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map(t => (
              <span key={t} className="rounded-full bg-bg-soft px-3 py-1.5 text-xs font-semibold text-primary">#{t}</span>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="mt-10 pt-8 border-t border-slate-200 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-text-muted">{t("blog.share")}</div>
          <div className="flex gap-2">
            {[
              { i: "Linkedin", l: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.href)}` },
              { i: "Facebook", l: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}` },
              { i: "MessageCircle", l: `https://wa.me/?text=${encodeURIComponent(post.title + " " + location.href)}` },
              { i: "Link", l: "#" },
            ].map(s => (
              <a key={s.i} href={s.l} target="_blank" rel="noreferrer"
                className="grid place-items-center w-10 h-10 rounded-md bg-bg-soft text-primary hover:bg-primary hover:text-accent transition"
                aria-label={`Compartilhar em ${s.i}`}>
                <Icon name={s.i} className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-bg-soft py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-end justify-between gap-4 mb-8">
              <h2 className="text-2xl font-extrabold text-primary">{t("blog.continueReading")}</h2>
              <a href="/blog" onClick={(e) => { e.preventDefault(); navigate("/blog"); }} className="text-sm font-semibold text-primary hover:text-primary-700">{t("blog.viewAll")}</a>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map(p => (
                <a key={p.id} href={`/blog/${p.slug}`}
                   onClick={(e) => { e.preventDefault(); navigate(`/blog/${p.slug}`); }}
                   className="group block rounded-xl overflow-hidden bg-white border border-slate-200 shadow-card hover:shadow-deep hover:-translate-y-0.5 transition">
                  <div className="post-cover aspect-[16/10]">
                    {p.cover ? <img src={p.cover} alt="" /> :
                      <StripedPlaceholder hue={p.coverHue || 210} label="capa" className="w-full h-full" />}
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-text-muted">{fmtDate(p.publishedAt)} · {p.category}</div>
                    <h3 className="mt-2 text-base font-bold text-primary leading-snug group-hover:text-primary-700 line-clamp-2">{p.title}</h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
