// Opt-in PÚBLICO da newsletter (do formulário de contato). Grava o inscrito no
// servidor (banco), para aparecer no painel admin de todos.

import { NextResponse } from "next/server";
import { addSub } from "@/lib/newsletter-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: unknown; source?: unknown };
  try {
    body = (await req.json()) as { email?: unknown; source?: unknown };
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email : "";
  const source = body.source === "contact_form" ? "contact_form" : "manual";
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "-";

  const r = await addSub(email, { source, ip });
  if (!r.ok) {
    // e-mail inválido → 422; já inscrito → 200 (não é erro real p/ o usuário)
    const status = r.reason === "invalid_email" ? 422 : 200;
    return NextResponse.json(r, { status });
  }
  return NextResponse.json(r);
}
