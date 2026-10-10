interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Safely renders a JSON-LD script tag with escaped characters to prevent XSS.
 */
export function JsonLd({ data }: JsonLdProps) {
  const jsonString = JSON.stringify(data).replace(/</g, "\\u003c");

  return <script type="application/ld+json">{jsonString}</script>;
}
