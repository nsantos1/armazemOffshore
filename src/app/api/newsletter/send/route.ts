// Disparo real de campanhas de newsletter via SMTP (nodemailer).
// Usa a MESMA conta/servidor do formulário de contato (ver .env: MAIL_SMTP_*).
//
// Boas práticas de entregabilidade aplicadas aqui (lado do código):
//   - Remetente no domínio autenticado (alinha com SPF/DKIM do provedor).
//   - Reply-To para a caixa comercial.
//   - Versão texto (multipart) além do HTML — clientes/filtros gostam disso.
//   - Cabeçalho List-Unsubscribe (link https + mailto) — exigido por Gmail/Outlook
//     para remetentes em massa; reduz muito a chance de cair em spam.
//   - Preheader (texto de preview), envelope From explícito (Return-Path alinhado).
//   - Envio 1 mensagem por destinatário (não um BCC gigante), com pequena pausa.
//
// IMPORTANTE: o fator decisivo de "cair ou não em spam" é o DNS do domínio
// (SPF + DKIM + DMARC). Sem isso configurado, nenhum código garante a entrega.

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { listSubs, subToken } from "@/lib/newsletter-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const env = (name: string, fallback = ""): string => (process.env[name] ?? fallback).trim();

const SMTP_HOST = env("MAIL_SMTP_HOST");
const SMTP_PORT = Number(env("MAIL_SMTP_PORT", "587"));
const SMTP_SECURE = env("MAIL_SMTP_SECURE").toLowerCase() === "true";
const MAIL_USER = env("MAIL_USER");
const MAIL_PASS = process.env.MAIL_PASS ?? "";
const FROM_EMAIL = env("CONTACT_FROM_EMAIL") || MAIL_USER;
const FROM_NAME = env("MAIL_FROM_NAME", "Armazém Offshore");
const REPLY_TO = env("CONTACT_TO_EMAIL") || MAIL_USER;

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const MAX_RECIPIENTS = 500; // trava de segurança para este endpoint

interface Recipient { email: string; unsubscribeUrl?: string }
interface Payload {
  subject?: unknown;
  html?: unknown;
  preheader?: unknown;
  coverImage?: unknown;
  test?: unknown;
  testEmail?: unknown;
}

const asString = (v: unknown): string => (typeof v === "string" ? v : "");

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

// Texto simples a partir do HTML (fallback multipart).
const htmlToText = (html: string): string =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

// Envolve o conteúdo da campanha num template com cabeçalho, preheader,
// capa opcional e rodapé com link de descadastro.
function wrapEmail(opts: { contentHtml: string; preheader: string; coverImage: string; unsubscribeUrl: string; isTest: boolean }): string {
  const { contentHtml, preheader, coverImage, unsubscribeUrl, isTest } = opts;
  const preheaderBlock = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0">${escapeHtml(preheader)}</div>`
    : "";
  const cover = coverImage
    ? `<img src="${coverImage}" alt="" style="display:block;width:100%;max-width:600px;height:auto;border-radius:12px 12px 0 0" />`
    : "";
  const footer = isTest
    ? `<p style="margin:8px 0 0;font-size:11px;color:#94a3b8">Este é um e-mail de teste da campanha.</p>`
    : (unsubscribeUrl
        ? `<p style="margin:8px 0 0;font-size:12px;color:#64748b">Você recebe este e-mail por ter se inscrito na newsletter do Armazém Offshore.<br>
             <a href="${unsubscribeUrl}" style="color:#64748b;text-decoration:underline">Cancelar inscrição</a></p>`
        : "");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
    ${preheaderBlock}
    <div style="max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#0b1f3a;color:#fff;padding:18px 24px;border-radius:${coverImage ? "0" : "12px 12px 0 0"}">
        <div style="font-size:20px;font-weight:800">Armazém Offshore</div>
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.7;margin-top:2px">Suprimentos MRO · Naval & Offshore</div>
      </div>
      ${cover}
      <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;color:#111;font-size:15px;line-height:1.7">
        ${contentHtml}
      </div>
      <div style="padding:16px 8px;text-align:center;color:#94a3b8;font-size:12px">
        Armazém Offshore · Macaé · Vila Velha · Porto do Açu
        ${footer}
      </div>
    </div>
  </body></html>`;
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  if (!SMTP_HOST || !MAIL_USER || !MAIL_PASS) {
    return NextResponse.json(
      { ok: false, reason: "not_configured", error: "Envio não configurado no servidor (MAIL_SMTP_HOST/MAIL_USER/MAIL_PASS)." },
      { status: 503 },
    );
  }

  const subject = asString(body.subject).trim();
  const html = asString(body.html);
  const preheader = asString(body.preheader).trim();
  const coverImage = asString(body.coverImage).trim();
  const isTest = body.test === true;

  if (!subject) return NextResponse.json({ ok: false, error: "Assunto obrigatório." }, { status: 422 });
  if (!html.trim()) return NextResponse.json({ ok: false, error: "Conteúdo obrigatório." }, { status: 422 });

  // Destinatários: no teste, o e-mail informado; no disparo real, os inscritos
  // ATIVOS lidos do servidor (banco) — não mais do navegador.
  let recipients: Recipient[];
  if (isTest) {
    const testEmail = asString(body.testEmail).trim().toLowerCase();
    if (!EMAIL_RE.test(testEmail)) {
      return NextResponse.json({ ok: false, error: "E-mail de teste inválido." }, { status: 422 });
    }
    recipients = [{ email: testEmail }];
  } else {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("host") || "";
    const origin = (process.env.PUBLIC_SITE_URL?.trim()) || (host ? `${proto}://${host}` : new URL(req.url).origin);
    const active = (await listSubs()).filter(s => s.status === "active");
    recipients = active.map(s => ({
      email: s.email,
      unsubscribeUrl: `${origin}/api/newsletter/unsubscribe?token=${subToken(s.id)}`,
    }));
  }

  if (recipients.length === 0) {
    return NextResponse.json({ ok: false, error: "Nenhum inscrito ativo para enviar." }, { status: 422 });
  }
  if (recipients.length > MAX_RECIPIENTS) {
    return NextResponse.json({ ok: false, error: `Muitos destinatários (máx. ${MAX_RECIPIENTS} por disparo).` }, { status: 413 });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: MAIL_USER, pass: MAIL_PASS },
    pool: true,
    maxConnections: 2,
    maxMessages: 100,
  });

  // Verifica a conexão/credenciais uma vez antes de disparar em massa.
  try {
    await transporter.verify();
  } catch (e) {
    console.error("[newsletter] Falha ao conectar no SMTP:", e);
    transporter.close();
    return NextResponse.json({ ok: false, reason: "smtp_error", error: "Não foi possível conectar ao servidor de e-mail. Verifique host/porta/usuário/senha." }, { status: 502 });
  }

  const from = `"${FROM_NAME.replace(/"/g, "")}" <${FROM_EMAIL}>`;
  let sent = 0;
  const failed: { email: string; error: string }[] = [];

  for (const r of recipients) {
    const fullHtml = wrapEmail({ contentHtml: html, preheader, coverImage, unsubscribeUrl: r.unsubscribeUrl || "", isTest });
    const headers: Record<string, string> = {};
    // List-Unsubscribe ajuda muito na reputação/entregabilidade (Gmail/Outlook).
    const parts: string[] = [];
    if (r.unsubscribeUrl) parts.push(`<${r.unsubscribeUrl}>`);
    parts.push(`<mailto:${REPLY_TO}?subject=Unsubscribe>`);
    if (!isTest) headers["List-Unsubscribe"] = parts.join(", ");

    try {
      await transporter.sendMail({
        from,
        to: r.email,
        replyTo: REPLY_TO,
        subject,
        html: fullHtml,
        text: htmlToText(html),
        headers,
        envelope: { from: FROM_EMAIL, to: r.email },
      });
      sent++;
    } catch (e) {
      failed.push({ email: r.email, error: e instanceof Error ? e.message : "erro" });
      console.error("[newsletter] Falha ao enviar para", r.email, e);
    }
    // Pequena pausa entre envios para não sobrecarregar o servidor de saída.
    if (recipients.length > 1) await new Promise(res => setTimeout(res, 150));
  }

  transporter.close();

  return NextResponse.json({
    ok: sent > 0,
    sent,
    failedCount: failed.length,
    total: recipients.length,
    failed: failed.slice(0, 20),
  });
}
