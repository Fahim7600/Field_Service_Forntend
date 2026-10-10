import { SafeImage } from "@/components/shared/safe-image";
import { MARKETING_IMAGES } from "@/constants/images";
import { SERVICE_AREAS } from "@/constants/marketing";

export function WhatWeDoSection() {
  return (
    <section
      aria-labelledby="what-we-do-heading"
      className="py-16 sm:py-24 bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#C2410C]">
            Specialized Disciplines
          </p>
          <h2
            id="what-we-do-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mt-2"
          >
            What We Do
          </h2>
          <p className="text-sm sm:text-base text-[#334155] mt-3">
            Our platform supports the core mechanical, electrical, and plumbing
            trades required to keep properties functioning smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICE_AREAS.map((area) => {
            const image = MARKETING_IMAGES[area.imageKey];
            return (
              <div
                key={area.slug}
                className="flex flex-col rounded-xl overflow-hidden bg-card border border-border shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all duration-300"
              >
                <div className="relative aspect-16/10 w-full overflow-hidden bg-charcoal-900">
                  <SafeImage
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-base font-semibold text-[#0F172A] mb-2">
                    {area.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                    {area.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
