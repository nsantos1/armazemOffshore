import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @libsql/client tem partes nativas — não pode ser empacotado pelo bundler.
  serverExternalPackages: ["@libsql/client", "libsql"],
  // O app é uma SPA com roteamento por hash (#/...). URLs "limpas" de caminho não
  // existem no servidor e cairiam em 404. Redirecionamos a entrada do painel para
  // a versão com hash, para que /ac-admin funcione direto no navegador.
  async redirects() {
    return [
      { source: "/ac-admin", destination: "/#/ac-admin", permanent: false },
      { source: "/ac-admin/:path*", destination: "/#/ac-admin", permanent: false },
    ];
  },
};

export default nextConfig;
