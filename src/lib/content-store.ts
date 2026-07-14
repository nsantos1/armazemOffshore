// Repositório do CONTEÚDO do site (o que o público enxerga): banners, parceiros,
// identidade, configurações, certificações e categorias.
//
// Persistência via camada genérica de banco (ver db.ts) — cada chave é um registro
// JSON. Na primeira leitura, se ainda não existe, é semeado a partir do SEED_*
// (mantém o conteúdo atual da empresa). Server-only.

import {
  SEED_BANNERS,
  SEED_CATEGORIES,
  SEED_CERTS,
  SEED_IDENTITY,
  SEED_PARTNERS,
  SEED_SETTINGS,
} from "./seed-data";
import { getBlob, setBlob } from "./db";
import type { Certifications, Identity, Settings } from "./types";

export type ContentKey = "banners" | "partners" | "identity" | "settings" | "certs" | "categories";

// Prefixo das chaves no banco, para não colidir com "posts"/"leads".
const KEY_PREFIX = "content:";

const SEED: Record<ContentKey, unknown> = {
  banners: SEED_BANNERS,
  partners: SEED_PARTNERS,
  identity: SEED_IDENTITY,
  settings: SEED_SETTINGS,
  certs: SEED_CERTS,
  categories: SEED_CATEGORIES,
};

export function isContentKey(k: string): k is ContentKey {
  return Object.prototype.hasOwnProperty.call(SEED, k);
}

export async function getContent(key: ContentKey): Promise<unknown> {
  let data = await getBlob(KEY_PREFIX + key);
  if (data === undefined) {
    data = SEED[key];
    await setBlob(KEY_PREFIX + key, data); // semeia na primeira vez
  }
  // Singletons: mescla com os defaults para novas chaves aparecerem em dados antigos.
  if (key === "settings") {
    const s = (data || {}) as Settings;
    data = { ...SEED_SETTINGS, ...s, analytics: { ...SEED_SETTINGS.analytics, ...(s.analytics || {}) } };
  } else if (key === "identity") {
    data = { ...SEED_IDENTITY, ...(data as Identity) };
  } else if (key === "certs") {
    data = { ...SEED_CERTS, ...(data as Certifications) };
  }
  return data;
}

export async function setContent(key: ContentKey, value: unknown): Promise<void> {
  await setBlob(KEY_PREFIX + key, value);
}

export async function getAllContent(): Promise<Record<ContentKey, unknown>> {
  const keys = Object.keys(SEED) as ContentKey[];
  const entries = await Promise.all(keys.map(async k => [k, await getContent(k)] as const));
  return Object.fromEntries(entries) as Record<ContentKey, unknown>;
}
