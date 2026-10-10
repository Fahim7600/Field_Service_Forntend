import type { Metadata } from "next";
import { AudienceSection } from "@/components/marketing/audience-section";
import { FinalCtaSection } from "@/components/marketing/final-cta-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { PremiumTeaserSection } from "@/components/marketing/premium-teaser-section";
import { ServicesPreviewSection } from "@/components/marketing/services-preview-section";
import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/constants/site";
import { getPublicCategories, getPublicPlans } from "@/lib/public-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    absolute: "Field Service | On-Demand Field Service Management",
  },
  description:
    "Book certified field technicians for AC repair, plumbing, electrical, and appliance services. Real-time scheduling, verified reports, and secure online Stripe payments.",
  keywords: siteConfig.keywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Field Service | On-Demand Field Service Management",
    description:
      "Book certified field technicians for AC repair, plumbing, electrical, and appliance services with guaranteed tracking and transparent billing.",
    url: "/",
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Field Service - On-Demand Field Service Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Field Service | On-Demand Field Service Management",
    description:
      "Book certified field technicians for AC repair, plumbing, electrical, and appliance services with guaranteed tracking and transparent billing.",
    images: ["/opengraph-image"],
  },
};

export default async function HomePage() {
  const [categoriesResult, plansResult] = await Promise.all([
    getPublicCategories(),
    getPublicPlans(),
  ]);

  const organizationLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };

  if (siteConfig.contact.email) {
    organizationLd.email = siteConfig.contact.email;
  }
  if (siteConfig.contact.phone) {
    organizationLd.telephone = siteConfig.contact.phone;
  }
  if (siteConfig.contact.address) {
    organizationLd.address = siteConfig.contact.address;
  }

  return (
    <>
      <JsonLd data={organizationLd} />
      <div className="flex flex-col min-h-screen">
        <HeroSection />
        <HowItWorksSection />
        <ServicesPreviewSection categories={categoriesResult.data} />
        <AudienceSection />
        <PremiumTeaserSection plans={plansResult.data} />
        <FinalCtaSection />
      </div>
    </>
  );
}
