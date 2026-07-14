"use client";

import * as React from "react";
import { Icon, LogoLockup, LogoMark } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/FormControls";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { isApiFailure } from "@/lib/types";
import type { NavigateFn, Session } from "@/lib/types";

export interface LoginPageProps {
  onLogin: (session: Session) => void;
  navigate: NavigateFn;
}

export function LoginPage({ onLogin, navigate }: LoginPageProps) {
  const toast = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");

  // "Esqueci minha senha"
  const [forgotOpen, setForgotOpen] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState("");
  const [forgotBusy, setForgotBusy] = React.useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    setTimeout(() => {
      const r = api.login(email, password);
      setBusy(false);
      if (isApiFailure(r)) { setErr(r.error || "Não foi possível entrar."); }
      else { onLogin(r.session); toast(`Bem-vindo, ${r.session.name}.`, "success"); }
    }, 400);
  };

  const sendForgot = async () => {
    if (!/^\S+@\S+\.\S+$/.test(forgotEmail)) { toast("Informe um e-mail válido.", "error"); return; }
    setForgotBusy(true);
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const out = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !out.ok) {
        toast(out?.error || "Não foi possível enviar a solicitação.", "error");
        return;
      }
      toast("Solicitação enviada. O administrador do sistema entrará em contato.", "success");
      setForgotOpen(false); setForgotEmail("");
    } catch {
      toast("Falha de conexão. Tente novamente.", "error");
    } finally {
      setForgotBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex relative w-1/2 bg-primary text-white p-12 flex-col justify-between overflow-hidden">
        <div className="relative z-10">
          <LogoLockup />
          <div className="mt-20 max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1.5 text-xs font-medium tracking-wider uppercase">
              <Icon name="Lock" className="w-3 h-3 text-accent" /> Painel Administrativo
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight">Bem-vindo de volta.</h1>
            <p className="mt-3 text-white/75">Gerencie banners, conteúdo, parceiros e identidade visual do site público.</p>
          </div>
          <div className="mt-12 space-y-3">
            {[
              { i: "Megaphone", t: "Banners do site", d: "Atualize a vitrine em segundos." },
              { i: "Newspaper", t: "Notícias & Blog", d: "Editor rico com upload de mídia." },
              { i: "Palette", t: "Identidade visual", d: "Logo, favicon e variantes." },
              { i: "Users", t: "Parceiros", d: "Fornecedores e clientes em destaque." },
            ].map((b, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="grid place-items-center w-9 h-9 rounded-md bg-white/10 text-accent shrink-0"><Icon name={b.i} className="w-4 h-4" /></span>
                <div>
                  <div className="text-sm font-bold">{b.t}</div>
                  <div className="text-xs text-white/60">{b.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs text-white/50">Acesso restrito a administradores.</div>
        {/* deco */}
        <div className="absolute -bottom-20 -right-20 w-[420px] h-[420px] rounded-full opacity-20"
             style={{ background: "radial-gradient(circle at 30% 30%, #FFD000 0%, transparent 60%)" }} />
        <div className="absolute inset-0 opacity-[.05]"
             style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      {/* Right form */}
      <div className="flex-1 grid place-items-center bg-bg-soft p-6">
        <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card border border-slate-200">
          <div className="lg:hidden mb-6 flex justify-center">
            <LogoMark className="h-10 w-auto" />
          </div>
          <h2 className="text-2xl font-extrabold text-primary">Acessar painel</h2>
          <p className="text-sm text-text-muted">Entre com suas credenciais administrativas.</p>

          <div className="mt-6 space-y-4">
            <Field label="E-mail">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="username" />
            </Field>
            <Field label="Senha">
              <div className="relative">
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </Field>
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-text-muted">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary" />
                Manter conectado
              </label>
              <button type="button" onClick={() => { setForgotEmail(email); setForgotOpen(true); }} className="font-semibold text-primary hover:text-primary-700">Esqueci a senha</button>
            </div>
          </div>

          {err && <div className="mt-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{err}</div>}

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
            {busy ? <><Icon name="Loader2" className="w-4 h-4 animate-spin" /> Entrando…</> : <><Icon name="LogIn" className="w-4 h-4" /> Entrar</>}
          </Button>

          <button type="button" onClick={() => navigate("/")} className="mt-6 text-sm text-text-muted hover:text-primary inline-flex items-center gap-1">
            <Icon name="ArrowLeft" className="w-3 h-3" /> Voltar ao site
          </button>
        </form>
      </div>

      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Redefinir senha"
        footer={<>
          <Button variant="ghost" onClick={() => setForgotOpen(false)}>Cancelar</Button>
          <Button onClick={sendForgot} disabled={forgotBusy}>
            {forgotBusy ? <><Icon name="Loader2" className="w-4 h-4 animate-spin" /> Enviando…</> : <><Icon name="Send" className="w-4 h-4" /> Enviar solicitação</>}
          </Button>
        </>}
      >
        <p className="text-sm text-text-muted mb-4">
          Informe o e-mail da sua conta administrativa. Enviaremos sua solicitação ao
          administrador do sistema, que fará a redefinição e entrará em contato.
        </p>
        <Field label="E-mail da conta">
          <Input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                 placeholder="seu@email.com" autoFocus
                 onKeyDown={e => { if (e.key === "Enter") sendForgot(); }} />
        </Field>
      </Modal>
    </div>
  );
}
