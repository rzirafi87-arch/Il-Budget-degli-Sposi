import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { securityHeaders } from "./src/config/securityHeaders";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Next.js 16 (App Router):
// - Remove deprecated i18n config in next.config (use app/[locale] + middleware instead)
// - Remove boolean experimental.serverActions (no longer supported)
const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Configurazione per immagini esterne
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: securityHeaders({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      }),
    }];
  },
  async redirects() {
    return [
      {
        source: "/:locale(it|en|es|fr|de)/spese",
        destination: "/:locale/contabilita",
        permanent: true,
      },
      {
        source: "/spese",
        destination: "/contabilita",
        permanent: true,
      },
      {
        source: "/entrate",
        destination: "/contabilita",
        permanent: true,
      },
      {
        source: "/formazione-tavoli",
        destination: "/invitati",
        permanent: true,
      },
      {
        source: "/esplora-fornitori",
        destination: "/fornitori",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
