"use client";

import { useEffect } from "react";
import { publicEnv } from "@/lib/env";

const WARMUP_KEY = "fs_backend_warmup_ts";
const TEN_MINUTES_MS = 10 * 60 * 1000;

export function BackendWarmup() {
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const lastWarmupStr = window.sessionStorage.getItem(WARMUP_KEY);
      const now = Date.now();

      if (lastWarmupStr) {
        const lastWarmup = Number.parseInt(lastWarmupStr, 10);
        if (!Number.isNaN(lastWarmup) && now - lastWarmup < TEN_MINUTES_MS) {
          return;
        }
      }

      window.sessionStorage.setItem(WARMUP_KEY, String(now));

      const baseURL = publicEnv.apiBase;
      void fetch(`${baseURL}/health`, {
        cache: "no-store",
      }).catch(() => {
        // Ignore warm-up errors
      });
    } catch {
      // Ignore sessionStorage or fetch dispatch errors
    }
  }, []);

  return null;
}
