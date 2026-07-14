// Repositório das NOTÍCIAS (posts). Persistência via camada genérica de banco
// (ver db.ts): a lista de posts é um registro JSON sob a chave "posts".
// Server-only — importe só em route handlers.

import { randomUUID } from "crypto";
import { getBlob, setBlob } from "./db";
import type { Post } from "./types";

const KEY = "posts";

export async function readPosts(): Promise<Post[]> {
  return (await getBlob<Post[]>(KEY)) ?? [];
}

async function writePosts(list: Post[]): Promise<void> {
  await setBlob(KEY, list);
}

// Publicados, mais recentes primeiro (consumo público).
export async function listPublished(): Promise<Post[]> {
  const list = await readPosts();
  return list
    .filter(p => p.status === "published")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getPost(id: string): Promise<Post | undefined> {
  return (await readPosts()).find(p => p.id === id);
}

export async function createPost(data: Partial<Post>): Promise<Post> {
  const list = await readPosts();
  const post: Post = {
    id: randomUUID(),
    slug: "",
    title: "",
    excerpt: "",
    cover: null,
    coverHue: 210,
    category: "",
    author: "",
    publishedAt: new Date().toISOString(),
    readTime: 4,
    status: "draft",
    tags: [],
    seo: { title: "", description: "", keywords: "" },
    content: "",
    ...data,
  };
  await writePosts([post, ...list]);
  return post;
}

export async function updatePost(id: string, patch: Partial<Post>): Promise<Post | undefined> {
  const list = await readPosts();
  let updated: Post | undefined;
  const next = list.map(p => {
    if (p.id !== id) return p;
    updated = { ...p, ...patch, id: p.id };
    return updated;
  });
  if (!updated) return undefined;
  await writePosts(next);
  return updated;
}

export async function deletePost(id: string): Promise<boolean> {
  const list = await readPosts();
  const next = list.filter(p => p.id !== id);
  if (next.length === list.length) return false;
  await writePosts(next);
  return true;
}
