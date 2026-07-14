"use client";

import { Icon, LogoLockup } from "@/components/icons";
import { useLang } from "@/lib/i18n";
import type { Identity, NavigateFn, Settings } from "@/lib/types";

export interface FooterProps {
  settings: Settings;
  identity: Identity;
  navigate: NavigateFn;
}

export function Footer({ settings, identity, navigate }: FooterProps) {
  const { t } = useLang();
  return (
    <footer className="bg-primary-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          {identity.logoCustom
            ? <img src={identity.logoCustom} alt={identity.logoAlt} className="h-12 w-auto object-contain" />
            : <LogoLockup />
          }
          <p className="mt-4 text-sm text-white/70 leading-relaxed">
            {t("footer.tagline")}
          </p>
          <div className="mt-5 flex gap-2">
            {[
              { i: "Instagram", h: settings.social.instagram },
              { i: "Linkedin", h: settings.social.linkedin },
              { i: "Facebook", h: settings.social.facebook },
            ].map(s => (
              <a key={s.i} href={s.h} target="_blank" rel="noreferrer"
                 className="grid place-items-center w-9 h-9 rounded-md bg-white/5 hover:bg-accent hover:text-primary transition"
                 aria-label={s.i}><Icon name={s.i} className="w-4 h-4" /></a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[.25em] text-accent font-bold">{t("footer.navTitle")}</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="hover:text-accent">{t("footer.home")}</a></li>
            <li><a href="#quem-somos" className="hover:text-accent">{t("nav.about")}</a></li>
            <li><a href="#parceiros" className="hover:text-accent">{t("nav.partners")}</a></li>
            <li><a href="/certificacoes" onClick={(e) => { e.preventDefault(); navigate("/certificacoes"); }} className="hover:text-accent">{t("nav.certs")}</a></li>
            <li><a href="/blog" onClick={(e) => { e.preventDefault(); navigate("/blog"); }} className="hover:text-accent">{t("nav.news")}</a></li>
            <li><a href="#contato" className="hover:text-accent">{t("nav.contact")}</a></li>
            <li><a href={settings.storeUrl} target="_blank" rel="noreferrer" className="text-accent font-bold">{t("nav.store")} ↗</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[.25em] text-accent font-bold">{t("footer.contactTitle")}</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li className="flex gap-2 items-start"><Icon name="Phone" className="w-4 h-4 mt-0.5 text-accent" /> {settings.phone}</li>
            <li className="flex gap-2 items-start"><Icon name="Mail" className="w-4 h-4 mt-0.5 text-accent" /> {settings.email}</li>
            <li className="flex gap-2 items-start"><Icon name="wa-icon" className="w-4 h-4 mt-0.5 text-accent" /> WhatsApp: +55 22 2763-4600</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[.25em] text-accent font-bold">{t("footer.basesTitle")}</h4>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            {settings.bases.map((b, i) => (
              <li key={i}>
                <div className="font-bold text-white">{b.city}</div>
                <div className="text-xs text-white/60">{b.address}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/60">
          <p>{t("footer.rights")}</p>
          <p>{t("footer.developedBy")} Nicolas Santos - <span className="text-accent font-mono"> <a href="https://devnsantos.com/"> @dev_nicolas </a></span></p>
        </div>
      </div>
    </footer>
  );
}
