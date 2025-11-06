import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Next.js 16 (App Router):
// - Remove deprecated i18n config in next.config (use app/[locale] + middleware instead)
// - Remove boolean experimental.serverActions (no longer supported)
const nextConfig: NextConfig = {
  // Configurazione per immagini esterne
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
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
