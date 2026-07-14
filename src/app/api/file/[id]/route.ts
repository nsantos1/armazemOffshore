// Serve um arquivo guardado no banco (imagem/PDF enviado pelo admin).
// URL: /api/file/<id>. Como cada id é imutável, cacheia agressivamente (o
// navegador/CDN guardam após a primeira leitura, reduzindo acesso ao banco).

import { getFile } from "@/lib/files-store";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = await getFile(id);
  if (!f) return new Response("Arquivo não encontrado.", { status: 404 });
  return new Response(new Uint8Array(f.buffer), {
    headers: {
      "Content-Type": f.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${f.name}"`,
    },
  });
}
