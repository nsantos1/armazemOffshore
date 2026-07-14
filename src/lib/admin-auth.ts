// Guard (interino) das rotas de ESCRITA do admin.
//
// Enquanto não há autenticação de servidor (FASE 2), exigimos o header
// `x-admin-key` igual a NEXT_PUBLIC_ADMIN_API_KEY. Isso impede que qualquer
// pessoa crie/edite/apague conteúdo pela API pública. ATENÇÃO: como a chave é
// NEXT_PUBLIC, ela fica visível no bundle — é uma barreira, NÃO segurança real.
// A proteção definitiva (sessão httpOnly no servidor) é a FASE 2. Fail-closed:
// se a chave não estiver configurada, o acesso é negado (503).

import { NextResponse } from "next/server";

const ADMIN_KEY = (process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? "").trim();

export function requireAdmin(req: Request): NextResponse | null {
  if (!ADMIN_KEY) {
    return NextResponse.json(
      { ok: false, reason: "not_configured", error: "Acesso admin não configurado no servidor (NEXT_PUBLIC_ADMIN_API_KEY)." },
      { status: 503 },
    );
  }
  const key = (req.headers.get("x-admin-key") || "").trim();
  if (key !== ADMIN_KEY) {
    return NextResponse.json({ ok: false, reason: "unauthorized", error: "Não autorizado." }, { status: 401 });
  }
  return null;
}
