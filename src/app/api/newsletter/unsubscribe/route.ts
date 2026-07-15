// Descadastro PÚBLICO da newsletter, por token assinado.
//  - POST { token }  → usado pela página /unsubscribe (retorna JSON).
//  - GET  ?token=... → clique direto do link do e-mail (retorna HTML de confirmação).

import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/newsletter-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { token?: unknown };
  try {
    body = (await req.json()) as { token?: unknown };
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  const r = await unsubscribeByToken(token);
  return NextResponse.json(r, { status: r.ok ? 200 : 404 });
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const r = await unsubscribeByToken(token);
  const msg = r.ok
    ? "Você foi removido da nossa newsletter. Não receberá mais nossas comunicações."
    : "Não foi possível processar o pedido (link inválido ou expirado).";
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1"><title>Newsletter — Armazém Offshore</title></head>
    <body style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;margin:0;padding:40px 16px">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;text-align:center">
        <div style="font-size:20px;font-weight:800;color:#0b1f3a">Armazém Offshore</div>
        <p style="color:#334155;line-height:1.6;margin-top:16px">${msg}</p>
      </div></body></html>`;
  return new Response(html, { status: r.ok ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
