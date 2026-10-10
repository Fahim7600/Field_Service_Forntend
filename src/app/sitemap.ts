import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const rawBase =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const baseUrl = rawBase.replace(/\/+$/, "");

  const routes = ["", "/services", "/pricing", "/about", "/contact"];
  const now = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/services" ? 0.9 : 0.8,
  }));
}
