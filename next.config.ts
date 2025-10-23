import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev HMR/assets requests from 127.0.0.1 and localhost to silence the warning
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
