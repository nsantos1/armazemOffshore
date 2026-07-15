// Inscritos da newsletter (ADMIN, protegido): listar e adicionar manualmente.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { addSub, listSubs } from "@/lib/newsletter-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const subscribers = await listSubs();
  const activeCount = subscribers.filter(s => s.status === "active").length;
  return NextResponse.json({ ok: true, subscribers, activeCount, total: subscribers.length });
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  let body: { email?: unknown };
  try {
    body = (await req.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email : "";
  const r = await addSub(email, { source: "manual" });
  return NextResponse.json(r, { status: r.ok ? 200 : r.reason === "invalid_email" ? 422 : 200 });
}
