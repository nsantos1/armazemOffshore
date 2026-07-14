// Adapter libSQL/Turso para a camada genérica de banco (ver db.ts).
// Um mesmo cliente atende dois cenários com o MESMO código:
//   - Desenvolvimento local: arquivo em disco  → url = "file:./data/app.db"
//   - Produção (Vercel/nuvem): Turso            → url = "libsql://...", com authToken
// libSQL é SQLite; os dados ficam numa tabela chave→valor `kv(key, value)`.
// Server-only.

import fs from "fs";
import path from "path";
import { createClient, type Client } from "@libsql/client";
import type { DbAdapter } from "../db";

export class LibsqlAdapter implements DbAdapter {
  private client: Client;
  private ready: Promise<void>;

  constructor(url: string, authToken?: string) {
    // No modo arquivo, garante que a pasta do .db existe.
    if (url.startsWith("file:")) {
      const file = url.slice("file:".length);
      fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
    }
    this.client = createClient({ url, authToken });
    this.ready = this.client
      .execute("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL)")
      .then(() => undefined);
  }

  async getBlob(key: string): Promise<string | null> {
    await this.ready;
    const r = await this.client.execute({ sql: "SELECT value FROM kv WHERE key = ?", args: [key] });
    const row = r.rows[0];
    return row ? (row.value as string) : null;
  }

  async setBlob(key: string, value: string): Promise<void> {
    await this.ready;
    await this.client.execute({
      sql: "INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      args: [key, value],
    });
  }
}
