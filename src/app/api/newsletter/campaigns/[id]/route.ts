// Campanha por id (ADMIN): atualizar / excluir.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteCamp, updateCamp } from "@/lib/newsletter-store";
import type { NLCampaign } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  let patch: Partial<NLCampaign>;
  try {
    patch = (await req.json()) as Partial<NLCampaign>;
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }
  const campaign = await updateCamp(id, patch);
  if (!campaign) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, campaign });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const removed = await deleteCamp(id);
  if (!removed) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
