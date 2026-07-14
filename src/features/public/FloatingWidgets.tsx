"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { useLang } from "@/lib/i18n";
import type { Settings } from "@/lib/types";

export function WhatsAppFloat({ settings }: { settings: Settings }) {
  const { t } = useLang();
  return (
    <a href={`https://wa.me/${settings.whatsapp}?text=Ol%C3%A1%2C+vim+do+site+de+voc%C3%AAs+e+gostaria+de+solicitar+um+or%C3%A7amento`} target="_blank" rel="noreferrer"
       aria-label={t("widgets.whatsapp")}
       className="group fixed bottom-6 right-6 z-30 grid place-items-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-deep hover:scale-110 transition">
      <Icon name="wa-icon" className="w-7 h-7" />
      <span className="absolute right-16 whitespace-nowrap rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition pointer-events-none">
        {t("widgets.whatsapp")}
      </span>
    </a>
  );
}

export function ScrollTop() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 right-6 z-30 grid place-items-center w-11 h-11 rounded-full bg-primary text-white shadow-deep hover:bg-primary-700"
      aria-label="Voltar ao topo">
      <Icon name="ArrowUp" className="w-5 h-5" />
    </button>
  );
}
