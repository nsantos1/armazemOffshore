// Repositório da NEWSLETTER no servidor (inscritos + campanhas), via camada
// genérica de banco (db.ts): chaves "nlSubs" e "nlCamps". Isto corrige o problema
// dos inscritos ficarem só no navegador — agora todos ficam no banco (Turso) e
// aparecem no painel admin. Server-only.

import { randomUUID } from "crypto";
import { getBlob, setBlob } from "./db";
import type { NLCampaign, NLSubscriber } from "./types";

// Resultado plano (evita o quirk de narrowing de union discriminada deste projeto).
export interface AddSubResult {
  ok: boolean;
  sub?: NLSubscriber;
  reactivated?: boolean;
  reason?: "invalid_email" | "already_subscribed";
}
export interface UnsubResult {
  ok: boolean;
  email?: string;
  reason?: "invalid_token" | "not_found";
}

const SUBS_KEY = "nlSubs";
const CAMPS_KEY = "nlCamps";

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const now = () => new Date().toISOString();

// Token de descadastro = base64url do id. (Simples; um HMAC assinado é a evolução.)
export const subToken = (id: string): string => Buffer.from(id, "utf8").toString("base64url");
const decodeToken = (t: string): string => {
  try { return Buffer.from(t, "base64url").toString("utf8"); } catch { return ""; }
};

// ---- Inscritos -----------------------------------------------------------
export async function listSubs(): Promise<NLSubscriber[]> {
  return (await getBlob<NLSubscriber[]>(SUBS_KEY)) ?? [];
}
async function writeSubs(list: NLSubscriber[]): Promise<void> {
  await setBlob(SUBS_KEY, list);
}

export async function countActive(): Promise<number> {
  return (await listSubs()).filter(s => s.status === "active").length;
}

export async function addSub(
  email: string,
  opts: { source?: NLSubscriber["source"]; ip?: string } = {},
): Promise<AddSubResult> {
  const norm = (email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(norm)) return { ok: false, reason: "invalid_email" };
  const list = await listSubs();
  const existing = list.find(s => s.email === norm);
  if (existing) {
    if (existing.status === "active") return { ok: false, reason: "already_subscribed" };
    // reativa
    existing.status = "active";
    existing.reactivatedAt = now();
    existing.updatedAt = now();
    await writeSubs(list);
    return { ok: true, reactivated: true };
  }
  const sub: NLSubscriber = {
    id: randomUUID(), email: norm, status: "active",
    source: opts.source || "manual", createdAt: now(), ip: opts.ip || "-",
  };
  await writeSubs([sub, ...list]);
  return { ok: true, sub };
}

export async function updateSub(id: string, patch: Partial<NLSubscriber>): Promise<NLSubscriber | undefined> {
  const list = await listSubs();
  let updated: NLSubscriber | undefined;
  const next = list.map(s => { if (s.id !== id) return s; updated = { ...s, ...patch, updatedAt: now() }; return updated; });
  if (!updated) return undefined;
  await writeSubs(next);
  return updated;
}

export async function deleteSub(id: string): Promise<boolean> {
  const list = await listSubs();
  const next = list.filter(s => s.id !== id);
  if (next.length === list.length) return false;
  await writeSubs(next);
  return true;
}

export async function unsubscribeByToken(token: string): Promise<UnsubResult> {
  const id = decodeToken(token);
  if (!id) return { ok: false, reason: "invalid_token" };
  const list = await listSubs();
  const sub = list.find(s => s.id === id);
  if (!sub) return { ok: false, reason: "not_found" };
  sub.status = "unsubscribed";
  sub.unsubscribedAt = now();
  sub.updatedAt = now();
  await writeSubs(list);
  return { ok: true, email: sub.email };
}

// ---- Campanhas -----------------------------------------------------------
export async function listCamps(): Promise<NLCampaign[]> {
  const list = (await getBlob<NLCampaign[]>(CAMPS_KEY)) ?? [];
  return list.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
async function writeCamps(list: NLCampaign[]): Promise<void> {
  await setBlob(CAMPS_KEY, list);
}

export async function createCamp(data: Partial<NLCampaign>): Promise<NLCampaign> {
  const list = (await getBlob<NLCampaign[]>(CAMPS_KEY)) ?? [];
  const camp: NLCampaign = {
    id: randomUUID(), status: "draft", sentAt: null, sentCount: 0, opensCount: 0, clicksCount: 0,
    createdAt: now(), recipientMode: "all_active", coverImage: null, preheader: "",
    subject: "", content: "", ...data,
  } as NLCampaign;
  await writeCamps([camp, ...list]);
  return camp;
}

export async function updateCamp(id: string, patch: Partial<NLCampaign>): Promise<NLCampaign | undefined> {
  const list = (await getBlob<NLCampaign[]>(CAMPS_KEY)) ?? [];
  let updated: NLCampaign | undefined;
  const next = list.map(c => { if (c.id !== id) return c; updated = { ...c, ...patch }; return updated; });
  if (!updated) return undefined;
  await writeCamps(next);
  return updated;
}

export async function deleteCamp(id: string): Promise<boolean> {
  const list = (await getBlob<NLCampaign[]>(CAMPS_KEY)) ?? [];
  const next = list.filter(c => c.id !== id);
  if (next.length === list.length) return false;
  await writeCamps(next);
  return true;
}
