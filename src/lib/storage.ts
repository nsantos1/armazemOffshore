// Camada de persistência do cliente.
//
// Duas fontes, transparentes para quem chama `read`/`write`:
//  - CONTEÚDO do site (banners, parceiros, identidade, configurações, certificações,
//    categorias): mora no SERVIDOR (arquivos JSON). Aqui é mantido um cache em
//    memória, preenchido no boot por `hydrate()` (GET /api/content) e atualizado por
//    write-through (PUT /api/admin/content/[key]). Assim o que o admin edita chega a
//    TODOS os visitantes.
//  - Restante (auth/sessão, inscritos e campanhas da newsletter): permanece no
//    localStorage (sessão é do cliente; newsletter irá para o banco/fluxo próprio).
//
// Quando o banco entrar, troca-se apenas o backend do CONTEÚDO (content-store +
// endpoints) — a interface read/write não muda.

export const KEY = {
  banners: "ao_banners",
  partners: "ao_partners",
  identity: "ao_identity",
  settings: "ao_settings",
  certs: "ao_certs",
  auth: "ao_auth",
  categories: "ao_categories",
} as const;

export type StorageKey = (typeof KEY)[keyof typeof KEY];

export const uid = (): string => Math.random().toString(36).slice(2, 9);

// Chave de escrita do admin (visível no bundle — barreira, não segurança real).
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";

// Mapa chave-de-storage → chave-de-conteúdo do servidor. As chaves aqui são as
// servidas pelo backend; as demais continuam no localStorage.
const SERVER_KEYS: Partial<Record<StorageKey, string>> = {
  [KEY.banners]: "banners",
  [KEY.partners]: "partners",
  [KEY.identity]: "identity",
  [KEY.settings]: "settings",
  [KEY.certs]: "certs",
  [KEY.categories]: "categories",
};

// Cache em memória do conteúdo servido pelo servidor.
const mem: Partial<Record<StorageKey, unknown>> = {};

export function read<T>(k: StorageKey, fallback: T): T;
export function read<T>(k: StorageKey, fallback?: undefined): T | undefined;
export function read<T>(k: StorageKey, fallback?: T): T | undefined {
  if (k in SERVER_KEYS) {
    return (k in mem ? (mem[k] as T) : fallback);
  }
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

// Promessa da última gravação de conteúdo (para confirmar no servidor antes de
// mostrar "salvo" na UI — ver flushPersist).
let pending: Promise<boolean> = Promise.resolve(true);

export function write<T>(k: StorageKey, v: T): void {
  if (k in SERVER_KEYS) {
    mem[k] = v;
    pending = persist(SERVER_KEYS[k] as string, v);
    return;
  }
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    console.warn("storage write failed", e);
  }
}

// Write-through: envia a alteração de conteúdo para o servidor. Resolve `true` se
// gravou, `false` se falhou (e dispara "persist-error" para avisos globais).
async function persist(contentKey: string, value: unknown): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/content/${contentKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body: JSON.stringify(value),
    });
    if (!res.ok) throw new Error(String(res.status));
    return true;
  } catch (e) {
    console.error("[storage] Falha ao salvar no servidor:", contentKey, e);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("persist-error", { detail: contentKey }));
    }
    return false;
  }
}

// Aguarda a confirmação da última gravação de conteúdo no servidor. Os fluxos de
// salvar do admin usam isto para só mostrar "salvo" quando REALMENTE persistiu.
export function flushPersist(): Promise<boolean> {
  return pending;
}

// Carrega o conteúdo do servidor para o cache. Deve rodar no boot, ANTES de
// renderizar conteúdo (o App faz isso e só então libera a primeira pintura).
export async function hydrate(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/content", { cache: "no-store" });
    const data = await res.json();
    if (data?.ok && data.content) {
      for (const [storageKey, contentKey] of Object.entries(SERVER_KEYS)) {
        mem[storageKey as StorageKey] = data.content[contentKey as string];
      }
    }
  } catch (e) {
    console.error("[storage] Falha ao carregar conteúdo do servidor:", e);
  }
}
