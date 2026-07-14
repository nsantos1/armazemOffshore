// Armazenamento de ARQUIVOS (imagens, PDFs) no banco de dados.
// Usa a camada genérica (db.ts): cada arquivo é um registro sob a chave
// `file:<id>`, guardando nome, content-type e o binário em base64. Assim funciona
// em qualquer banco/adapter (inclusive Turso) e no Vercel — sem disco.
// Server-only.

import { randomUUID } from "crypto";
import { getBlob, setBlob } from "./db";

interface StoredFile {
  name: string;
  contentType: string;
  data: string; // base64
}

// Retorno plano (campos opcionais) — evita narrowing de union discriminada, que
// neste projeto às vezes não restringe corretamente no type-check.
export interface StoreUploadResult {
  ok: boolean;
  url?: string;
  name?: string;
  status?: number;
  error?: string;
}

// Fallback de content-type a partir da extensão (quando o navegador não informa).
const MIME: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  gif: "image/gif", svg: "image/svg+xml", ico: "image/x-icon",
  pdf: "application/pdf", doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

function sanitizeName(name: string): string {
  const base = (name.split(/[\\/]/).pop() || "arquivo").normalize("NFD");
  const noAccents = Array.from(base)
    .filter(ch => { const c = ch.codePointAt(0) ?? 0; return c < 0x0300 || c > 0x036f; })
    .join("");
  return noAccents.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "") || "arquivo";
}

export interface StoreUploadOpts {
  allowedExt: Set<string>;
  maxBytes: number;
}

// Valida e grava o arquivo no banco. Devolve a URL de servir (/api/file/<id>).
export async function storeUpload(file: File, opts: StoreUploadOpts): Promise<StoreUploadResult> {
  if (file.size === 0) return { ok: false, status: 400, error: "Arquivo vazio." };
  if (file.size > opts.maxBytes) {
    const mb = Math.round(opts.maxBytes / (1024 * 1024));
    return { ok: false, status: 413, error: `Arquivo muito grande (máx. ${mb} MB).` };
  }
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!opts.allowedExt.has(ext)) {
    return { ok: false, status: 415, error: "Tipo de arquivo não permitido." };
  }

  const id = randomUUID();
  const name = sanitizeName(file.name);
  const contentType = file.type || MIME[ext] || "application/octet-stream";
  const data = Buffer.from(await file.arrayBuffer()).toString("base64");

  try {
    await setBlob(`file:${id}`, { name, contentType, data } as StoredFile);
  } catch (e) {
    console.error("[files] Falha ao gravar arquivo no banco:", e);
    return { ok: false, status: 502, error: "Não foi possível salvar o arquivo no banco (pode estar grande demais)." };
  }
  return { ok: true, url: `/api/file/${id}`, name };
}

// Lê o arquivo do banco para a rota de servir.
export async function getFile(id: string): Promise<{ contentType: string; name: string; buffer: Buffer } | null> {
  const rec = await getBlob<StoredFile>(`file:${id}`);
  if (!rec || typeof rec.data !== "string") return null;
  return { contentType: rec.contentType, name: rec.name, buffer: Buffer.from(rec.data, "base64") };
}
