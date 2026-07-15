// Inscrito por id (ADMIN): alterar status / excluir.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteSub, updateSub } from "@/lib/newsletter-store";
import type { NLSubscriberStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  let body: { status?: unknown };
  try {
    body = (await req.json()) as { status?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }
  const status = body.status as NLSubscriberStatus;
  if (status !== "active" && status !== "unsubscribed") {
    return NextResponse.json({ ok: false, error: "Status inválido." }, { status: 422 });
  }
  const sub = await updateSub(id, { status });
  if (!sub) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, sub });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const removed = await deleteSub(id);
  if (!removed) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
