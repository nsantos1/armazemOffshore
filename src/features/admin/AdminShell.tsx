"use client";

import * as React from "react";
import { Icon, LogoIcon, LogoLockup } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import type { NavigateFn, Route, Session } from "@/lib/types";

export interface AdminShellProps {
  session: Session;
  route: Route;
  navigate: NavigateFn;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: "dashboard", icon: "LayoutDashboard", label: "Dashboard", path: "/ac-admin" },
  { id: "posts", icon: "Newspaper", label: "Notícias", path: "/ac-admin/posts" },
  { id: "banners", icon: "Megaphone", label: "Banners", path: "/ac-admin/banners" },
  { id: "identity", icon: "Palette", label: "Identidade visual", path: "/ac-admin/identity" },
  { id: "partners", icon: "Users", label: "Parceiros", path: "/ac-admin/partners" },
  { id: "certs", icon: "BadgeCheck", label: "Certificações", path: "/ac-admin/certs" },
  { id: "newsletter", icon: "Mail", label: "Newsletter", path: "/ac-admin/newsletter" },
  { id: "settings", icon: "Settings", label: "Configurações", path: "/ac-admin/settings" },
];

export function AdminShell({ session, route, navigate, onLogout, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const currentLabel = NAV_ITEMS.find(i => route === i.path || (i.path !== "/ac-admin" && route.startsWith(i.path)))?.label || "Painel";

  return (
    <div className="min-h-screen bg-bg-soft text-primary flex">
      {/* Sidebar */}
      <aside className={`${mobileOpen ? "fixed inset-y-0 left-0 z-40" : "hidden"} lg:flex lg:sticky lg:top-0 lg:h-screen flex-col bg-primary text-white transition-all ${collapsed ? "w-20" : "w-64"}`}>
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          {!collapsed ? <LogoLockup /> : <LogoIcon className="w-9 h-9 mx-auto" />}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(it => {
            const active = route === it.path || (it.path !== "/ac-admin" && route.startsWith(it.path));
            return (
              <button key={it.id} onClick={() => { navigate(it.path); setMobileOpen(false); }}
                className={`group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${active ? "bg-accent text-primary font-bold" : "text-white/85 hover:bg-white/10"}`}
                title={collapsed ? it.label : ""}
              >
                <Icon name={it.icon} className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{it.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-3 border-t border-white/10 space-y-1">
          <button onClick={() => navigate("/")} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/10">
            <Icon name="ExternalLink" className="w-4 h-4" />
            {!collapsed && <span>Ver site</span>}
          </button>
          <button onClick={() => setCollapsed(c => !c)} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/10">
            <Icon name={collapsed ? "ChevronsRight" : "ChevronsLeft"} className="w-4 h-4" />
            {!collapsed && <span>Recolher</span>}
          </button>
        </div>
      </aside>
      {/* Mobile backdrop */}
      {mobileOpen && <div className="fixed inset-0 z-30 bg-primary-900/60 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 -ml-2" onClick={() => setMobileOpen(true)} aria-label="Menu"><Icon name="Menu" className="w-6 h-6" /></button>
              <div>
                <div className="text-xs text-text-muted">Painel administrativo</div>
                <h1 className="font-extrabold text-primary leading-tight">{currentLabel}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="hidden sm:grid place-items-center w-9 h-9 rounded-md text-text-muted hover:bg-bg-soft" aria-label="Notificações">
                <Icon name="Bell" className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-3 pr-2">
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">{session.name}</div>
                  <div className="text-xs text-text-muted">{session.email}</div>
                </div>
                <div className="grid place-items-center w-9 h-9 rounded-full bg-primary text-accent font-extrabold">A</div>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout}><Icon name="LogOut" className="w-4 h-4" />Sair</Button>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 py-6 nice-scroll overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
