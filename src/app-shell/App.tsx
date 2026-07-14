"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { AdminShell, DashboardPage, LoginPage } from "@/features/admin";
import {
  BannersPage,
  CertificationsAdminPage,
  IdentityPage,
  PartnersPage,
  PostEditorPage,
  PostsListPage,
  SettingsPage,
} from "@/features/admin/pages";
import { NewsletterPage } from "@/features/admin/newsletter";
import { Footer, Header, ScrollTop, WhatsAppFloat } from "@/features/public";
import { BlogListPage, BlogPostPage, CertificationsPage, HomePage } from "@/features/public/pages";
import { UnsubscribePage } from "@/features/unsubscribe/UnsubscribePage";
import { api, init } from "@/lib/api";
import { hydrate } from "@/lib/storage";
import { applyAnalytics } from "@/lib/analytics";
import { applyFavicon } from "@/lib/utils";
import { LanguageProvider, useLang } from "@/lib/i18n";
import { toEnBanners, toEnCerts, toEnPartners, toEnSettings } from "@/lib/content-en";
import { fetchPublicPosts } from "@/lib/posts-client";
import type { Post, Session } from "@/lib/types";
import { useHashRoute } from "./router";

function App() {
  const [route, navigate] = useHashRoute();
  const { lang } = useLang();
  const toast = useToast();
  const [session, setSession] = React.useState<Session | null>(() => api.getSession());
  const [identity, setIdentity] = React.useState(() => api.getIdentity());
  const [settings, setSettings] = React.useState(() => api.getSettings());
  // Notícias agora vêm do servidor (API pública), não mais do localStorage — assim
  // o conteúdo criado no admin aparece para TODOS os visitantes.
  const [posts, setPosts] = React.useState<Post[]>([]);
  const loadPosts = React.useCallback(() => { fetchPublicPosts().then(setPosts).catch(() => {}); }, []);
  const [banners, setBanners] = React.useState(() => api.getBanners());
  const [partners, setPartners] = React.useState(() => api.getPartners());
  const [certs, setCerts] = React.useState(() => api.getCertifications());
  // Gate the first paint until we're on the client. The server renders with empty
  // localStorage-backed data while the client hydrates with seeded data, so without
  // this gate the two trees diverge (e.g. Hero <img> vs StripedPlaceholder) and React
  // throws a hydration mismatch. Rendering nothing on both server and first client
  // render keeps them identical; real content appears right after mount.
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      // Carrega o conteúdo do servidor (banners, parceiros, settings, etc.) para o
      // cache ANTES da primeira pintura, para todos verem o conteúdo real.
      await hydrate();
      init();
      if (!alive) return;
      setSession(api.getSession());
      setIdentity(api.getIdentity());
      setSettings(api.getSettings());
      loadPosts();
      setBanners(api.getBanners());
      setPartners(api.getPartners());
      setCerts(api.getCertifications());
      setMounted(true);
    })();
    return () => { alive = false; };
  }, [loadPosts]);

  // Avisa quando uma gravação no servidor falha (write-through do storage).
  React.useEffect(() => {
    const onErr = () => toast("Falha ao salvar no servidor. Verifique a conexão e tente novamente.", "error");
    window.addEventListener("persist-error", onErr);
    return () => window.removeEventListener("persist-error", onErr);
  }, [toast]);

  // Subscribe to data changes (cross-component invalidation)
  React.useEffect(() => {
    const reloadAll = () => {
      setIdentity(api.getIdentity());
      setSettings(api.getSettings());
      loadPosts();
      setBanners(api.getBanners());
      setPartners(api.getPartners());
      setCerts(api.getCertifications());
    };
    const onStorage = () => reloadAll();
    window.addEventListener("storage", onStorage);
    window.addEventListener("identity-changed", reloadAll);
    window.addEventListener("settings-changed", reloadAll);
    window.addEventListener("data-changed", reloadAll);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("identity-changed", reloadAll);
      window.removeEventListener("settings-changed", reloadAll);
      window.removeEventListener("data-changed", reloadAll);
    };
  }, []);

  // Reload data each time route changes (localStorage-backed data). Os posts vêm
  // do servidor e são recarregados no mount e no evento "data-changed".
  React.useEffect(() => {
    setBanners(api.getBanners());
    setPartners(api.getPartners());
    setSettings(api.getSettings());
    setIdentity(api.getIdentity());
    setCerts(api.getCertifications());
  }, [route]);

  // Apply favicon initially
  React.useEffect(() => { applyFavicon(identity); }, [identity.faviconCustom]);

  // ----- Route handling -----
  const isAdmin = route.startsWith("/ac-admin");
  const isLogin = route === "/login";

  // Tags de rastreamento (Google Analytics / GTM / snippet da agência).
  // Não rastreamos navegação dentro do painel admin nem na tela de login.
  React.useEffect(() => {
    applyAnalytics(settings, { disable: isAdmin || isLogin });
  }, [settings.analytics, isAdmin, isLogin]);

  // Don't render the data-dependent tree until after hydration (see `mounted` above).
  if (!mounted) return null;

  // Admin gate
  if ((isAdmin && !session) || isLogin) {
    return <LoginPage onLogin={(s) => { setSession(s); navigate("/ac-admin"); }} navigate={navigate} />;
  }

  if (isAdmin && session) {
    const onLogout = () => { api.logout(); setSession(null); navigate("/"); };
    let content: React.ReactNode;
    if (route === "/ac-admin") {
      content = <DashboardPage navigate={navigate} />;
    } else if (route === "/ac-admin/posts") {
      content = <PostsListPage navigate={navigate} />;
    } else if (route === "/ac-admin/posts/new") {
      content = <PostEditorPage id="new" navigate={navigate} />;
    } else if (route.startsWith("/ac-admin/posts/")) {
      const id = route.split("/").pop() as string;
      content = <PostEditorPage id={id} navigate={navigate} />;
    } else if (route === "/ac-admin/banners") {
      content = <BannersPage />;
    } else if (route === "/ac-admin/identity") {
      content = <IdentityPage />;
    } else if (route === "/ac-admin/partners") {
      content = <PartnersPage />;
    } else if (route === "/ac-admin/certs") {
      content = <CertificationsAdminPage />;
    } else if (route === "/ac-admin/newsletter") {
      content = <NewsletterPage navigate={navigate} />;
    } else if (route === "/ac-admin/settings") {
      content = <SettingsPage />;
    } else {
      content = <DashboardPage navigate={navigate} />;
    }
    return <AdminShell session={session} route={route} navigate={navigate} onLogout={onLogout}>{content}</AdminShell>;
  }

  // --- Public ---
  // Em inglês, o conteúdo editorial é sobreposto pela tradução (content-en),
  // preservando dados de contato vivos. Notícias (posts) não são traduzidas.
  const enMode = lang === "en";
  const pubSettings = enMode ? toEnSettings(settings) : settings;
  const pubPartners = enMode ? toEnPartners(partners) : partners;
  const pubBanners = enMode ? toEnBanners(banners) : banners;
  const pubCerts = enMode ? toEnCerts(certs) : certs;

  let page: React.ReactNode;
  if (route === "/" || route === "") {
    page = <HomePage banners={pubBanners} posts={posts} partners={pubPartners} settings={pubSettings} navigate={navigate} />;
  } else if (route === "/blog") {
    page = <BlogListPage posts={posts} navigate={navigate} />;
  } else if (route.startsWith("/blog/")) {
    const slug = route.split("/")[2];
    page = <BlogPostPage slug={slug} posts={posts} navigate={navigate} />;
  } else if (route === "/certificacoes") {
    page = <CertificationsPage certs={pubCerts} navigate={navigate} />;
  } else if (route === "/unsubscribe") {
    page = <UnsubscribePage navigate={navigate} />;
  } else {
    page = <NotFound navigate={navigate} />;
  }

  return (
    <>
      <Header identity={identity} settings={pubSettings} route={route} navigate={navigate} />
      {page}
      <Footer settings={pubSettings} identity={identity} navigate={navigate} />
      <WhatsAppFloat settings={pubSettings} />
      <ScrollTop />
    </>
  );
}

function NotFound({ navigate }: { navigate: (p: string) => void }) {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-24 text-center">
      <h1 className="text-3xl font-extrabold text-primary">{t("notfound.title")}</h1>
      <Button className="mt-6" onClick={() => navigate("/")}><Icon name="ArrowLeft" className="w-4 h-4" /> {t("notfound.back")}</Button>
    </div>
  );
}

export default function ClientApp() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </LanguageProvider>
  );
}
