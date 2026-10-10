import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = publicEnv.appUrl;

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
