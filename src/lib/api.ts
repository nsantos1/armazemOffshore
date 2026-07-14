// Camada de API mock (localStorage) consumida pelos componentes públicos e do admin.
// TODO: Substituir cada método por uma chamada REST/GraphQL real — a assinatura de
// cada função já reflete o que o endpoint correspondente deveria receber/retornar.
import { KEY, read, uid, write } from "./storage";
import {
  SEED_CATEGORIES,
  SEED_CERTS,
  SEED_IDENTITY,
  SEED_NL_CAMPS,
  SEED_NL_SUBS,
  SEED_SETTINGS,
} from "./seed-data";
import type {
  ApiResult,
  Banner,
  Certifications,
  Identity,
  NLCampaign,
  NLSubscriber,
  Partner,
  PartnerKind,
  Session,
  Settings,
} from "./types";

// ---- Inicialização -----------------------------------------------------
// O CONTEÚDO do site (banners, parceiros, identidade, configurações, certificações,
// categorias) agora é servido pelo servidor e semeado lá — não é mais semeado aqui
// (ver storage.hydrate + content-store). Aqui só restam as chaves que continuam no
// localStorage: inscritos e campanhas da newsletter.
export function init(): void {
  if (typeof window === "undefined") return;
  if (!read(KEY.nlSubs, null)) write(KEY.nlSubs, SEED_NL_SUBS);
  if (!read(KEY.nlCamps, null)) write(KEY.nlCamps, SEED_NL_CAMPS);
}
init();

// ---- API ---------------------------------------------------------------
// Nota: as NOTÍCIAS têm o próprio fluxo no servidor (posts-store + /api/posts e
// posts-client). Este objeto cobre o conteúdo servido pelo storage (banners,
// parceiros, identidade, settings, certs, categorias) e a newsletter/auth locais.
export const api = {
  // Banners
  getBanners: (): Banner[] => read(KEY.banners, []).slice().sort((a, b) => a.order - b.order),
  createBanner: (data: Partial<Banner>): Banner => {
    const list = api.getBanners();
    const b = { id: uid(), order: list.length + 1, active: true, ...data } as Banner;
    write(KEY.banners, [...list, b]); return b;
  },
  updateBanner: (id: string, patch: Partial<Banner>): Banner | undefined => {
    const list = read(KEY.banners, [] as Banner[]).map(b => b.id === id ? { ...b, ...patch } : b);
    write(KEY.banners, list); return list.find(b => b.id === id);
  },
  deleteBanner: (id: string): void => write(KEY.banners, read(KEY.banners, [] as Banner[]).filter(b => b.id !== id)),
  reorderBanners: (ids: string[]): void => {
    const list = read(KEY.banners, [] as Banner[]);
    const map = Object.fromEntries(list.map(b => [b.id, b]));
    const reordered = ids.map((id, i) => ({ ...map[id], order: i + 1 }));
    write(KEY.banners, reordered);
  },

  // Partners
  getPartners: (kind?: PartnerKind): Partner[] => {
    const all = read(KEY.partners, [] as Partner[]).slice().sort((a, b) => a.order - b.order);
    return kind ? all.filter(p => p.kind === kind) : all;
  },
  createPartner: (data: Partial<Partner>): Partner => {
    const list = read(KEY.partners, [] as Partner[]);
    const p = { id: uid(), active: true, order: list.length + 1, ...data } as Partner;
    write(KEY.partners, [...list, p]); return p;
  },
  updatePartner: (id: string, patch: Partial<Partner>): Partner | undefined => {
    const list = read(KEY.partners, [] as Partner[]).map(p => p.id === id ? { ...p, ...patch } : p);
    write(KEY.partners, list); return list.find(p => p.id === id);
  },
  deletePartner: (id: string): void => write(KEY.partners, read(KEY.partners, [] as Partner[]).filter(p => p.id !== id)),
  reorderPartners: (kind: PartnerKind, ids: string[]): void => {
    const list = read(KEY.partners, [] as Partner[]);
    const map = Object.fromEntries(list.map(p => [p.id, p]));
    const reordered = ids.map((id, i) => ({ ...map[id], order: i + 1 }));
    const others = list.filter(p => p.kind !== kind);
    write(KEY.partners, [...others, ...reordered]);
  },

  // Categories
  getCategories: (): string[] => read(KEY.categories, SEED_CATEGORIES).slice().sort((a, b) => a.localeCompare(b, "pt-BR")),
  addCategory: (name: string): ApiResult<{ category: string }> => {
    const clean = (name || "").trim();
    if (!clean) return { ok: false, reason: "empty" };
    if (clean.length > 40) return { ok: false, reason: "too_long" };
    const list = read(KEY.categories, SEED_CATEGORIES);
    if (list.some(c => c.toLowerCase() === clean.toLowerCase())) return { ok: false, reason: "duplicate" };
    const next = [...list, clean];
    write(KEY.categories, next);
    return { ok: true, category: clean };
  },
  renameCategory: (oldName: string, newName: string): ApiResult<{ category: string }> => {
    const clean = (newName || "").trim();
    if (!clean) return { ok: false, reason: "empty" };
    if (clean.length > 40) return { ok: false, reason: "too_long" };
    if (clean === oldName) return { ok: true, category: clean };
    const list = read(KEY.categories, SEED_CATEGORIES);
    if (list.some(c => c.toLowerCase() === clean.toLowerCase() && c !== oldName)) return { ok: false, reason: "duplicate" };
    const nextCats = list.map(c => c === oldName ? clean : c);
    write(KEY.categories, nextCats);
    return { ok: true, category: clean };
  },
  deleteCategory: (name: string): ApiResult => {
    const list = read(KEY.categories, SEED_CATEGORIES);
    if (list.length <= 1) return { ok: false, reason: "last_one" };
    const next = list.filter(c => c !== name);
    write(KEY.categories, next);
    return { ok: true };
  },

  // Identity
  getIdentity: (): Identity => read(KEY.identity, SEED_IDENTITY),
  setIdentity: (patch: Partial<Identity>): Identity => { const cur = api.getIdentity(); const next = { ...cur, ...patch }; write(KEY.identity, next); return next; },

  // Settings
  // Merge com os defaults para que novas chaves (ex.: analytics) apareçam mesmo em
  // dados já salvos, sem precisar reseed e sem perder edições do cliente.
  getSettings: (): Settings => {
    const stored = read(KEY.settings, null as Settings | null);
    if (!stored) return SEED_SETTINGS;
    return { ...SEED_SETTINGS, ...stored, analytics: { ...SEED_SETTINGS.analytics, ...(stored.analytics || {}) } };
  },
  setSettings: (patch: Partial<Settings>): Settings => { const cur = api.getSettings(); const next = { ...cur, ...patch }; write(KEY.settings, next); return next; },

  // Certifications
  // Merge com o seed para que novas chaves apareçam mesmo em dados já salvos.
  getCertifications: (): Certifications => {
    const stored = read(KEY.certs, null as Certifications | null);
    if (!stored) return SEED_CERTS;
    return { ...SEED_CERTS, ...stored };
  },
  setCertifications: (patch: Partial<Certifications>): Certifications => {
    const cur = api.getCertifications(); const next = { ...cur, ...patch };
    write(KEY.certs, next); return next;
  },

  // Auth (mock — validação no cliente).
  // ATENÇÃO: como a verificação roda no navegador, a senha fica visível no bundle.
  // Isto é um paliativo para o lançamento; a autenticação real (servidor + hash +
  // sessão httpOnly) é a FASE 2 planejada. Comparação case-insensitive no e-mail.
  login: (email: string, password: string): ApiResult<{ session: Session }> => {
    const ADMIN_EMAIL = "marketing@armazemoffshore.com.br";
    const ADMIN_PASSWORD = "Arm@2026!";
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const session: Session = { email: ADMIN_EMAIL, name: "Administrador", at: Date.now() };
      write(KEY.auth, session); return { ok: true, session };
    }
    return { ok: false, reason: "invalid_credentials", error: "E-mail ou senha incorretos." };
  },
  logout: (): void => { if (typeof window !== "undefined") window.localStorage.removeItem(KEY.auth); },
  getSession: (): Session | null => read(KEY.auth, null),

  // ===== NEWSLETTER =====================================================
  // Subscribers
  // TODO: Substituir por POST /api/newsletter/subscribe (público) e GET /api/admin/newsletter/subscribers (admin)
  nlGetSubs: (): NLSubscriber[] => read(KEY.nlSubs, []),
  nlCountActive: (): number => api.nlGetSubs().filter(s => s.status === "active").length,
  nlAddSub: (email: string, opts: { source?: NLSubscriber["source"]; ip?: string } = {}): ApiResult<{ sub?: NLSubscriber; reactivated?: boolean }> => {
    const list = api.nlGetSubs();
    const norm = (email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(norm)) return { ok: false, reason: "invalid_email" };
    if (list.find(s => s.email === norm && s.status === "active")) return { ok: false, reason: "already_subscribed" };
    const existing = list.find(s => s.email === norm);
    if (existing) {
      // re-activate
      api.nlUpdateSub(existing.id, { status: "active", reactivatedAt: new Date().toISOString() });
      return { ok: true, reactivated: true };
    }
    const sub: NLSubscriber = {
      id: uid(), email: norm, status: "active",
      source: opts.source || "manual",
      createdAt: new Date().toISOString(),
      ip: opts.ip || "-",
    };
    write(KEY.nlSubs, [sub, ...list]);
    return { ok: true, sub };
  },
  nlUpdateSub: (id: string, patch: Partial<NLSubscriber>): NLSubscriber | undefined => {
    const list = api.nlGetSubs().map(s => s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s);
    write(KEY.nlSubs, list);
    return list.find(s => s.id === id);
  },
  nlDeleteSub: (id: string): void => write(KEY.nlSubs, api.nlGetSubs().filter(s => s.id !== id)),
  nlUnsubscribeByToken: (token: string): ApiResult<{ sub: NLSubscriber }> => {
    // Token simulado = base64 do id. No backend real, é um JWT/HMAC assinado.
    let id: string;
    try { id = atob(token); } catch { return { ok: false, reason: "invalid_token" }; }
    const sub = api.nlGetSubs().find(s => s.id === id);
    if (!sub) return { ok: false, reason: "not_found" };
    api.nlUpdateSub(id, { status: "unsubscribed", unsubscribedAt: new Date().toISOString() });
    return { ok: true, sub };
  },
  nlSubToken: (id: string): string => btoa(id),

  // Campaigns
  nlGetCamps: (): NLCampaign[] => read(KEY.nlCamps, []).slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  nlGetCamp: (id: string): NLCampaign | undefined => api.nlGetCamps().find(c => c.id === id),
  nlCreateCamp: (data: Partial<NLCampaign>): NLCampaign => {
    const list = read(KEY.nlCamps, [] as NLCampaign[]);
    const camp = {
      id: uid(), status: "draft", sentAt: null, sentCount: 0, opensCount: 0, clicksCount: 0,
      createdAt: new Date().toISOString(), recipientMode: "all_active",
      coverImage: null, preheader: "", ...data,
    } as NLCampaign;
    write(KEY.nlCamps, [camp, ...list]);
    return camp;
  },
  nlUpdateCamp: (id: string, patch: Partial<NLCampaign>): NLCampaign | undefined => {
    const list = read(KEY.nlCamps, [] as NLCampaign[]).map(c => c.id === id ? { ...c, ...patch } : c);
    write(KEY.nlCamps, list); return list.find(c => c.id === id);
  },
  nlDeleteCamp: (id: string): void => write(KEY.nlCamps, read(KEY.nlCamps, [] as NLCampaign[]).filter(c => c.id !== id)),
};
