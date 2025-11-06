import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { serverActions: true },
  i18n: {
    locales: ["it", "en", "es", "fr", "de", "ar", "hi", "ja", "zh", "mx"],
    defaultLocale: "it",
  },
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

export default nextConfig;
