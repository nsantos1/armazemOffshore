// API ADMIN de conteúdo (protegida) — grava/lê uma chave específica de conteúdo
// (banners, partners, identity, settings, certs, categories). Usada pelo write-through
// do storage do admin.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getContent, isContentKey, setContent } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { key } = await params;
  if (!isContentKey(key)) return NextResponse.json({ ok: false, error: "Chave inválida." }, { status: 400 });
  return NextResponse.json({ ok: true, content: await getContent(key) });
}

export async function PUT(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { key } = await params;
  if (!isContentKey(key)) return NextResponse.json({ ok: false, error: "Chave inválida." }, { status: 400 });
  let value: unknown;
  try {
    value = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }
  await setContent(key, value);
  return NextResponse.json({ ok: true });
}
