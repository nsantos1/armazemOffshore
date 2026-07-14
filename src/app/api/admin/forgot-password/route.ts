// "Esqueci minha senha" do painel administrativo.
//
// Como a autenticação ainda é feita no cliente (sem banco de usuários), NÃO há como
// redefinir a senha automaticamente por aqui. Este endpoint faz o honesto possível
// hoje: registra a solicitação e ENVIA UM E-MAIL (via o mesmo SMTP do site) para o
// responsável, que então redefine a senha manualmente e reenvia ao solicitante.
//
// Quando a FASE 2 (autenticação de servidor + hash + sessão) existir, este fluxo
// passa a gerar um link de redefinição com token assinado.

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

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
// Para quem vai a solicitação de redefinição (o responsável pelo painel).
const RESET_TO = env("PASSWORD_RESET_TO") || env("CONTACT_TO_EMAIL") || MAIL_USER;

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const asString = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

export async function POST(req: Request) {
  let body: { email?: unknown };
  try {
    body = (await req.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const email = asString(body.email);
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, reason: "validation", error: "Informe um e-mail válido." }, { status: 422 });
  }

  if (!SMTP_HOST || !MAIL_USER || !MAIL_PASS) {
    return NextResponse.json(
      { ok: false, reason: "not_configured", error: "Envio não configurado no servidor." },
      { status: 503 },
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_SECURE,
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    });
    const when = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    await transporter.sendMail({
      from: `"${FROM_NAME.replace(/"/g, "")}" <${FROM_EMAIL}>`,
      to: RESET_TO,
      replyTo: email,
      subject: "Solicitação de redefinição de senha — Painel Admin",
      html: `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#111">
        <div style="max-width:560px;margin:0 auto;padding:24px">
          <div style="background:#0b1f3a;color:#fff;padding:16px 20px;border-radius:12px 12px 0 0">
            <strong>Armazém Offshore</strong> · Painel Administrativo
          </div>
          <div style="background:#f8fafc;padding:20px;border-radius:0 0 12px 12px;font-size:14px;line-height:1.6">
            <p>Foi solicitada a <strong>redefinição de senha</strong> do painel administrativo.</p>
            <p><strong>E-mail informado:</strong> ${escapeHtml(email)}<br>
               <strong>Data/hora:</strong> ${escapeHtml(when)}</p>
            <p>Se você reconhece esta solicitação, redefina a senha e comunique o solicitante.
               Caso não reconheça, ignore este e-mail.</p>
          </div>
        </div></body></html>`,
    });
  } catch (e) {
    console.error("[forgot-password] Falha ao enviar solicitação:", e);
    return NextResponse.json({ ok: false, reason: "send_failed", error: "Não foi possível enviar a solicitação agora." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
