// Endpoint real do formulário de contato.
// Recebe o lead do site, valida no servidor e envia por e-mail para a equipe
// comercial usando o servidor de e-mail próprio da Armazém Offshore (SMTP), via
// nodemailer — sem depender do Resend.
//
// Observação técnica sobre IMAP x SMTP:
//   IMAP é o protocolo de LEITURA de caixa de entrada (receber/consultar e-mails).
//   O ENVIO de mensagens usa SMTP. Como o formulário apenas dispara e-mails para a
//   equipe, a configuração de envio abaixo é SMTP. As credenciais (host/usuário/senha)
//   costumam ser as mesmas do provedor IMAP — por isso o .env documenta ambos.
//
// Configuração (variáveis de ambiente — ver .env.example):
//   MAIL_SMTP_HOST      Host do servidor de saída (ex.: mail.armazemoffshore.com.br).
//   MAIL_SMTP_PORT      Porta SMTP (465 = SSL, 587 = STARTTLS). Default: 587.
//   MAIL_SMTP_SECURE    "true" para conexão SSL direta (porta 465). Default: false.
//   MAIL_USER           Usuário/conta de e-mail (ex.: contato@armazemoffshore.com.br).
//   MAIL_PASS           Senha da conta de e-mail.
//   CONTACT_TO_EMAIL    Para quem os leads vão. Default: contato@armazemoffshore.com.br
//   CONTACT_FROM_EMAIL  Remetente. Default: o próprio MAIL_USER.
//
// Enquanto MAIL_SMTP_HOST/MAIL_USER/MAIL_PASS não estiverem definidas, o endpoint
// responde 503 com mensagem clara — assim fica evidente em homologação que o envio
// ainda não foi ligado, em vez de "engolir" o lead silenciosamente.

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import { saveLead, type Lead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lê a variável de ambiente removendo espaços acidentais (ex.: "host " no fim).
const env = (name: string, fallback = ""): string => (process.env[name] ?? fallback).trim();

const SMTP_HOST = env("MAIL_SMTP_HOST");
const SMTP_PORT = Number(env("MAIL_SMTP_PORT", "587"));
const SMTP_SECURE = env("MAIL_SMTP_SECURE").toLowerCase() === "true";
const MAIL_USER = env("MAIL_USER");
// A senha NÃO passa por trim() — pode legitimamente conter espaços.
const MAIL_PASS = process.env.MAIL_PASS ?? "";
const TO_EMAIL = env("CONTACT_TO_EMAIL", "contato@armazemoffshore.com.br");
const FROM_EMAIL = env("CONTACT_FROM_EMAIL") || MAIL_USER;

const EMAIL_RE = /^\S+@\S+\.\S+$/;

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  company?: unknown;
  message?: unknown;
  newsletter?: unknown;
  // Honeypot anti-spam: campo invisível que humanos não preenchem.
  website?: unknown;
}

const asString = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string),
  );

function buildEmailHtml(d: {
  name: string; email: string; phone: string; company: string; message: string; newsletter: boolean;
}): string {
  const row = (label: string, value: string) =>
    value
      ? `<tr><td style="padding:6px 12px;font-weight:700;color:#0b1f3a;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 12px;color:#111">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`
      : "";
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#0b1f3a;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
      <div style="font-size:12px;letter-spacing:.15em;text-transform:uppercase;opacity:.7">Novo contato pelo site</div>
      <div style="font-size:20px;font-weight:800;margin-top:4px">Armazém Offshore</div>
    </div>
    <div style="background:#fff;padding:8px 12px 20px;border-radius:0 0 12px 12px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row("Nome", d.name)}
        ${row("E-mail", d.email)}
        ${row("Telefone", d.phone)}
        ${row("Empresa", d.company)}
        ${row("Mensagem", d.message)}
        ${row("Newsletter", d.newsletter ? "Aceitou receber (opt-in)" : "Não")}
      </table>
      <p style="margin:16px 12px 0;font-size:12px;color:#64748b">
        Responda diretamente este e-mail para falar com ${escapeHtml(d.name) || "o contato"}.
      </p>
    </div>
  </div></body></html>`;
}

export async function POST(req: Request) {
  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 });
  }

  // Honeypot: se preenchido, é bot. Responde 200 para não dar pista ao spammer.
  if (asString(body.website)) return NextResponse.json({ ok: true });

  const name = asString(body.name);
  const email = asString(body.email);
  const phone = asString(body.phone);
  const company = asString(body.company);
  const message = asString(body.message);
  const newsletter = body.newsletter === true;

  // Validação server-side (espelha o cliente — nunca confie só no front).
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Informe seu nome.";
  if (!EMAIL_RE.test(email)) errors.email = "E-mail inválido.";
  if (message.length < 10) errors.message = "Mensagem muito curta.";
  if (name.length > 120 || email.length > 160 || message.length > 5000) {
    return NextResponse.json({ ok: false, reason: "too_long" }, { status: 400 });
  }
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, reason: "validation", errors }, { status: 422 });
  }

  // IP real do visitante (atrás de nginx/proxy vem em x-forwarded-for).
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "-";

  const lead: Lead = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name, email, phone, company, message, newsletter, ip,
  };

  // 1) Persistência no servidor (backup do lead, independente do e-mail). É a
  //    camada confiável: mesmo sem SMTP, o lead não se perde.
  let stored = false;
  try {
    await saveLead(lead);
    stored = true;
  } catch (e) {
    console.error("[contact] Falha ao gravar lead em arquivo:", e);
  }

  // 2) E-mail (melhor esforço — só se o SMTP estiver configurado).
  let emailed = false;
  if (SMTP_HOST && MAIL_USER && MAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE, // true na porta 465, false (STARTTLS) na 587
        auth: { user: MAIL_USER, pass: MAIL_PASS },
      });
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: email,
        subject: `Novo contato pelo site — ${name}`,
        html: buildEmailHtml({ name, email, phone, company, message, newsletter }),
      });
      emailed = true;
    } catch (e) {
      console.error("[contact] Falha ao enviar e-mail via SMTP:", e);
    }
  } else {
    console.warn("[contact] SMTP não configurado — lead salvo apenas em arquivo.");
  }

  // 3) Sucesso se o lead foi capturado em ALGUM lugar (arquivo ou e-mail).
  //    Só falha de verdade se nenhum dos dois funcionou.
  if (!stored && !emailed) {
    return NextResponse.json(
      { ok: false, reason: "not_captured", error: "Não foi possível registrar sua mensagem agora. Tente novamente." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, newsletter, stored, emailed });
}
