import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev HMR/assets requests from 127.0.0.1 and localhost to silence the warning
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  
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
