import type { NextConfig } from "next";

const rawBackendUrl = process.env.BACKEND_URL?.trim();
const isVercelProduction = process.env.VERCEL_ENV === "production";

if (!rawBackendUrl && isVercelProduction) {
  throw new Error("BACKEND_URL must be set in Vercel environment variables");
}

if (!rawBackendUrl) {
  console.warn("BACKEND_URL is not set; skipping /api/v1 proxy rewrites.");
}

const backendUrl = rawBackendUrl ? rawBackendUrl.replace(/\/+$/, "") : "";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Content-Security-Policy",
        value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
      },
    ];

    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains",
      });
    }

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    if (!backendUrl) {
      return {
        beforeFiles: [],
        afterFiles: [],
        fallback: [],
      };
    }

    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: "/api/v1/:path*",
          destination: `${backendUrl}/api/v1/:path*`,
        },
      ],
      fallback: [],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
