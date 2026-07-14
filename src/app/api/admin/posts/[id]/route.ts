// API ADMIN de notícias por id (protegida): busca um post (para edição),
// atualiza (PATCH) e exclui (DELETE).

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { deletePost, getPost, updatePost } from "@/lib/posts-store";
import type { Post } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return NextResponse.json({ ok: false, reason: "not_found", error: "Post não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true, post });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  let patch: Partial<Post>;
  try {
    patch = (await req.json()) as Partial<Post>;
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }
  const post = await updatePost(id, patch);
  if (!post) return NextResponse.json({ ok: false, reason: "not_found", error: "Post não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true, post });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const removed = await deletePost(id);
  if (!removed) return NextResponse.json({ ok: false, reason: "not_found", error: "Post não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
