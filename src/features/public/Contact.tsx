"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/FormControls";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { isApiFailure } from "@/lib/types";
import type { Settings } from "@/lib/types";
import { InteractiveMap } from "./InteractiveMap";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  newsletter: boolean;
}

type ContactErrors = Partial<Record<keyof ContactForm, string>>;

export function Contact({ settings }: { settings: Settings }) {
  const toast = useToast();
  const { t } = useLang();
  const [form, setForm] = React.useState<ContactForm>({ name: "", email: "", phone: "", company: "", message: "", newsletter: false });
  const [errors, setErrors] = React.useState<ContactErrors>({});
  const [sending, setSending] = React.useState(false);
  // Honeypot anti-spam: preenchido apenas por bots (escondido via CSS abaixo).
  const [honeypot, setHoneypot] = React.useState("");
  const set = (k: keyof ContactForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const [activeBaseId, setActiveBaseId] = React.useState<string | null>(settings.bases[0]?.id || null);
  const mapRef = React.useRef<HTMLDivElement>(null);

  const selectBase = (id: string) => {
    setActiveBaseId(id);
    // Scroll the map into view if it's offscreen — keeps the interaction obvious on mobile.
    requestAnimationFrame(() => {
      const el = mapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top < 80 || r.bottom > window.innerHeight) {
        window.scrollTo({ top: window.scrollY + r.top - 120, behavior: "smooth" });
      }
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const err: ContactErrors = {};
    if (!form.name.trim()) err.name = t("contact.errName");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = t("contact.errEmail");
    if (!form.message.trim() || form.message.length < 10) err.message = t("contact.errMessage");
    setErrors(err);
    if (Object.keys(err).length) return;

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: honeypot }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) {
        const reason = data?.reason;
        toast(
          reason === "not_configured"
            ? t("contact.toastNotConfigured")
            : t("contact.toastError"),
          "error",
        );
        return;
      }

      // Opt-in de newsletter (mantém o painel admin demo populado).
      let nlMsg = "";
      if (form.newsletter) {
        const r = api.nlAddSub(form.email, { source: "contact_form" });
        if (isApiFailure(r)) {
          if (r.reason === "already_subscribed") nlMsg = t("contact.nlAlready");
        } else {
          nlMsg = r.reactivated
            ? t("contact.nlReactivated")
            : t("contact.nlSubscribed");
        }
      }
      toast(t("contact.toastSuccess") + nlMsg, "success");
      setForm({ name: "", email: "", phone: "", company: "", message: "", newsletter: false });
    } catch {
      toast(t("contact.toastConn"), "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contato" className="bg-primary text-white py-20 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[.05]"
           style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-12">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.25em] text-accent mb-3">{t("contact.eyebrow")}</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t("contact.title")}</h2>
          <p className="mt-3 text-white/80 max-w-lg">{t("contact.subtitle")}</p>

          <div className="mt-8 space-y-5">
            <a href={`tel:${settings.phone.replace(/\D/g, "")}`} className="flex items-center gap-4 group">
              <span className="grid place-items-center w-12 h-12 rounded-lg bg-white/10 group-hover:bg-accent group-hover:text-primary transition">
                <Icon name="Phone" className="w-5 h-5" />
              </span>
              <span>
                <div className="text-xs uppercase tracking-wider text-white/60">{t("contact.phone")}</div>
                <div className="font-bold">{settings.phone}</div>
              </span>
            </a>
            <a href={`mailto:${settings.email}`} className="flex items-center gap-4 group">
              <span className="grid place-items-center w-12 h-12 rounded-lg bg-white/10 group-hover:bg-accent group-hover:text-primary transition">
                <Icon name="Mail" className="w-5 h-5" />
              </span>
              <span>
                <div className="text-xs uppercase tracking-wider text-white/60">{t("contact.email")}</div>
                <div className="font-bold">{settings.email}</div>
              </span>
            </a>
          </div>

          {/* Address cards — cada card é o próprio controle do mapa abaixo */}
          <div className="mt-8">
            <div className="text-xs font-bold uppercase tracking-[.25em] text-accent mb-3 flex items-center gap-2">
              {t("contact.basesTitle")} <span className="text-white/40 normal-case tracking-normal">{t("contact.basesHint")}</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {settings.bases.map(b => {
                const on = b.id === activeBaseId;
                return (
                  <button key={b.id} type="button" onClick={() => selectBase(b.id)}
                    className={`group text-left rounded-lg p-4 border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${on ? "bg-accent text-primary border-accent shadow-deep" : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30"}`}>
                    <div className={`flex items-center gap-2 ${on ? "text-primary/70" : "text-accent"}`}>
                      <Icon name="MapPin" className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{b.label}</span>
                      <span className={`ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${on ? "text-primary" : "text-white/60 group-hover:text-white"}`}>
                        {on ? <>{t("contact.onMap")} <Icon name="Navigation" className="w-3 h-3" /></> : <>{t("contact.viewMap")} <Icon name="ArrowRight" className="w-3 h-3" /></>}
                      </span>
                    </div>
                    <div className={`mt-1 font-bold ${on ? "text-primary" : ""}`}>{b.city}</div>
                    <div className={`text-xs leading-relaxed mt-1 ${on ? "text-primary/80" : "text-white/70"}`}>{b.address}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mapa interativo controlado pelos cards acima */}
          <div ref={mapRef}>
            <InteractiveMap bases={settings.bases} activeId={activeBaseId} />
          </div>
        </div>

        <form onSubmit={submit} className="rounded-2xl bg-white p-6 sm:p-8 text-primary shadow-deep">
          <h3 className="text-xl font-extrabold">{t("contact.formTitle")}</h3>
          <p className="text-sm text-text-muted">{t("contact.formSubtitle")}</p>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <Field label={t("contact.fName")} error={errors.name}>
              <Input value={form.name} onChange={set("name")} placeholder={t("contact.fNamePh")} />
            </Field>
            <Field label={t("contact.fEmail")} error={errors.email}>
              <Input type="email" value={form.email} onChange={set("email")} placeholder={t("contact.fEmailPh")} />
            </Field>
            <Field label={t("contact.fPhone")} className="sm:col-span-1">
              <Input value={form.phone} onChange={set("phone")} placeholder={t("contact.fPhonePh")} />
            </Field>
            <Field label={t("contact.fCompany")} className="sm:col-span-1">
              <Input value={form.company} onChange={set("company")} placeholder={t("contact.fCompanyPh")} />
            </Field>
            <Field label={t("contact.fMessage")} className="sm:col-span-2" error={errors.message}>
              <Textarea rows={5} value={form.message} onChange={set("message")} placeholder={t("contact.fMessagePh")} />
            </Field>
          </div>

          {/* Opt-in LGPD para newsletter — desmarcado por padrão */}
          <label className="mt-5 flex items-start gap-3 cursor-pointer select-none rounded-md border border-slate-200 bg-bg-soft px-4 py-3 hover:border-primary/40 transition">
            <input
              type="checkbox"
              checked={form.newsletter}
              onChange={e => setForm(f => ({ ...f, newsletter: e.target.checked }))}
              className="mt-0.5 w-5 h-5 shrink-0 rounded border-slate-300 text-accent accent-accent focus:ring-2 focus:ring-accent"
            />
            <span className="text-sm text-primary leading-relaxed">
              <span className="font-semibold">{t("contact.optin")}</span>
              <span className="block text-xs text-text-muted mt-0.5">{t("contact.optinSub")} {t("contact.optinSee")} <a href="#" className="underline">{t("contact.privacy")}</a>.</span>
            </span>
          </label>

          {/* Honeypot anti-spam: invisível para humanos, ignorado por leitores de tela. */}
          <input
            type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
            value={honeypot} onChange={e => setHoneypot(e.target.value)}
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
          />

          <Button type="submit" size="lg" variant="primary" className="mt-4 w-full" disabled={sending}>
            <Icon name="Send" className="w-4 h-4" /> {sending ? t("contact.sending") : t("contact.send")}
          </Button>
          <p className="mt-3 text-xs text-text-muted text-center">{t("contact.reply")}</p>
        </form>
      </div>
    </section>
  );
}
