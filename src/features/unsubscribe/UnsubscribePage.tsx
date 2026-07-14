"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { isApiFailure } from "@/lib/types";
import type { NavigateFn } from "@/lib/types";

interface UnsubscribeResult {
  ok: boolean;
  email: string;
  error: string;
}

export function UnsubscribePage({ navigate }: { navigate: NavigateFn }) {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const token = params.get("token") || "";
  const [loading, setLoading] = React.useState(true);
  const [result, setResult] = React.useState<UnsubscribeResult>({ ok: false, email: "", error: "" });

  React.useEffect(() => {
    setTimeout(() => {
      if (!token) { setLoading(false); setResult({ ok: false, email: "", error: "Token ausente." }); return; }
      const r = api.nlUnsubscribeByToken(token);
      if (isApiFailure(r)) {
        setResult({ ok: false, email: "", error: r.reason === "not_found" ? "Inscrito não encontrado." : "Token inválido." });
      } else {
        setResult({ ok: true, email: r.sub.email, error: "" });
      }
      setLoading(false);
    }, 500);
  }, []);

  let content: React.ReactNode;
  if (loading) {
    content = (
      <>
        <Icon name="Loader2" className="w-8 h-8 mx-auto text-primary animate-spin" />
        <p className="mt-3 text-sm text-text-muted">Processando seu pedido...</p>
      </>
    );
  } else if (result.ok) {
    content = (
      <>
        <div className="grid place-items-center mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-700"><Icon name="MailCheck" className="w-7 h-7" /></div>
        <h1 className="mt-4 text-2xl font-extrabold text-primary" style={{ fontFamily: "Montserrat" }}>Você foi removido da nossa newsletter</h1>
        <p className="mt-2 text-sm text-text-muted">Sentiremos sua falta! O e-mail <span className="font-mono">{result.email}</span> não receberá mais nossas comunicações.</p>
        <Button className="mt-6" onClick={() => navigate("/")}><Icon name="ArrowLeft" className="w-4 h-4" /> Voltar ao site</Button>
      </>
    );
  } else {
    content = (
      <>
        <div className="grid place-items-center mx-auto w-14 h-14 rounded-full bg-amber-100 text-amber-700"><Icon name="AlertCircle" className="w-7 h-7" /></div>
        <h1 className="mt-4 text-2xl font-extrabold text-primary" style={{ fontFamily: "Montserrat" }}>Não foi possível processar</h1>
        <p className="mt-2 text-sm text-text-muted">{result.error}</p>
        <Button className="mt-6" onClick={() => navigate("/")}><Icon name="ArrowLeft" className="w-4 h-4" /> Voltar ao site</Button>
      </>
    );
  }

  return (
    <div className="min-h-[80vh] grid place-items-center bg-bg-soft px-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-card p-8 text-center">
        {content}
      </div>
    </div>
  );
}
