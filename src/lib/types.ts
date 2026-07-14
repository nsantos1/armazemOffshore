// Tipos de domínio compartilhados pela camada de dados e pelos componentes.
// Espelham exatamente o formato gravado hoje no localStorage (ver lib/seed-data.ts).
// TODO: quando a API real existir, este arquivo passa a ser o contrato com o backend.

export interface SeoMeta {
  title: string;
  description: string;
  keywords: string;
}

export type PostStatus = "draft" | "published";

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: string | null;
  coverHue: number;
  category: string;
  author: string;
  publishedAt: string; // ISO date
  readTime: number;
  status: PostStatus;
  tags: string[];
  seo: SeoMeta;
  content: string; // HTML
  // Tag de Google Analytics específica deste post (ID G-/GTM-/AW- ou snippet <script>).
  // Editável APENAS no painel admin; nunca é renderizada como conteúdo visível.
  // Quando preenchida, dispara de forma invisível na página pública do post.
  analyticsTag?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string | null;
  hue: number;
  position: "left" | "center" | "right";
  active: boolean;
  order: number;
}

export type PartnerKind = "supplier" | "client";

export interface Partner {
  id: string;
  name: string;
  kind: PartnerKind;
  url: string;
  image: string | null;
  desc: string;
  about?: string;
  active: boolean;
  order: number;
}

export interface Identity {
  logoVariant: "default" | string;
  logoCustom: string | null;
  logoAlt: string;
  logoMaxWidth: number;
  faviconCustom: string | null;
}

export interface Base {
  id: string;
  city: string;
  label: string;
  address: string;
  mapQuery: string;
}

export interface SocialLinks {
  instagram: string;
  linkedin: string;
  facebook: string;
}

export interface Pillar {
  icon: string;
  title: string;
  text: string;
}

export interface Solution {
  icon: string;
  title: string;
  text: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  ga4Id: string;
  gtmId: string;
  customCode: string;
}

export interface Settings {
  phone: string;
  whatsapp: string;
  email: string;
  bases: Base[];
  social: SocialLinks;
  about: string;
  pillars: Pillar[];
  solutions: Solution[];
  storeUrl: string;
  analytics: AnalyticsConfig;
}

// Página de Certificações (editável pelo admin).
// `anchors` são os links/documentos exibidos no bloco "Qualidade".
export interface CertAnchor {
  id: string;
  label: string;
  url: string;
}

export interface Certifications {
  bannerImage: string | null; // imagem opcional do topo da página (dataURL ou URL)
  visao: string;
  politica: string;
  valores: string;        // um valor por linha; renderizado como lista
  qualidadeIntro: string; // texto opcional acima dos documentos
  anchors: CertAnchor[];
}

export interface Session {
  email: string;
  name: string;
  at: number;
}

export type NLSubscriberStatus = "active" | "unsubscribed";
export type NLSubscriberSource = "contact_form" | "manual" | "import";

export interface NLSubscriber {
  id: string;
  email: string;
  status: NLSubscriberStatus;
  source: NLSubscriberSource;
  createdAt: string;
  ip: string;
  reactivatedAt?: string;
  unsubscribedAt?: string;
  updatedAt?: string;
}

export type NLCampaignStatus = "draft" | "sent" | "scheduled" | "failed";
export type NLRecipientMode = "all_active" | "manual";

export interface NLCampaign {
  id: string;
  subject: string;
  preheader: string;
  content: string; // HTML
  coverImage: string | null;
  status: NLCampaignStatus;
  sentAt: string | null;
  createdAt: string;
  sentCount: number;
  opensCount: number;
  clicksCount: number;
  recipientMode: NLRecipientMode;
}

// Resultado padrão das operações de mutação do `api` (mock de respostas REST).
export interface ApiFailure {
  ok: false;
  reason: string;
  error?: string;
}
export type ApiResult<T extends Record<string, unknown> = Record<string, unknown>> =
  | ({ ok: true } & T)
  | ApiFailure;

// Type guard explícito: usado nos pontos de consumo porque, em alguns ambientes de
// type-check deste projeto, o narrowing automático de `if (r.ok)` não restringe o
// branch `else` corretamente para este union genérico. Usar `isApiFailure(r)` (ou
// `!r.ok` com este guard) garante o tipo correto sem depender desse narrowing.
export function isApiFailure(r: { ok: boolean }): r is ApiFailure {
  return r.ok === false;
}

// Rota interna do roteador baseado em hash (ver app-shell/router.ts).
export type Route = string;

export type NavigateFn = (path: string) => void;
