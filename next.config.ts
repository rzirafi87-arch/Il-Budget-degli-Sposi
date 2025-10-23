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
};

export default nextConfig;
