import type { FaqItem } from "@/constants/faq";

/**
 * Builds a Schema.org FAQPage structured data object from FaqItem array.
 * Pure server-safe function without browser or hook dependencies.
 */
export function buildFaqJsonLd(items: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
