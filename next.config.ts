import type { NextConfig } from "next";

function apiHostname() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return null;
  try {
    return new URL(base).hostname;
  } catch {
    return null;
  }
}

const host = apiHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.renhealth.se" },
      { protocol: "https", hostname: "renhealth.backendpro.site" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      ...(host
        ? ([
            { protocol: "https", hostname: host },
            { protocol: "http", hostname: host },
          ] as const)
        : []),
    ],
  },
};

export default nextConfig;
