// Cliente (browser) para enviar arquivos ao servidor. O admin envia a chave de
// escrita; o servidor grava em disco e devolve a URL (que é o que guardamos).

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";

async function upload(endpoint: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(endpoint, { method: "POST", headers: { "x-admin-key": ADMIN_KEY }, body: fd });
  const data = await res.json().catch(() => ({} as Record<string, unknown>));
  if (!res.ok || !data.ok) throw new Error((data.error as string) || "Falha no upload.");
  return data.url as string;
}

// Imagens (capas, banners, logos, favicon) → /uploads/<arquivo>.
export function uploadImage(file: File): Promise<string> {
  return upload("/api/upload", file);
}

// Documentos (Certificações) → /documentosPdf/<arquivo>.
export function uploadDoc(file: File): Promise<string> {
  return upload("/api/upload-doc", file);
}
