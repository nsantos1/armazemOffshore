// API PÚBLICA de notícias — retorna apenas os posts PUBLICADOS (rascunhos ficam
// fora). Consumida pelo site público (home + blog) para que o conteúdo criado no
// admin apareça para TODOS os visitantes.

import { NextResponse } from "next/server";
import { listPublished } from "@/lib/posts-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await listPublished();
  return NextResponse.json({ ok: true, posts, total: posts.length });
}
