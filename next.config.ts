import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

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
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
      ],
    }];
  },
  async redirects() {
    return [
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
