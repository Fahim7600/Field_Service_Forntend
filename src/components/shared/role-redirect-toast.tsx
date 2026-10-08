"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function RoleRedirectToast() {
  const searchParams = useSearchParams();
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (searchParams.get("role_redirect") === "1" && !hasFiredRef.current) {
      hasFiredRef.current = true;
      toast.info("Redirected to your dashboard area");

      // Strip role_redirect from query without full page reload
      const url = new URL(window.location.href);
      url.searchParams.delete("role_redirect");
      const cleanUrl = url.pathname + (url.search ? url.search : "") + url.hash;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, [searchParams]);

  return null;
}
