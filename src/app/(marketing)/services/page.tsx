import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SafeImage } from "@/components/shared/safe-image";
import { buttonVariants } from "@/components/ui/button";
import { MARKETING_IMAGES } from "@/constants/images";
import { HOW_IT_WORKS, SERVICE_AREAS } from "@/constants/marketing";
import { siteConfig } from "@/constants/site";
import { formatMoney } from "@/lib/format";
import { getPublicCategories } from "@/lib/public-data";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore our full catalog of professional field services. Book certified technicians for air conditioning, plumbing, electrical, and appliance repairs.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services | Field Service",
    description:
      "Explore our full catalog of professional field services. Book certified technicians for air conditioning, plumbing, electrical, and appliance repairs.",
    url: "/services",
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Field Service Catalog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services | Field Service",
    description:
      "Explore our full catalog of professional field services. Book certified technicians for air conditioning, plumbing, electrical, and appliance repairs.",
    images: ["/opengraph-image"],
  },
};

const SERVICE_IMAGE_KEYS = [
  "acRepair",
  "plumbing",
  "electrical",
  "appliance",
] as const;

export default async function ServicesPage() {
  const { data: categories } = await getPublicCategories();

  const hasLiveCategories = categories && categories.length > 0;

  const displayServices = hasLiveCategories
    ? categories.map((cat, idx) => {
        const key =
          SERVICE_IMAGE_KEYS[idx % SERVICE_IMAGE_KEYS.length] ?? "acRepair";
        return {
          id: cat.id,
          title: cat.name,
          description:
            SERVICE_AREAS[idx % SERVICE_AREAS.length]?.description ||
            "Certified diagnostics, maintenance, and repair work carried out by verified field technicians.",
          priceCents: cat.basePriceCents,
          image: MARKETING_IMAGES[key],
          bookHref: `/customer/requests/new?category=${cat.id}`,
        };
      })
    : SERVICE_AREAS.map((area) => ({
        id: area.slug,
        title: area.title,
        description: area.description,
        priceCents: undefined,
        image: MARKETING_IMAGES[area.imageKey],
        bookHref: "/customer/requests/new",
      }));

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section
        aria-labelledby="services-header-heading"
        className="py-16 sm:py-20 bg-gradient-to-b from-charcoal-900 to-charcoal-950 text-white border-b border-charcoal-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="max-w-3xl">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-400 mb-2">
              Certified Specialists
            </p>
            <h1
              id="services-header-heading"
              className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white"
            >
              Our services
            </h1>
            <p className="text-base sm:text-lg text-[#E2E8F0] mt-4 leading-relaxed">
              Every job booked through Field Service is reviewed by our dispatch
              operations team and assigned to a qualified, background-checked
              technician.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section
        aria-labelledby="catalog-grid-heading"
        className="py-16 sm:py-24 bg-background"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="catalog-grid-heading" className="sr-only">
            Available Service Disciplines
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {displayServices.map((service) => (
              <div
                key={service.id}
                className="group flex flex-col rounded-2xl overflow-hidden bg-card border border-border shadow-xs hover:border-amber-500/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-16/10 w-full overflow-hidden bg-charcoal-900">
                  <SafeImage
                    src={service.image.src}
                    alt={service.image.alt}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-[#0F172A] group-hover:text-[#C2410C] transition-colors">
                      {service.title}
                    </h3>
                    {typeof service.priceCents === "number" &&
                      service.priceCents > 0 && (
                        <span className="text-xs font-semibold text-[#C2410C] shrink-0">
                          From {formatMoney(service.priceCents)}
                        </span>
                      )}
                  </div>

                  <p className="text-sm text-[#334155] leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-border">
                    <Link
                      href={service.bookHref}
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "w-full h-11 text-sm font-semibold justify-center",
                      )}
                    >
                      Book this service
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect Section (Compact HOW_IT_WORKS) */}
      <section
        aria-labelledby="what-to-expect-heading"
        className="py-16 sm:py-20 bg-panel border-t border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2
              id="what-to-expect-heading"
              className="text-2xl sm:text-3xl font-bold text-[#0F172A]"
            >
              What to expect when you book
            </h2>
            <p className="text-sm text-[#334155] mt-2">
              Our clear, end-to-end service cycle keeps you updated at every
              milestone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="p-5 rounded-xl bg-card border border-border shadow-xs flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-[#475569]">
                      Step {step.step}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#0F172A] mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#334155] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA Band */}
      <section
        aria-labelledby="services-cta-heading"
        className="py-16 bg-[#111827] border-t border-[#1F2937] text-white text-center"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h2
            id="services-cta-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
          >
            Need a certified technician today?
          </h2>
          <p className="text-sm sm:text-base text-[#E2E8F0] max-w-xl mx-auto">
            Book online in under 3 minutes. Attach photos and choose a time slot
            that fits your schedule.
          </p>
          <div className="pt-2">
            <Link
              href="/customer/requests/new"
              className={cn(
                buttonVariants({ variant: "cta", size: "lg" }),
                "h-12 px-8 text-base font-semibold shadow-md",
              )}
            >
              Book a Service
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
