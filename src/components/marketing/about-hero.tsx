import { SafeImage } from "@/components/shared/safe-image";
import { MARKETING_IMAGES } from "@/constants/images";

export function AboutHero() {
  const image = MARKETING_IMAGES.howItWorks;

  return (
    <section
      aria-labelledby="about-hero-heading"
      className="py-16 sm:py-24 bg-gradient-to-b from-charcoal-900 to-charcoal-950 text-white border-b border-charcoal-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-400">
              Our Mission
            </p>
            <h1
              id="about-hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
            >
              About Field Service
            </h1>
            <p className="text-base sm:text-lg text-[#E2E8F0] leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Field Service exists to provide one transparent, reliable process
              connecting people who need maintenance or repairs with skilled
              technicians — from the initial request and dispatch review to
              digital reporting and secure payment.
            </p>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-charcoal-700/80 shadow-2xl bg-charcoal-900 group">
              <div className="relative aspect-4/3 w-full">
                <SafeImage
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
