"use client";

import * as React from "react";
import { About, Contact, Hero, IsoBand, LatestNews, Partners, Pillars, Solutions } from "@/features/public";
import type { Banner, NavigateFn, Partner, Post, Settings } from "@/lib/types";

export interface HomePageProps {
  banners: Banner[];
  posts: Post[];
  partners: Partner[];
  settings: Settings;
  navigate: NavigateFn;
}

export function HomePage({ banners, posts, partners, settings, navigate }: HomePageProps) {
  // After mount, if hash present, scroll to it.
  React.useEffect(() => {
    const hash = window.__pendingHash;
    if (hash) {
      window.__pendingHash = null;
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "instant" as ScrollBehavior });
      }, 50);
    }
  }, []);

  return (
    <>
      <Hero banners={banners} navigate={navigate} />
      <IsoBand />
      <About settings={settings} />
      <Pillars settings={settings} />
      <Solutions settings={settings} />
      <LatestNews posts={posts} navigate={navigate} />
      <Partners partners={partners} />
      <Contact settings={settings} />
    </>
  );
}
