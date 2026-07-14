// Camada de persistência GENÉRICA (agnóstica de banco de dados).
//
// Todo o armazenamento de dados (conteúdo do site, notícias, leads) passa por AQUI.
// A ideia é ser independente do banco: a aplicação só conhece `getBlob`/`setBlob`
// (um par chave → JSON). Quando o banco for escolhido, basta implementar UM adapter
// (uma tabela simples `kv(key, value)`, que existe em qualquer banco — Postgres,
// MySQL, SQLite, Mongo, etc.) e selecioná-lo por DB_DRIVER. Nada mais muda.
//
// Enquanto o banco não é definido, o driver padrão é "memory" (placeholder de
// desenvolvimento): funciona no processo local, mas NÃO persiste entre reinícios
// nem entre invocações serverless. Trocar pelo banco real ANTES de qualquer deploy.
//
// Server-only — importe apenas em route handlers (runtime nodejs).

// Contrato que qualquer banco precisa cumprir. `value` é sempre uma string (JSON),
// o que mapeia para uma coluna TEXT/JSON em qualquer banco.
export interface DbAdapter {
  getBlob(key: string): Promise<string | null>;
  setBlob(key: string, value: string): Promise<void>;
}

// --- Placeholder em memória (dev). NÃO persiste. Trocar pelo banco real. --------
class MemoryAdapter implements DbAdapter {
  private store = new Map<string, string>();
  async getBlob(key: string): Promise<string | null> {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }
  async setBlob(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
}

// --- Seleção do adapter ---------------------------------------------------------
// O adapter do banco é carregado de forma LAZY (dynamic import) — assim o driver
// nativo só é carregado quando realmente usado. Para adicionar outro banco no
// futuro, crie o adapter em src/lib/adapters/<banco>.ts e um `case` aqui.
async function createAdapter(): Promise<DbAdapter> {
  const driver = (process.env.DB_DRIVER || "memory").toLowerCase();
  switch (driver) {
    // Turso (libSQL). Local: arquivo (file:./data/app.db). Nuvem: TURSO_DATABASE_URL
    // + TURSO_AUTH_TOKEN. É SQLite — funciona no Vercel (via Turso) e localmente.
    case "turso":
    case "libsql": {
      const { LibsqlAdapter } = await import("./adapters/libsql");
      const url = process.env.TURSO_DATABASE_URL || "file:./data/app.db";
      const token = process.env.TURSO_AUTH_TOKEN || undefined;
      return new LibsqlAdapter(url, token);
    }
    // case "postgres": { const { PostgresAdapter } = await import("./adapters/postgres");
    //                    return new PostgresAdapter(process.env.DATABASE_URL || ""); }
    case "memory":
    default:
      if (driver !== "memory") {
        console.warn(`[db] DB_DRIVER="${driver}" sem adapter — usando memória (não persiste).`);
      }
      return new MemoryAdapter();
  }
}

let adapterPromise: Promise<DbAdapter> | null = null;
function db(): Promise<DbAdapter> {
  return (adapterPromise ??= createAdapter());
}

// --- API usada pela aplicação ---------------------------------------------------
// getBlob: devolve o valor já parseado (ou undefined se a chave não existe).
export async function getBlob<T = unknown>(key: string): Promise<T | undefined> {
  const raw = await (await db()).getBlob(key);
  if (raw == null) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

// setBlob: serializa e grava o valor sob a chave.
export async function setBlob(key: string, value: unknown): Promise<void> {
  await (await db()).setBlob(key, JSON.stringify(value));
}
