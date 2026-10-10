import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = publicEnv.appUrl;

  const routes = ["", "/services", "/pricing", "/about", "/contact"];
  const now = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/services" ? 0.9 : 0.8,
  }));
}
