// Cliente (browser) das APIs de notícias. Centraliza as chamadas fetch — o admin
// envia a chave de escrita; o público lê sem chave. Lança Error com a mensagem do
// servidor em caso de falha, para os componentes tratarem com toast.

import type { Post } from "./types";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";
const adminHeaders = { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY };

async function unwrap(res: Response): Promise<Record<string, unknown>> {
  const data = await res.json().catch(() => ({} as Record<string, unknown>));
  if (!res.ok || !data.ok) {
    throw new Error((data.error as string) || "Falha na operação.");
  }
  return data;
}

// ---- Público -------------------------------------------------------------
export async function fetchPublicPosts(): Promise<Post[]> {
  const res = await fetch("/api/posts", { cache: "no-store" });
  const data = await unwrap(res);
  return (data.posts as Post[]) || [];
}

// ---- Admin (protegido) ---------------------------------------------------
export async function fetchAdminPosts(): Promise<Post[]> {
  const res = await fetch("/api/admin/posts", { headers: adminHeaders, cache: "no-store" });
  const data = await unwrap(res);
  return (data.posts as Post[]) || [];
}

export async function fetchAdminPost(id: string): Promise<Post> {
  const res = await fetch(`/api/admin/posts/${encodeURIComponent(id)}`, { headers: adminHeaders, cache: "no-store" });
  const data = await unwrap(res);
  return data.post as Post;
}

export async function createAdminPost(data: Partial<Post>): Promise<Post> {
  const res = await fetch("/api/admin/posts", { method: "POST", headers: adminHeaders, body: JSON.stringify(data) });
  return (await unwrap(res)).post as Post;
}

export async function updateAdminPost(id: string, patch: Partial<Post>): Promise<Post> {
  const res = await fetch(`/api/admin/posts/${encodeURIComponent(id)}`, { method: "PATCH", headers: adminHeaders, body: JSON.stringify(patch) });
  return (await unwrap(res)).post as Post;
}

export async function deleteAdminPost(id: string): Promise<void> {
  const res = await fetch(`/api/admin/posts/${encodeURIComponent(id)}`, { method: "DELETE", headers: adminHeaders });
  await unwrap(res);
}
