import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawBase =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const baseUrl = rawBase.replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/*",
        "/customer",
        "/customer/*",
        "/technician",
        "/technician/*",
        "/api",
        "/api/*",
        "/payment",
        "/payment/*",
        "/change-password",
        "/oauth-callback",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
