"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/FormControls";
import { Modal } from "@/components/ui/Modal";
import { StripedPlaceholder } from "@/components/ui/StripedPlaceholder";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { createAdminPost, fetchAdminPost, updateAdminPost } from "@/lib/posts-client";
import { uploadImage } from "@/lib/uploads-client";
import { slugify } from "@/lib/utils";
import type { NavigateFn, Post } from "@/lib/types";
import { RichEditor } from "../RichEditor";
import { CategoryManagerModal } from "./CategoryManagerModal";

export interface PostEditorPageProps {
  id: string; // "new" para criação
  navigate: NavigateFn;
}

type PostDraft = Omit<Post, "id">;
type PostErrors = Partial<Record<"title" | "slug" | "excerpt" | "content", string>>;

const newDraft = (): PostDraft => ({
  title: "", slug: "", excerpt: "", content: "",
  category: api.getCategories()[0] || "Insights Offshore", author: "Redação Armazém", tags: [],
  status: "draft", cover: null, coverHue: 210, readTime: 4, publishedAt: new Date().toISOString(),
  seo: { title: "", description: "", keywords: "" },
  analyticsTag: "",
});

export function PostEditorPage({ id, navigate }: PostEditorPageProps) {
  const toast = useToast();
  const isNew = id === "new";

  const [post, setPost] = React.useState<PostDraft | Post>(() => newDraft());
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);
  const [tagInput, setTagInput] = React.useState("");
  const [errors, setErrors] = React.useState<PostErrors>({});
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [catManagerOpen, setCatManagerOpen] = React.useState(false);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  const set = <K extends keyof PostDraft>(k: K, v: PostDraft[K]) => setPost(p => ({ ...p, [k]: v }));
  const setSeo = (k: keyof Post["seo"], v: string) => setPost(p => ({ ...p, seo: { ...p.seo, [k]: v } }));

  // Ao editar, carrega o post do servidor. O formulário (e o RichEditor) só é
  // renderizado depois de carregar — assim o editor monta já com o conteúdo certo.
  React.useEffect(() => {
    if (isNew) return;
    let alive = true;
    (async () => {
      try {
        const p = await fetchAdminPost(id);
        if (alive) setPost(p);
      } catch (e) {
        toast(e instanceof Error ? e.message : "Falha ao carregar o post.", "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, isNew, toast]);

  // Auto-slug while title is being typed in new mode
  React.useEffect(() => {
    if (isNew && post.title) set("slug", slugify(post.title));
  }, [post.title]);

  const onCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { set("cover", await uploadImage(file)); }
    catch (err) { toast(err instanceof Error ? err.message : "Falha ao enviar a imagem.", "error"); }
    e.target.value = "";
  };

  const addTag = () => {
    const t = tagInput.trim(); if (!t) return;
    if ((post.tags || []).includes(t)) { setTagInput(""); return; }
    set("tags", [...(post.tags || []), t]); setTagInput("");
  };
  const rmTag = (t: string) => set("tags", (post.tags || []).filter(x => x !== t));

  const validate = (): boolean => {
    const e: PostErrors = {};
    if (!post.title.trim()) e.title = "Obrigatório";
    if (!post.slug.trim()) e.slug = "Obrigatório";
    if (!post.excerpt.trim()) e.excerpt = "Obrigatório";
    if (!post.content.trim() || post.content === "<br>") e.content = "Escreva o conteúdo";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const save = async (status?: Post["status"]) => {
    if (!validate()) { toast("Revise os campos obrigatórios.", "error"); return; }
    const next = { ...post, status: status || post.status };
    setSaving(true);
    try {
      if (isNew) {
        await createAdminPost(next);
        toast("Post criado com sucesso.", "success");
      } else {
        await updateAdminPost(id, next);
        toast("Post atualizado.", "success");
      }
      // Avisa o App para recarregar os posts públicos (home/blog).
      window.dispatchEvent(new Event("data-changed"));
      navigate("/ac-admin/posts");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Falha ao salvar o post.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-text-muted">
        <Icon name="Loader2" className="w-7 h-7 animate-spin mx-auto" />
        <div className="mt-2 text-sm">Carregando post...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button onClick={() => navigate("/ac-admin/posts")} className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary">
          <Icon name="ArrowLeft" className="w-4 h-4" /> Voltar
        </button>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setPreviewOpen(true)}><Icon name="Eye" className="w-4 h-4" /> Pré-visualizar</Button>
          <Button variant="outline" onClick={() => save("draft")} disabled={saving}><Icon name="Save" className="w-4 h-4" /> Salvar rascunho</Button>
          <Button onClick={() => save("published")} disabled={saving}><Icon name={saving ? "Loader2" : "UploadCloud"} className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} /> Publicar</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Title + slug */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5 space-y-4">
            <Field label="Título" error={errors.title}>
              <Input value={post.title} onChange={e => set("title", e.target.value)} placeholder="Título da matéria" />
            </Field>
            <Field label="URL (slug)" hint={`armazemoffshore.com.br/blog/${post.slug || "..."}`} error={errors.slug}>
              <Input value={post.slug} onChange={e => set("slug", slugify(e.target.value))} placeholder="ex: nova-base-porto-acu" />
            </Field>
            <Field label="Resumo" hint="Aparece na listagem e nas redes sociais." error={errors.excerpt}>
              <Textarea rows={3} value={post.excerpt} onChange={e => set("excerpt", e.target.value)} placeholder="Resumo curto (2-3 linhas)..." />
            </Field>
          </div>

          {/* Editor */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-primary">Conteúdo</label>
              <span className="text-xs text-text-muted">{(post.content || "").replace(/<[^>]*>/g, "").length} caracteres</span>
            </div>
            <RichEditor value={post.content} onChange={(html) => set("content", html)} />
            {errors.content && <div className="mt-2 text-xs text-red-600">{errors.content}</div>}
          </div>

          {/* SEO */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Search" className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-primary">SEO</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Meta título" hint="Recomendado: até 60 caracteres">
                <Input value={post.seo?.title || ""} onChange={e => setSeo("title", e.target.value)} />
              </Field>
              <Field label="Palavras-chave" hint="Separe por vírgula">
                <Input value={post.seo?.keywords || ""} onChange={e => setSeo("keywords", e.target.value)} />
              </Field>
              <Field label="Meta descrição" className="sm:col-span-2" hint="Recomendado: até 160 caracteres">
                <Textarea rows={2} value={post.seo?.description || ""} onChange={e => setSeo("description", e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Google Analytics do post — SOMENTE ADMIN */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="LineChart" className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-primary">Google Analytics deste post</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                <Icon name="Lock" className="w-3 h-3" /> Somente admin
              </span>
            </div>
            <p className="text-xs text-text-muted mb-3 max-w-2xl">
              Cole aqui a tag do Google Analytics do cliente para acompanhar este post — pode ser o
              ID de medição (<span className="font-mono">G-XXXXXXX</span>), um ID do Google Tag
              Manager (<span className="font-mono">GTM-XXXXXXX</span>) ou o snippet completo. Este campo
              é visível <strong>apenas no painel</strong>; ele não aparece para os visitantes e dispara
              de forma invisível somente na página pública deste post.
            </p>
            <Field label="Tag / ID do Google Analytics" hint="Deixe em branco para não rastrear este post individualmente.">
              <Textarea
                rows={3}
                value={post.analyticsTag || ""}
                onChange={e => set("analyticsTag", e.target.value)}
                placeholder="G-XXXXXXXXXX  ou  cole o snippet <script> do Google Analytics"
                className="font-mono text-xs"
              />
            </Field>
          </div>
        </div>

        <aside className="space-y-4">
          {/* Status */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
            <h3 className="font-bold text-primary mb-3">Publicação</h3>
            <div className="space-y-3">
              <Field label="Status">
                <Select value={post.status} onChange={e => set("status", e.target.value as Post["status"])}>
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </Select>
              </Field>
              <Field label="Data de publicação">
                <Input type="datetime-local"
                  value={post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : ""}
                  onChange={e => set("publishedAt", new Date(e.target.value).toISOString())} />
              </Field>
              <Field label="Tempo de leitura (min)">
                <Input type="number" min={1} value={post.readTime || 4} onChange={e => set("readTime", Number(e.target.value) || 1)} />
              </Field>
            </div>
          </div>

          {/* Cover */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
            <h3 className="font-bold text-primary mb-3">Imagem de capa</h3>
            <div className="aspect-[16/10] rounded-lg overflow-hidden border border-slate-200">
              {post.cover
                ? <img src={post.cover} alt="" className="w-full h-full object-cover" />
                : <StripedPlaceholder hue={post.coverHue || 210} label="sem capa" className="w-full h-full" />}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-primary-700">
                <Icon name="Upload" className="w-4 h-4" /> {post.cover ? "Trocar" : "Enviar"} imagem
                <input type="file" className="hidden" accept="image/*" onChange={onCover} />
              </label>
              <div className="w-full mt-2 flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
                <Icon name="AlertCircle" className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  A imagem deve ter no máximo <strong className="font-semibold">1200×630px</strong> (proporção 16:9). Em outros tamanhos, a capa pode aparecer cortada na visualização do post.
                </span>
              </div>
              {post.cover && <Button variant="ghost" size="sm" onClick={() => set("cover", null)}><Icon name="X" className="w-4 h-4" />Remover</Button>}
            </div>
            <Field label="Cor de fundo (placeholder)" className="mt-3" hint="Usada quando não há imagem.">
              <Input type="range" min={0} max={360} value={post.coverHue || 210} onChange={e => set("coverHue", Number(e.target.value))} />
            </Field>
          </div>

          {/* Taxonomy */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5 space-y-3">
            <h3 className="font-bold text-primary">Classificação</h3>
            <Field label="Categoria">
              <div className="flex gap-2">
                <Select value={post.category} onChange={e => set("category", e.target.value)} className="flex-1">
                  {api.getCategories().map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
                <button
                  type="button"
                  onClick={() => setCatManagerOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-primary hover:bg-bg-soft hover:border-primary transition whitespace-nowrap"
                  title="Gerenciar categorias"
                >
                  <Icon name="Tag" className="w-4 h-4" /> Gerenciar
                </button>
              </div>
            </Field>
            <Field label="Autor">
              <Input value={post.author} onChange={e => set("author", e.target.value)} />
            </Field>
            <Field label="Tags">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(post.tags || []).map(t => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-bg-soft px-2.5 py-1 text-xs font-semibold text-primary">
                    #{t}
                    <button onClick={() => rmTag(t)} className="text-text-muted hover:text-red-600"><Icon name="X" className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Adicionar tag e Enter" />
                <Button variant="outline" onClick={addTag} type="button">Adicionar</Button>
              </div>
            </Field>
          </div>
        </aside>
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Pré-visualização" size="lg">
        <div className="space-y-3">
          <div className="aspect-[16/8] rounded-lg overflow-hidden">
            {post.cover ? <img src={post.cover} alt="" className="w-full h-full object-cover" /> :
              <StripedPlaceholder hue={post.coverHue || 210} label="capa" className="w-full h-full" />}
          </div>
          <span className="inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-700">{post.category}</span>
          <h2 className="text-2xl font-extrabold text-primary leading-tight">{post.title || "Sem título"}</h2>
          <p className="text-slate-600">{post.excerpt}</p>
          <div className="article-body" dangerouslySetInnerHTML={{ __html: post.content || "<p>(sem conteúdo)</p>" }} />
        </div>
      </Modal>
      <CategoryManagerModal
        open={catManagerOpen}
        onClose={() => setCatManagerOpen(false)}
        currentCategory={post.category}
        onCategoryChange={(newCat) => set("category", newCat)}
        onChanged={forceUpdate}
      />
    </div>
  );
}
