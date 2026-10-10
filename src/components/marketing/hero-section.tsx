import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { SafeImage } from "@/components/shared/safe-image";
import { buttonVariants } from "@/components/ui/button";
import { MARKETING_IMAGES } from "@/constants/images";
import { siteConfig } from "@/constants/site";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const heroImage = MARKETING_IMAGES.hero;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-b from-charcoal-900 via-charcoal-900 to-charcoal-950 py-16 sm:py-24 lg:py-28 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Copy and Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal-800/80 border border-charcoal-700 text-amber-400 text-xs sm:text-sm font-medium">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
              <span>{siteConfig.tagline}</span>
            </div>

            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
            >
              Reliable field technicians scheduled, dispatched, and paid online.
            </h1>

            <p className="text-base sm:text-lg text-[#E2E8F0] leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Submit your maintenance or repair request with diagnostic photos.
              Our dispatch team reviews your job, matches a qualified
              technician, and tracks work to completion with transparent Stripe
              checkout.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/customer/requests/new"
                className={cn(
                  buttonVariants({ variant: "cta", size: "lg" }),
                  "w-full sm:w-auto h-12 px-6 text-base font-semibold shadow-md",
                )}
              >
                Book a Service
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="#how-it-works"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto h-12 px-6 text-base font-medium text-[#E2E8F0] border-charcoal-700 bg-charcoal-800/50 hover:bg-charcoal-800 hover:text-white hover:border-charcoal-600",
                )}
              >
                See how it works
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-charcoal-700/80 shadow-2xl bg-charcoal-900 group">
              <div className="relative aspect-4/3 w-full">
                <SafeImage
                  src={heroImage.src}
                  alt={heroImage.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Real Benefit Overlay Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-charcoal-900/95 backdrop-blur-md border border-charcoal-700/90 rounded-xl p-4 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <p className="text-xs font-semibold text-white tracking-wide">
                      Premium Membership Benefit
                    </p>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed">
                      Premium members get priority review within 2 hours, 10%
                      off labor, and free cancellation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
