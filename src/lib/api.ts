// Camada de API mock (localStorage) consumida pelos componentes públicos e do admin.
// TODO: Substituir cada método por uma chamada REST/GraphQL real — a assinatura de
// cada função já reflete o que o endpoint correspondente deveria receber/retornar.
import { KEY, read, uid, write } from "./storage";
import {
  SEED_CATEGORIES,
  SEED_CERTS,
  SEED_IDENTITY,
  SEED_SETTINGS,
} from "./seed-data";
import type {
  ApiResult,
  Banner,
  Certifications,
  Identity,
  Partner,
  PartnerKind,
  Session,
  Settings,
} from "./types";

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
};
