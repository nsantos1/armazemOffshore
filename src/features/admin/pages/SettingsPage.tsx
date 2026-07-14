"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Toggle } from "@/components/ui/FormControls";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { flushPersist, uid } from "@/lib/storage";
import type { Base, Settings } from "@/lib/types";

export function SettingsPage() {
  const toast = useToast();
  const [s, setS] = React.useState<Settings>(() => api.getSettings());
  const [saving, setSaving] = React.useState(false);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS(o => ({ ...o, [k]: v }));
  const setBase = (i: number, k: keyof Base, v: string) => setS(o => ({ ...o, bases: o.bases.map((b, j) => j === i ? { ...b, [k]: v } : b) }));
  const addBase = () => setS(o => ({ ...o, bases: [...o.bases, { id: `b${uid()}`, city: "Nova cidade", label: "Filial", address: "Endereço completo", mapQuery: "" }] }));
  const rmBase = (i: number) => setS(o => ({ ...o, bases: o.bases.filter((_, j) => j !== i) }));

  const save = async () => {
    setSaving(true);
    api.setSettings(s);
    const ok = await flushPersist();
    setSaving(false);
    if (ok) { toast("Configurações salvas.", "success"); window.dispatchEvent(new Event("settings-changed")); }
    else { toast("Não foi possível salvar no servidor. Verifique a conexão e tente de novo.", "error"); }
  };

  return (
    <div className="space-y-4">
      {/* Contact */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Contact" className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-primary">Contato</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Telefone"><Input value={s.phone} onChange={e => set("phone", e.target.value)} /></Field>
          <Field label="E-mail"><Input value={s.email} onChange={e => set("email", e.target.value)} /></Field>
          <Field label="WhatsApp (somente números)"><Input value={s.whatsapp} onChange={e => set("whatsapp", e.target.value)} /></Field>
          <Field label="URL da Loja Virtual"><Input value={s.storeUrl} onChange={e => set("storeUrl", e.target.value)} /></Field>
        </div>
      </div>

      {/* About */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Info" className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-primary">Sobre a empresa</h2>
        </div>
        <Field label="Texto institucional" hint="Aparece na seção Quem Somos.">
          <Textarea rows={5} value={s.about} onChange={e => set("about", e.target.value)} />
        </Field>
      </div>

      {/* Bases */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="MapPin" className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-primary">Bases &amp; endereços</h2>
          </div>
          <Button variant="outline" size="sm" onClick={addBase}><Icon name="Plus" className="w-4 h-4" /> Nova base</Button>
        </div>
        <p className="text-xs text-text-muted mb-3">A consulta de mapa (última coluna) alimenta o mapa interativo na página pública. Aceita endereço, CEP ou coordenadas "lat,lng".</p>
        <div className="space-y-3">
          {s.bases.map((b, i) => (
            <div key={i} className="grid sm:grid-cols-[1fr_1fr_2fr_1.4fr_auto] gap-2 items-start">
              <Input value={b.label} onChange={e => setBase(i, "label", e.target.value)} placeholder="Rótulo (Sede, Filial...)" />
              <Input value={b.city} onChange={e => setBase(i, "city", e.target.value)} placeholder="Cidade - UF" />
              <Input value={b.address} onChange={e => setBase(i, "address", e.target.value)} placeholder="Endereço completo" />
              <Input value={b.mapQuery || ""} onChange={e => setBase(i, "mapQuery", e.target.value)} placeholder="Consulta para o mapa" />
              <button onClick={() => rmBase(i)} className="grid place-items-center w-10 h-10 rounded-md text-text-muted hover:text-red-600 hover:bg-red-50"><Icon name="Trash2" className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Social */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Share2" className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-primary">Redes sociais</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Instagram"><Input value={s.social.instagram} onChange={e => set("social", { ...s.social, instagram: e.target.value })} /></Field>
          <Field label="LinkedIn"> <Input value={s.social.linkedin} onChange={e => set("social", { ...s.social, linkedin: e.target.value })} /></Field>
          <Field label="Facebook"> <Input value={s.social.facebook} onChange={e => set("social", { ...s.social, facebook: e.target.value })} /></Field>
        </div>
      </div>

      {/* Google Analytics / Tags */}
      {(() => {
        const an = s.analytics;
        const setAn = (k: keyof Settings["analytics"], v: string | boolean) => set("analytics", { ...an, [k]: v });
        const ga4Valid = !an.ga4Id || /^G-[A-Z0-9]+$/i.test(an.ga4Id.trim());
        const gtmValid = !an.gtmId || /^GTM-[A-Z0-9]+$/i.test(an.gtmId.trim());
        return (
          <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Icon name="LineChart" className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-primary">Google Analytics &amp; Tags</h2>
              </div>
              <Toggle checked={!!an.enabled} onChange={v => setAn("enabled", v)} label={an.enabled ? "Ativo" : "Inativo"} />
            </div>
            <p className="text-xs text-text-muted mb-4 max-w-2xl">
              Cole aqui as tags de rastreamento fornecidas pela sua agência de marketing. Você pode informar o ID
              de medição do Google Analytics 4, o ID do Google Tag Manager e/ou colar um snippet completo. As tags
              só são carregadas no site público quando o rastreamento está <strong>ativo</strong> — o painel
              administrativo nunca é rastreado.
            </p>

            <div className={`space-y-4 transition-opacity ${an.enabled ? "" : "opacity-50 pointer-events-none"}`} aria-disabled={!an.enabled}>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="ID de medição (GA4)" hint="Formato G-XXXXXXXXXX" error={ga4Valid ? "" : "ID inválido — deve começar com G-"}>
                  <Input value={an.ga4Id} onChange={e => setAn("ga4Id", e.target.value)} placeholder="G-XXXXXXXXXX" className="font-mono" />
                </Field>
                <Field label="ID do Google Tag Manager" hint="Opcional — formato GTM-XXXXXXX" error={gtmValid ? "" : "ID inválido — deve começar com GTM-"}>
                  <Input value={an.gtmId} onChange={e => setAn("gtmId", e.target.value)} placeholder="GTM-XXXXXXX" className="font-mono" />
                </Field>
              </div>

              <Field
                label="Tag / código personalizado"
                hint="Opcional. Cole o snippet completo enviado pela agência (inclusive as tags <script>). Será inserido no <head> do site público."
              >
                <Textarea
                  rows={6}
                  value={an.customCode}
                  onChange={e => setAn("customCode", e.target.value)}
                  placeholder={"<!-- Cole aqui a tag fornecida pela agência -->\n<script>...</script>"}
                  className="font-mono text-xs"
                />
              </Field>

              <div className="flex items-start gap-2 rounded-lg bg-bg-soft border border-slate-200 px-3 py-2.5">
                <Icon name="ShieldCheck" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted">
                  Use apenas códigos de fontes confiáveis (sua agência). Scripts colados aqui são executados no
                  navegador dos visitantes. Após salvar, abra o site público em uma nova aba para validar o disparo
                  no painel do Google Analytics.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex items-center justify-end gap-2">
        <Button onClick={save} disabled={saving}><Icon name={saving ? "Loader2" : "Save"} className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} /> Salvar configurações</Button>
      </div>
    </div>
  );
}
