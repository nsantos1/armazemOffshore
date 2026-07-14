"use client";

import * as React from "react";
import { Icon, LogoIcon, LogoLockup } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/FormControls";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { flushPersist } from "@/lib/storage";
import { uploadImage } from "@/lib/uploads-client";
import { applyFavicon } from "@/lib/utils";
import type { Identity } from "@/lib/types";

export function IdentityPage() {
  const toast = useToast();
  const [identity, setIdentity] = React.useState<Identity>(() => api.getIdentity());
  const [saving, setSaving] = React.useState(false);
  const set = <K extends keyof Identity>(k: K, v: Identity[K]) => setIdentity(o => ({ ...o, [k]: v }));

  const onLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { set("logoCustom", await uploadImage(f)); }
    catch (err) { toast(err instanceof Error ? err.message : "Falha ao enviar a imagem.", "error"); }
    e.target.value = "";
  };
  const onFav = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { set("faviconCustom", await uploadImage(f)); }
    catch (err) { toast(err instanceof Error ? err.message : "Falha ao enviar a imagem.", "error"); }
    e.target.value = "";
  };
  const save = async () => {
    setSaving(true);
    api.setIdentity(identity);
    const ok = await flushPersist();
    setSaving(false);
    if (ok) { applyFavicon(identity); toast("Identidade visual atualizada.", "success"); window.dispatchEvent(new Event("identity-changed")); }
    else { toast("Não foi possível salvar no servidor. Verifique a conexão e tente de novo.", "error"); }
  };
  const reset = () => { setIdentity({ logoVariant: "default", logoCustom: null, logoAlt: "Armazém Offshore", logoMaxWidth: 180, faviconCustom: null }); };

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Logo */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Image" className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-primary">Logotipo</h2>
          </div>
          <p className="text-sm text-text-muted">Suba uma versão personalizada ou mantenha o lockup padrão. O upload aparece imediatamente no cabeçalho e no rodapé.</p>

          <div className="mt-5 rounded-lg border border-slate-200 bg-primary p-6 flex items-center justify-center min-h-[140px]">
            {identity.logoCustom
              ? <img src={identity.logoCustom} alt={identity.logoAlt} style={{ maxWidth: identity.logoMaxWidth || 180 }} className="max-h-24 object-contain" />
              : <LogoLockup />
            }
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-primary-700">
              <Icon name="Upload" className="w-4 h-4" /> {identity.logoCustom ? "Trocar" : "Enviar"} logo
              <input type="file" className="hidden" accept="image/*,image/svg+xml" onChange={onLogo} />
            </label>
            {identity.logoCustom && <Button variant="ghost" onClick={() => set("logoCustom", null)}><Icon name="X" className="w-4 h-4" />Voltar ao padrão</Button>}
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <Field label="Texto alternativo">
              <Input value={identity.logoAlt} onChange={e => set("logoAlt", e.target.value)} />
            </Field>
            <Field label="Largura máxima (px)" hint="Quanto o logo pode ocupar no cabeçalho">
              <Input type="number" min={80} max={300} value={identity.logoMaxWidth || 180} onChange={e => set("logoMaxWidth", Number(e.target.value) || 180)} />
            </Field>
          </div>
        </div>

        {/* Favicon */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Globe" className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-primary">Favicon</h2>
          </div>
          <p className="text-sm text-text-muted">Ícone exibido na aba do navegador. Recomendado: 64×64 ou maior, PNG/SVG.</p>

          <div className="mt-5 flex items-center gap-5">
            <div className="grid place-items-center w-24 h-24 rounded-xl bg-bg-soft border border-slate-200 overflow-hidden">
              {identity.faviconCustom
                ? <img src={identity.faviconCustom} alt="" className="w-16 h-16 object-contain" />
                : <LogoIcon className="w-16 h-16" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 rounded-md bg-bg-soft px-3 py-2 border border-slate-200">
                <div className="w-4 h-4 rounded-sm overflow-hidden">
                  {identity.faviconCustom
                    ? <img src={identity.faviconCustom} alt="" className="w-full h-full object-cover" />
                    : <LogoIcon className="w-full h-full" />}
                </div>
                <span className="text-xs text-primary font-mono truncate">armazemoffshore.com.br/blog</span>
              </div>
              <p className="mt-2 text-xs text-text-muted">Pré-visualização na aba do navegador</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-primary-700">
              <Icon name="Upload" className="w-4 h-4" /> {identity.faviconCustom ? "Trocar" : "Enviar"} favicon
              <input type="file" className="hidden" accept="image/png, image/x-icon, image/svg+xml" onChange={onFav} />
            </label>
            {identity.faviconCustom && <Button variant="ghost" onClick={() => set("faviconCustom", null)}><Icon name="X" className="w-4 h-4" />Voltar ao padrão</Button>}
          </div>
        </div>
      </div>

      {/* Palette readout (read-only) */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Droplet" className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-primary">Paleta de cores</h2>
        </div>
        <p className="text-sm text-text-muted">Paleta oficial do Manual da Marca (Luun Studio, abr/2023).</p>
        <div className="mt-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Principais</div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
            {[
              { name: "Navy (Azul escuro)", hex: "#002E4A", pantone: "Pantone 295 C" },
              { name: "Amarelo", hex: "#FFD000", pantone: "Pantone 123 C" },
            ].map(c => (
              <div key={c.hex} className="rounded-lg overflow-hidden border border-slate-200">
                <div className="h-24" style={{ background: c.hex }} />
                <div className="bg-white px-4 py-3">
                  <div className="text-sm font-bold text-primary">{c.name}</div>
                  <div className="mt-0.5 text-xs text-text-muted flex items-center justify-between gap-2">
                    <span className="font-mono">{c.hex}</span>
                    <span>{c.pantone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted mt-5 mb-2">Secundárias</div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
            {[
              { name: "Verde Água", hex: "#89D6C2", pantone: "Pantone 3242" },
              { name: "Cinza claro", hex: "#D7D7D7", pantone: "Cool Gray 2 C" },
            ].map(c => (
              <div key={c.hex} className="rounded-lg overflow-hidden border border-slate-200">
                <div className="h-20" style={{ background: c.hex }} />
                <div className="bg-white px-4 py-3">
                  <div className="text-sm font-bold text-primary">{c.name}</div>
                  <div className="mt-0.5 text-xs text-text-muted flex items-center justify-between gap-2">
                    <span className="font-mono">{c.hex}</span>
                    <span>{c.pantone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tipografia oficial */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Type" className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-primary">Tipografia</h2>
        </div>
        <p className="text-sm text-text-muted">Famílias tipográficas oficiais (Manual da Marca, pág. 6).</p>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Títulos</div>
            <div className="mt-1 text-3xl font-extrabold text-primary" style={{ fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 800 }}>Montserrat ExtraBold</div>
            <div className="mt-2 text-xs text-text-muted">Usar em h1, h2, h3, destaques. Pesos: 700 / 800 / 900.</div>
            <div className="mt-3 text-sm text-primary" style={{ fontFamily: "Montserrat", fontWeight: 800 }}>Qualidade e confiança em cada produto</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Corpo de texto</div>
            <div className="mt-1 text-3xl font-bold text-primary" style={{ fontFamily: "Open Sans, system-ui, sans-serif", fontWeight: 700 }}>Open Sans</div>
            <div className="mt-2 text-xs text-text-muted">Usar em parágrafos e UI. Pesos: 400 (regular) / 600 (semibold).</div>
            <div className="mt-3 text-sm text-primary" style={{ fontFamily: "Open Sans", fontWeight: 400 }}>Suprimentos MRO para a indústria naval e petrolífera desde 1987.</div>
          </div>
        </div>
      </div>

      {/* Regras de uso do logo */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="ShieldCheck" className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-primary">Regras de uso do logo</h2>
        </div>
        <p className="text-sm text-text-muted">Diretrizes do Manual da Marca + complementos do design system.</p>
        <ul className="mt-4 space-y-2 text-sm text-primary">
          <li className="flex gap-2"><Icon name="Check" className="w-4 h-4 text-emerald-600 mt-0.5" /><span><b>Clear space</b>: mínimo 0.5× a altura do logo em todos os lados.</span></li>
          <li className="flex gap-2"><Icon name="Check" className="w-4 h-4 text-emerald-600 mt-0.5" /><span><b>Tamanho mínimo</b>: 120px (logo completo) · 32px (apenas símbolo).</span></li>
          <li className="flex gap-2"><Icon name="Check" className="w-4 h-4 text-emerald-600 mt-0.5" /><span><b>Fundos permitidos</b>: navy, amarelo, branco/cinza claro, verde água, preto (mono).</span></li>
          <li className="flex gap-2"><Icon name="X" className="w-4 h-4 text-red-600 mt-0.5" /><span><b>Não fazer</b>: distorcer proporção, rotacionar, aplicar sombras/filtros, alterar cores fora da paleta.</span></li>
        </ul>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={reset}>Restaurar padrão</Button>
        <Button onClick={save} disabled={saving}><Icon name={saving ? "Loader2" : "Save"} className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} /> Salvar identidade</Button>
      </div>
    </div>
  );
}
