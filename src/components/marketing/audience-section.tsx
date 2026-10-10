import { CheckCircle2 } from "lucide-react";
import { AUDIENCE_POINTS } from "@/constants/marketing";

export function AudienceSection() {
  return (
    <section
      aria-labelledby="audience-heading"
      className="py-16 sm:py-24 bg-panel border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            One Unified Platform
          </p>
          <h2
            id="audience-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-2"
          >
            Built for Customers, Technicians, and Operations
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Every party involved in maintenance and repair stays connected in
            real-time with purpose-built tools and clear accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {AUDIENCE_POINTS.map((audience) => (
            <div
              key={audience.badge}
              className="flex flex-col p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs hover:border-amber-500/40 hover:shadow-md transition-all duration-200"
            >
              <div className="inline-flex self-start items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 mb-4">
                {audience.badge}
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3">
                {audience.title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {audience.description}
              </p>

              <ul className="space-y-3 mt-auto pt-4 border-t border-border">
                {audience.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
