import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SafeImage } from "@/components/shared/safe-image";
import { buttonVariants } from "@/components/ui/button";
import { MARKETING_IMAGES } from "@/constants/images";
import { SERVICE_AREAS } from "@/constants/marketing";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ServiceCategory } from "@/types/api";

interface ServicesPreviewSectionProps {
  categories?: ServiceCategory[];
}

const SERVICE_IMAGE_KEYS = [
  "acRepair",
  "plumbing",
  "electrical",
  "appliance",
] as const;

export function ServicesPreviewSection({
  categories = [],
}: ServicesPreviewSectionProps) {
  const hasLiveCategories = categories.length > 0;
  const displayItems = hasLiveCategories
    ? categories.slice(0, 4).map((cat, idx) => {
        const key =
          SERVICE_IMAGE_KEYS[idx % SERVICE_IMAGE_KEYS.length] ?? "acRepair";
        return {
          id: cat.id,
          title: cat.name,
          description:
            SERVICE_AREAS[idx % SERVICE_AREAS.length]?.description ||
            "Professional diagnostic, maintenance, and repair services provided by verified technicians.",
          priceCents: cat.basePriceCents,
          image: MARKETING_IMAGES[key],
          href: `/services`,
        };
      })
    : SERVICE_AREAS.slice(0, 4).map((area) => ({
        id: area.slug,
        title: area.title,
        description: area.description,
        priceCents: undefined,
        image: MARKETING_IMAGES[area.imageKey],
        href: "/services",
      }));

  return (
    <section
      aria-labelledby="services-preview-heading"
      className="py-16 sm:py-24 bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#C2410C]">
              Expert Coverage
            </p>
            <h2
              id="services-preview-heading"
              className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mt-2"
            >
              Essential Field Services
            </h2>
            <p className="text-sm sm:text-base text-[#334155] mt-3">
              Book skilled specialists across our core repair disciplines with
              transparent pricing and verified reporting.
            </p>
          </div>

          <Link
            href="/services"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "self-start md:self-auto",
            )}
          >
            View all services
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col rounded-xl overflow-hidden bg-card border border-border shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-16/10 w-full overflow-hidden bg-charcoal-900">
                <SafeImage
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold text-[#0F172A] group-hover:text-[#C2410C] transition-colors">
                    {item.title}
                  </h3>
                  {typeof item.priceCents === "number" &&
                    item.priceCents > 0 && (
                      <span className="text-xs font-semibold text-[#C2410C] shrink-0">
                        From {formatMoney(item.priceCents)}
                      </span>
                    )}
                </div>

                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed line-clamp-3 mb-4">
                  {item.description}
                </p>

                <div className="mt-auto pt-2">
                  <Link
                    href={item.href}
                    className="inline-flex items-center text-xs font-semibold text-[#C2410C] hover:underline"
                  >
                    Learn more
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
