// API ADMIN de notícias (protegida) — lista TODOS os posts (inclui rascunhos)
// e cria novos. Escrita no servidor, para o conteúdo valer para todos.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createPost, readPosts } from "@/lib/posts-store";
import type { Post } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const posts = (await readPosts()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return NextResponse.json({ ok: true, posts, total: posts.length });
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  let data: Partial<Post>;
  try {
    data = (await req.json()) as Partial<Post>;
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }
  if (!data.title?.trim() || !data.slug?.trim()) {
    return NextResponse.json({ ok: false, error: "Título e slug são obrigatórios." }, { status: 422 });
  }
  const post = await createPost(data);
  return NextResponse.json({ ok: true, post });
}
