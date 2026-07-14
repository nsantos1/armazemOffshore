// API PÚBLICA de conteúdo do site — entrega banners, parceiros, identidade,
// configurações, certificações e categorias para o site público. Tudo aqui já é
// exibido publicamente (não há dado sensível). Consumido no boot do app (hydrate).

import { NextResponse } from "next/server";
import { getAllContent } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getAllContent();
  return NextResponse.json({ ok: true, content });
}
