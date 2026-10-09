/**
 * Validates that a target URL is a safe, authentic Stripe Checkout or Billing URL.
 * Requires HTTPS and a hostname ending with .stripe.com (or stripe.com).
 *
 * @param url - URL string returned by backend payment initiate.
 * @returns boolean indicating whether the URL is safe to redirect to.
 */
export function isSafeCheckoutUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    return host === "stripe.com" || host.endsWith(".stripe.com");
  } catch {
    return false;
  }
}

/**
 * Safely redirects the browser window to a validated Stripe checkout URL.
 * Throws an Error if the URL is missing or fails safety verification.
 *
 * @param url - Destination Stripe checkout URL.
 */
export function redirectToCheckout(url: string): void {
  if (!isSafeCheckoutUrl(url)) {
    throw new Error("Invalid payment link");
  }

  if (typeof window !== "undefined") {
    window.location.assign(url);
  }
}
