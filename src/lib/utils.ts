// Helpers genéricos de formatação e manipulação de arquivos, usados em todo o app.
import type { Identity } from "./types";

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function fmtDateShort(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function slugify(s: string | null | undefined): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// Aplica o favicon customizado (se houver) ao <link id="dynamic-favicon"> declarado no <head>.
export function applyFavicon(identity: Identity): void {
  const link = document.getElementById("dynamic-favicon") as HTMLLinkElement | null;
  if (!link) return;
  if (identity.faviconCustom) link.href = identity.faviconCustom;
  // else keep default
}
