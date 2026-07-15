// Cliente (browser) das APIs de newsletter. Público (opt-in/descadastro) sem chave;
// admin (inscritos/campanhas/envio) com a chave de escrita.

import type { NLCampaign, NLSubscriber } from "./types";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";
const adminHeaders = { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY };

async function unwrap(res: Response): Promise<Record<string, unknown>> {
  const data = await res.json().catch(() => ({} as Record<string, unknown>));
  if (!res.ok || !data.ok) throw new Error((data.error as string) || "Falha na operação.");
  return data;
}

// ---- Público -------------------------------------------------------------
// Retorna { ok, reason?, reactivated? } sem lançar (o front trata os avisos).
export async function subscribe(email: string, source: "contact_form" | "manual" = "manual"): Promise<Record<string, unknown>> {
  const res = await fetch("/api/newsletter/subscribe", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source }),
  });
  return res.json().catch(() => ({ ok: false }));
}

export async function unsubscribe(token: string): Promise<Record<string, unknown>> {
  const res = await fetch("/api/newsletter/unsubscribe", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
  });
  return res.json().catch(() => ({ ok: false }));
}

// ---- Admin: inscritos ----------------------------------------------------
export async function fetchSubscribers(): Promise<{ subscribers: NLSubscriber[]; activeCount: number; total: number }> {
  const res = await fetch("/api/newsletter/subscribers", { headers: adminHeaders, cache: "no-store" });
  const d = await unwrap(res);
  return { subscribers: (d.subscribers as NLSubscriber[]) || [], activeCount: (d.activeCount as number) || 0, total: (d.total as number) || 0 };
}

// Retorna a resposta bruta (para o front distinguir "já inscrito" etc.).
export async function addSubscriber(email: string): Promise<Record<string, unknown>> {
  const res = await fetch("/api/newsletter/subscribers", { method: "POST", headers: adminHeaders, body: JSON.stringify({ email }) });
  return res.json().catch(() => ({ ok: false }));
}

export async function updateSubscriber(id: string, status: NLSubscriber["status"]): Promise<void> {
  const res = await fetch(`/api/newsletter/subscribers/${encodeURIComponent(id)}`, { method: "PATCH", headers: adminHeaders, body: JSON.stringify({ status }) });
  await unwrap(res);
}

export async function deleteSubscriber(id: string): Promise<void> {
  const res = await fetch(`/api/newsletter/subscribers/${encodeURIComponent(id)}`, { method: "DELETE", headers: adminHeaders });
  await unwrap(res);
}

// ---- Admin: campanhas ----------------------------------------------------
export async function fetchCampaigns(): Promise<NLCampaign[]> {
  const res = await fetch("/api/newsletter/campaigns", { headers: adminHeaders, cache: "no-store" });
  const d = await unwrap(res);
  return (d.campaigns as NLCampaign[]) || [];
}

export async function createCampaign(data: Partial<NLCampaign>): Promise<NLCampaign> {
  const res = await fetch("/api/newsletter/campaigns", { method: "POST", headers: adminHeaders, body: JSON.stringify(data) });
  return (await unwrap(res)).campaign as NLCampaign;
}

export async function updateCampaign(id: string, patch: Partial<NLCampaign>): Promise<void> {
  const res = await fetch(`/api/newsletter/campaigns/${encodeURIComponent(id)}`, { method: "PATCH", headers: adminHeaders, body: JSON.stringify(patch) });
  await unwrap(res);
}

export async function deleteCampaign(id: string): Promise<void> {
  const res = await fetch(`/api/newsletter/campaigns/${encodeURIComponent(id)}`, { method: "DELETE", headers: adminHeaders });
  await unwrap(res);
}

// ---- Admin: envio --------------------------------------------------------
interface SendPayload { subject: string; html: string; preheader?: string; coverImage?: string | null }
export async function sendCampaign(payload: SendPayload): Promise<Record<string, unknown>> {
  const res = await fetch("/api/newsletter/send", { method: "POST", headers: adminHeaders, body: JSON.stringify(payload) });
  return res.json().catch(() => ({ ok: false }));
}
export async function sendTest(payload: SendPayload & { testEmail: string }): Promise<Record<string, unknown>> {
  const res = await fetch("/api/newsletter/send", { method: "POST", headers: adminHeaders, body: JSON.stringify({ ...payload, test: true }) });
  return res.json().catch(() => ({ ok: false }));
}
