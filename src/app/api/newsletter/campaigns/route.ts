// Campanhas da newsletter (ADMIN): listar e criar.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createCamp, listCamps } from "@/lib/newsletter-store";
import type { NLCampaign } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  return NextResponse.json({ ok: true, campaigns: await listCamps() });
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  let data: Partial<NLCampaign>;
  try {
    data = (await req.json()) as Partial<NLCampaign>;
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }
  const campaign = await createCamp(data);
  return NextResponse.json({ ok: true, campaign });
}
