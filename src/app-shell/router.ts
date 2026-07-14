"use client";

// Roteador baseado em hash. URLs ficam assim: #/, #/blog, #/blog/slug, #/ac-admin, #/ac-admin/posts/new
// TODO: ao migrar para SSR/SEO real, substituir por App Router (rotas de arquivo do Next.js).
import * as React from "react";
import type { NavigateFn, Route } from "@/lib/types";

export function normalize(hash: string): Route {
  if (!hash || hash === "#") return "/";
  let r = hash.replace(/^#/, "");
  if (!r.startsWith("/")) r = "/" + r;
  return r;
}

export const navigate: NavigateFn = (path) => {
  // Allow callers to pass /, /blog, /admin/posts/new, or anchors like /#solucoes
  let target = path;
  if (target.includes("#") && !target.startsWith("#/")) {
    // /#contato style -> route is "/", then scroll to anchor
    const [p, h] = target.split("#");
    window.__pendingHash = "#" + h;
    target = p || "/";
  }
  if (window.location.hash.replace(/^#/, "") === target) {
    // same route — trigger reflow for anchor scroll
    if (window.__pendingHash) {
      const h = window.__pendingHash; window.__pendingHash = null;
      setTimeout(() => { document.querySelector(h)?.scrollIntoView({ behavior: "smooth" }); }, 30);
    }
  } else {
    window.location.hash = "#" + target;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }
};

export function useHashRoute(): [Route, NavigateFn] {
  const [route, setRoute] = React.useState<Route>(() => typeof window === "undefined" ? "/" : normalize(window.location.hash));
  React.useEffect(() => {
    const onHash = () => setRoute(normalize(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return [route, navigate];
}
