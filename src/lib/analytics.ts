// Google Analytics / tags de marketing.
// Injeta (ou remove) as tags de rastreamento configuradas no admin.
// Suporta: ID de medição GA4 (gtag.js), Google Tag Manager e um snippet
// personalizado colado pela agência. Idempotente — pode ser chamada a cada
// mudança de rota/config; remove o que já existe e reaplica.
import type { Settings } from "./types";

export function applyAnalytics(settings: Settings | null | undefined, opts: { disable?: boolean } = {}): void {
  try {
    const a = settings?.analytics || { enabled: false, ga4Id: "", gtmId: "", customCode: "" };
    const disable = opts.disable || !a.enabled;

    // Limpa tudo que já foi injetado anteriormente.
    if (typeof document === "undefined") return;
    document.querySelectorAll("[data-ao-analytics]").forEach(n => n.remove());
    if (disable) return;

    const head = document.head;
    const ga4 = (a.ga4Id || "").trim();
    const gtm = (a.gtmId || "").trim();
    const custom = (a.customCode || "").trim();

    // --- GA4 via gtag.js ---
    if (/^G-[A-Z0-9]+$/i.test(ga4)) {
      const loader = document.createElement("script");
      loader.async = true;
      loader.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ga4);
      loader.setAttribute("data-ao-analytics", "ga4-src");
      head.appendChild(loader);

      const initScript = document.createElement("script");
      initScript.setAttribute("data-ao-analytics", "ga4-init");
      initScript.text =
        "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}" +
        "gtag('js',new Date());gtag('config'," + JSON.stringify(ga4) + ");";
      head.appendChild(initScript);
    }

    // --- Google Tag Manager ---
    if (/^GTM-[A-Z0-9]+$/i.test(gtm)) {
      const s = document.createElement("script");
      s.setAttribute("data-ao-analytics", "gtm-src");
      s.text =
        "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});" +
        "var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';" +
        "j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;" +
        "f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer'," + JSON.stringify(gtm) + ");";
      head.appendChild(s);

      const ns = document.createElement("noscript");
      ns.setAttribute("data-ao-analytics", "gtm-ns");
      ns.innerHTML =
        '<iframe src="https://www.googletagmanager.com/ns.html?id=' + gtm +
        '" height="0" width="0" style="display:none;visibility:hidden"></iframe>';
      document.body.insertBefore(ns, document.body.firstChild);
    }

    // --- Snippet personalizado (colado pela agência) ---
    // innerHTML não executa <script>, então recriamos cada tag para rodar.
    if (custom) {
      const wrap = document.createElement("div");
      wrap.innerHTML = custom;
      wrap.childNodes.forEach(node => {
        if (node instanceof HTMLScriptElement) {
          const sc = document.createElement("script");
          for (const attr of Array.from(node.attributes)) sc.setAttribute(attr.name, attr.value);
          sc.text = node.textContent || "";
          sc.setAttribute("data-ao-analytics", "custom");
          head.appendChild(sc);
        } else if (node.nodeType === 1 && node instanceof Element) {
          node.setAttribute("data-ao-analytics", "custom");
          head.appendChild(node.cloneNode(true));
        }
      });
    }
  } catch (e) {
    console.warn("applyAnalytics falhou:", e);
  }
}

// Google Analytics POR POST (configurado no editor do admin).
// Dispara de forma invisível apenas na página pública do post correspondente.
// Aceita: ID GA4 (G-XXXX), Google Ads (AW-XXXX), GTM (GTM-XXXX), ID legado (UA-XXXX)
// ou um snippet <script> completo. Também extrai o ID caso o cliente cole uma URL/
// link que contenha o identificador. Idempotente: limpa a injeção anterior antes de
// reaplicar, e é removida ao sair do post (ver BlogPostPage).
export function applyPostAnalytics(tag: string | null | undefined): void {
  try {
    if (typeof document === "undefined") return;
    // Remove qualquer injeção de post anterior (não toca no analytics global).
    document.querySelectorAll("[data-ao-post-analytics]").forEach(n => n.remove());

    const raw = (tag || "").trim();
    if (!raw) return;
    const head = document.head;

    // 1) Snippet HTML completo colado pelo cliente (contém tags).
    if (/<[a-z]/i.test(raw)) {
      const wrap = document.createElement("div");
      wrap.innerHTML = raw;
      Array.from(wrap.childNodes).forEach(node => {
        if (node instanceof HTMLScriptElement) {
          const sc = document.createElement("script");
          for (const attr of Array.from(node.attributes)) sc.setAttribute(attr.name, attr.value);
          sc.text = node.textContent || "";
          sc.setAttribute("data-ao-post-analytics", "custom");
          head.appendChild(sc);
        } else if (node.nodeType === 1 && node instanceof Element) {
          node.setAttribute("data-ao-post-analytics", "custom");
          head.appendChild(node.cloneNode(true));
        }
      });
      return;
    }

    // Extrai o ID de dentro de uma URL/link, se for o caso.
    const idMatch = raw.match(/(G-[A-Z0-9]+|GTM-[A-Z0-9]+|AW-[A-Z0-9]+|UA-[0-9]+-[0-9]+)/i);
    const id = (idMatch ? idMatch[1] : raw).trim();

    // 2) Google Tag Manager.
    if (/^GTM-[A-Z0-9]+$/i.test(id)) {
      const s = document.createElement("script");
      s.setAttribute("data-ao-post-analytics", "gtm-src");
      s.text =
        "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});" +
        "var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';" +
        "j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;" +
        "f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer'," + JSON.stringify(id) + ");";
      head.appendChild(s);
      return;
    }

    // 3) gtag.js — GA4 (G-), Google Ads (AW-) ou GA legado (UA-).
    if (/^(G|AW|UA)-/i.test(id)) {
      const loader = document.createElement("script");
      loader.async = true;
      loader.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
      loader.setAttribute("data-ao-post-analytics", "gtag-src");
      head.appendChild(loader);

      const initScript = document.createElement("script");
      initScript.setAttribute("data-ao-post-analytics", "gtag-init");
      initScript.text =
        "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}" +
        "gtag('js',new Date());gtag('config'," + JSON.stringify(id) + ");";
      head.appendChild(initScript);
      return;
    }

    // Não reconhecido: não injeta nada (evita colar conteúdo inválido no <head>).
    console.warn("[post-analytics] Tag não reconhecida — use um ID G-/GTM-/AW-/UA- ou um snippet <script>.");
  } catch (e) {
    console.warn("applyPostAnalytics falhou:", e);
  }
}
