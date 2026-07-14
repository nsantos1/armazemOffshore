import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Armazém Offshore — Suprimentos para Indústria Naval e Petrolífera',
  description: 'Site institucional da Armazém Offshore com blog, newsletter e painel administrativo demo.',
  icons: {
    icon: '/assets/logo-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Open+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
