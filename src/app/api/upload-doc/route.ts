// Upload de documentos da página de Certificações (PDF, DOC, XLS, imagem).
// Grava no BANCO (Turso) e devolve a URL de servir (/api/file/<id>). Sem disco,
// funciona no Vercel. Protegido pela chave de escrita do admin.
//
// Nota: arquivos muito grandes podem exceder o limite por registro do banco. Se
// isso acontecer, use o campo de URL do documento (colar link de um PDF hospedado).

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { storeUpload } from "@/lib/files-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "webp"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const r = await storeUpload(file, { allowedExt: ALLOWED, maxBytes: MAX_BYTES });
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status ?? 500 });
  return NextResponse.json({ ok: true, url: r.url, name: r.name });
}
