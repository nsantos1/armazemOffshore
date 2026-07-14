"use client";

// Internacionalização (i18n) — SOMENTE do site público visto pelo usuário final.
// O painel admin permanece exclusivamente em português (fonte única da verdade).
//
// Abordagem: dicionário de strings de interface (chrome) + contexto de idioma.
// Os componentes públicos leem os rótulos fixos por `useT()`. O conteúdo editorial
// (sobre, pilares, soluções, certificações, parceiros, banners) — que é gerenciado
// pelo admin em PT — recebe uma sobreposição em inglês em `content-en.ts`.
// O conteúdo de NOTÍCIAS (posts) NÃO é traduzido, conforme solicitado.

import * as React from "react";

export type Lang = "pt" | "en";

const STORAGE_KEY = "ao_lang";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = React.createContext<LangCtx | null>(null);

// -------------------------------------------------------------------------
// Dicionário de rótulos fixos (interface). Chaves em dot-notation.
// -------------------------------------------------------------------------
const DICT: Record<Lang, Record<string, string>> = {
  pt: {
    // Header / navegação
    "nav.about": "Quem Somos",
    "nav.partners": "Parceiros",
    "nav.certs": "Certificações",
    "nav.news": "Notícias",
    "nav.contact": "Fale Conosco",
    "nav.store": "Loja Virtual",
    "lang.aria": "Selecionar idioma",
    "lang.pt": "Português",
    "lang.en": "English",
    "lang.ptShort": "PT",
    "lang.enShort": "EN",

    // Hero
    "hero.badge": "Desde 1987 — Indústria Naval & Petrolífera",
    "hero.titleFallback": "Suprimentos para quem move o offshore.",
    "hero.solutions": "Conheça nossas soluções",
    "hero.cta": "Fale Conosco",
    "hero.statYears": "anos no mercado",
    "hero.statBases": "bases estratégicas",
    "hero.statIso": "9001:2015 desde 2023",

    // Faixa ISO
    "iso.eyebrow": "Certificação",
    "iso.title": "ISO 9001:2015 — desde 2023",
    "iso.subtitle": "Sistema de gestão da qualidade auditado e em melhoria contínua.",
    "iso.audit": "Auditoria externa anual",
    "iso.indicators": "Indicadores publicados",

    // Quem Somos
    "about.eyebrow": "Quem Somos",
    "about.titleLead": "Pioneiros em ",
    "about.titleMark": "MRO offshore",
    "about.titleTail": " desde 1987.",
    "about.yearsCard": "anos abastecendo a indústria petrolífera e naval brasileira.",
    "about.acuTitle": "Porto do Açu",
    "about.acuText": "Único fornecedor de suprimentos com sede no porto.",

    // Pilares
    "pillars.eyebrow": "Nossos pilares",
    "pillars.title": "Três compromissos que sustentam cada entrega.",

    // Soluções
    "solutions.eyebrow": "Catálogo",
    "solutions.title": "Nossas soluções para a operação.",
    "solutions.subtitle": "Da ferramenta crítica ao consumível diário, tudo em um único fornecedor com prontidão para atender suas frentes onshore e offshore.",
    "solutions.cta": "Acesse a Loja Virtual",

    // Últimas notícias
    "news.eyebrow": "Notícias",
    "news.title": "Últimas atualizações.",
    "news.viewAll": "Ver todas as notícias",
    "news.read": "Ler matéria",

    // Parceiros
    "partners.eyebrow": "Parceiros",
    "partners.title": "Uma rede que sustenta operações críticas.",
    "partners.subtitle": "Clique em qualquer parceiro para conhecer mais sobre a operação.",
    "partners.suppliers": "Nossos Fornecedores",
    "partners.clients": "Nossos Clientes",
    "partners.details": "ver detalhes",
    "partners.none": "Nenhum cadastrado.",
    "partners.modalSupplier": "Fornecedor parceiro",
    "partners.modalClient": "Cliente",
    "partners.close": "Fechar",
    "partners.visit": "Visitar site",
    "partners.badgeSupplier": "Fornecedor",
    "partners.badgeClient": "Cliente",
    "partners.noDesc": "Sem descrição cadastrada.",
    "partners.prev": "Anterior",
    "partners.next": "Próximo",

    // Contato
    "contact.eyebrow": "Fale Conosco",
    "contact.title": "Pronto para abastecer sua operação.",
    "contact.subtitle": "Envie sua demanda — nossa equipe comercial responde em até 1 dia útil.",
    "contact.phone": "Telefone",
    "contact.email": "E-mail",
    "contact.basesTitle": "Nossas bases",
    "contact.basesHint": "· clique para ver no mapa",
    "contact.onMap": "no mapa",
    "contact.viewMap": "ver no mapa",
    "contact.openMaps": "Abrir no Maps",
    "contact.mapTitle": "Mapa",
    "contact.formTitle": "Envie sua mensagem",
    "contact.formSubtitle": "Preenchemos cotações com agilidade — quanto mais detalhes, melhor.",
    "contact.fName": "Nome completo",
    "contact.fNamePh": "Como devemos te chamar?",
    "contact.fEmail": "E-mail",
    "contact.fEmailPh": "seu@email.com",
    "contact.fPhone": "Telefone",
    "contact.fPhonePh": "(00) 00000-0000",
    "contact.fCompany": "Empresa",
    "contact.fCompanyPh": "Opcional",
    "contact.fMessage": "Mensagem",
    "contact.fMessagePh": "Descreva sua demanda, prazos e quantidades.",
    "contact.optin": "Quero receber novidades e conteúdo por e-mail",
    "contact.optinSub": "Você pode cancelar a qualquer momento pelo link no rodapé de cada e-mail.",
    "contact.privacy": "Política de Privacidade",
    "contact.optinSee": "Veja como tratamos seus dados na",
    "contact.sending": "Enviando...",
    "contact.send": "Enviar mensagem",
    "contact.reply": "Resposta em até 1 dia útil.",
    "contact.errName": "Informe seu nome.",
    "contact.errEmail": "E-mail inválido.",
    "contact.errMessage": "Conte um pouco mais sobre sua demanda.",
    "contact.toastNotConfigured": "Envio indisponível no momento. Fale conosco pelo WhatsApp ou telefone.",
    "contact.toastError": "Não foi possível enviar agora. Tente novamente em instantes.",
    "contact.toastConn": "Falha de conexão. Verifique sua internet e tente novamente.",
    "contact.toastSuccess": "Mensagem enviada!",
    "contact.nlAlready": " Você já está inscrito na newsletter.",
    "contact.nlReactivated": " Sua inscrição na newsletter foi reativada.",
    "contact.nlSubscribed": " Você também foi cadastrado na newsletter.",

    // Certificações (público)
    "certs.back": "Voltar à home",
    "certs.eyebrow": "Qualidade",
    "certs.title": "Certificações e gestão da qualidade.",
    "certs.subtitle": "Nosso compromisso com a excelência é sustentado por processos certificados e por uma política de melhoria contínua auditada a cada ciclo.",
    "certs.badge": "ISO 9001",
    "certs.visao": "Visão",
    "certs.politica": "Política",
    "certs.valores": "Valores",
    "certs.qualidade": "Qualidade",

    // Rodapé
    "footer.tagline": "Suprimentos MRO para a indústria naval e petrolífera. Tradição desde 1987, com bases em Macaé, Vila Velha e Porto do Açu.",
    "footer.navTitle": "Navegação",
    "footer.home": "Início",
    "footer.contactTitle": "Contato",
    "footer.basesTitle": "Bases",
    "footer.rights": "Copyright © 2025 Armazém, Todos os direitos reservados.",
    "footer.developedBy": "Desenvolvido por",

    // Blog / Notícias (chrome; o conteúdo dos posts não é traduzido)
    "blog.home": "Início",
    "blog.news": "Notícias",
    "blog.pressRoom": "Sala de imprensa",
    "blog.listTitle": "Notícias & Conteúdo Técnico",
    "blog.listSubtitle": "Operações, qualidade, conhecimento técnico e novidades do mercado offshore brasileiro.",
    "blog.search": "Buscar matérias...",
    "blog.all": "Todas",
    "blog.empty": "Nenhum post encontrado",
    "blog.emptyHint": "Tente ajustar a busca ou a categoria.",
    "blog.read": "Ler matéria",
    "blog.readTime": "min de leitura",
    "blog.tags": "Tags",
    "blog.notFound": "Matéria não encontrada",
    "blog.notFoundText": "O conteúdo que você procura pode ter sido removido ou estar com a URL incorreta.",
    "blog.backToBlog": "Voltar ao blog",
    "blog.share": "Compartilhar:",
    "blog.continueReading": "Continue lendo",
    "blog.viewAll": "Ver todas →",
    "blog.teamSubtitle": "Equipe Armazém Offshore",

    // Widgets flutuantes
    "widgets.whatsapp": "Fale no WhatsApp",

    // 404
    "notfound.title": "Página não encontrada",
    "notfound.back": "Voltar à home",
  },
  en: {
    // Header / navigation
    "nav.about": "About Us",
    "nav.partners": "Partners",
    "nav.certs": "Certifications",
    "nav.news": "News",
    "nav.contact": "Contact Us",
    "nav.store": "Online Store",
    "lang.aria": "Select language",
    "lang.pt": "Português",
    "lang.en": "English",
    "lang.ptShort": "PT",
    "lang.enShort": "EN",

    // Hero
    "hero.badge": "Since 1987 — Naval & Oil Industry",
    "hero.titleFallback": "Supplies for those who move the offshore.",
    "hero.solutions": "Explore our solutions",
    "hero.cta": "Contact Us",
    "hero.statYears": "years in the market",
    "hero.statBases": "strategic bases",
    "hero.statIso": "9001:2015 since 2023",

    // ISO band
    "iso.eyebrow": "Certification",
    "iso.title": "ISO 9001:2015 — since 2023",
    "iso.subtitle": "Quality management system audited and in continuous improvement.",
    "iso.audit": "Annual external audit",
    "iso.indicators": "Published indicators",

    // About
    "about.eyebrow": "About Us",
    "about.titleLead": "Pioneers in ",
    "about.titleMark": "offshore MRO",
    "about.titleTail": " since 1987.",
    "about.yearsCard": "years supplying the Brazilian oil and naval industry.",
    "about.acuTitle": "Porto do Açu",
    "about.acuText": "The only supplies provider headquartered inside the port.",

    // Pillars
    "pillars.eyebrow": "Our pillars",
    "pillars.title": "Three commitments behind every delivery.",

    // Solutions
    "solutions.eyebrow": "Catalog",
    "solutions.title": "Our solutions for your operation.",
    "solutions.subtitle": "From the critical tool to the daily consumable, everything from a single supplier ready to serve your onshore and offshore fronts.",
    "solutions.cta": "Visit the Online Store",

    // Latest news
    "news.eyebrow": "News",
    "news.title": "Latest updates.",
    "news.viewAll": "View all news",
    "news.read": "Read article",

    // Partners
    "partners.eyebrow": "Partners",
    "partners.title": "A network that sustains critical operations.",
    "partners.subtitle": "Click any partner to learn more about the operation.",
    "partners.suppliers": "Our Suppliers",
    "partners.clients": "Our Clients",
    "partners.details": "view details",
    "partners.none": "None registered.",
    "partners.modalSupplier": "Partner supplier",
    "partners.modalClient": "Client",
    "partners.close": "Close",
    "partners.visit": "Visit website",
    "partners.badgeSupplier": "Supplier",
    "partners.badgeClient": "Client",
    "partners.noDesc": "No description available.",
    "partners.prev": "Previous",
    "partners.next": "Next",

    // Contact
    "contact.eyebrow": "Contact Us",
    "contact.title": "Ready to supply your operation.",
    "contact.subtitle": "Send us your request — our sales team replies within 1 business day.",
    "contact.phone": "Phone",
    "contact.email": "Email",
    "contact.basesTitle": "Our bases",
    "contact.basesHint": "· click to view on the map",
    "contact.onMap": "on the map",
    "contact.viewMap": "view on map",
    "contact.openMaps": "Open in Maps",
    "contact.mapTitle": "Map",
    "contact.formTitle": "Send your message",
    "contact.formSubtitle": "We prepare quotes fast — the more details, the better.",
    "contact.fName": "Full name",
    "contact.fNamePh": "What should we call you?",
    "contact.fEmail": "Email",
    "contact.fEmailPh": "you@email.com",
    "contact.fPhone": "Phone",
    "contact.fPhonePh": "+00 00 00000-0000",
    "contact.fCompany": "Company",
    "contact.fCompanyPh": "Optional",
    "contact.fMessage": "Message",
    "contact.fMessagePh": "Describe your request, deadlines and quantities.",
    "contact.optin": "I want to receive news and content by email",
    "contact.optinSub": "You can unsubscribe at any time via the link in the footer of each email.",
    "contact.privacy": "Privacy Policy",
    "contact.optinSee": "See how we handle your data in our",
    "contact.sending": "Sending...",
    "contact.send": "Send message",
    "contact.reply": "Reply within 1 business day.",
    "contact.errName": "Please enter your name.",
    "contact.errEmail": "Invalid email.",
    "contact.errMessage": "Tell us a bit more about your request.",
    "contact.toastNotConfigured": "Sending is unavailable right now. Reach us on WhatsApp or by phone.",
    "contact.toastError": "Couldn't send right now. Please try again shortly.",
    "contact.toastConn": "Connection failed. Check your internet and try again.",
    "contact.toastSuccess": "Message sent!",
    "contact.nlAlready": " You are already subscribed to the newsletter.",
    "contact.nlReactivated": " Your newsletter subscription has been reactivated.",
    "contact.nlSubscribed": " You were also subscribed to the newsletter.",

    // Certifications (public)
    "certs.back": "Back to home",
    "certs.eyebrow": "Quality",
    "certs.title": "Certifications and quality management.",
    "certs.subtitle": "Our commitment to excellence is backed by certified processes and a continuous-improvement policy audited every cycle.",
    "certs.badge": "ISO 9001",
    "certs.visao": "Vision",
    "certs.politica": "Policy",
    "certs.valores": "Values",
    "certs.qualidade": "Quality",

    // Footer
    "footer.tagline": "MRO supplies for the naval and oil industry. A tradition since 1987, with bases in Macaé, Vila Velha and Porto do Açu.",
    "footer.navTitle": "Navigation",
    "footer.home": "Home",
    "footer.contactTitle": "Contact",
    "footer.basesTitle": "Bases",
    "footer.rights": "Copyright © 2025 Armazém, All rights reserved.",
    "footer.developedBy": "Developed by",

    // Blog / News (chrome; post content is not translated)
    "blog.home": "Home",
    "blog.news": "News",
    "blog.pressRoom": "Press room",
    "blog.listTitle": "News & Technical Content",
    "blog.listSubtitle": "Operations, quality, technical knowledge and news from the Brazilian offshore market.",
    "blog.search": "Search articles...",
    "blog.all": "All",
    "blog.empty": "No posts found",
    "blog.emptyHint": "Try adjusting the search or category.",
    "blog.read": "Read article",
    "blog.readTime": "min read",
    "blog.tags": "Tags",
    "blog.notFound": "Article not found",
    "blog.notFoundText": "The content you're looking for may have been removed or the URL may be incorrect.",
    "blog.backToBlog": "Back to blog",
    "blog.share": "Share:",
    "blog.continueReading": "Continue reading",
    "blog.viewAll": "View all →",
    "blog.teamSubtitle": "Armazém Offshore Team",

    // Floating widgets
    "widgets.whatsapp": "Chat on WhatsApp",

    // 404
    "notfound.title": "Page not found",
    "notfound.back": "Back to home",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("pt");

  // Restaura o idioma salvo (só no cliente; evita divergência de hidratação).
  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "pt" || saved === "en") setLangState(saved);
    } catch { /* ignora */ }
  }, []);

  React.useEffect(() => {
    try { document.documentElement.lang = lang === "en" ? "en" : "pt-BR"; } catch { /* ignora */ }
  }, [lang]);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem(STORAGE_KEY, l); } catch { /* ignora */ }
  }, []);

  const t = React.useCallback(
    (key: string) => (DICT[lang] && DICT[lang][key]) ?? DICT.pt[key] ?? key,
    [lang],
  );

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const c = React.useContext(Ctx);
  if (!c) return { lang: "pt", setLang: () => {}, t: (k: string) => DICT.pt[k] ?? k };
  return c;
}

export function useT(): (key: string) => string {
  return useLang().t;
}
