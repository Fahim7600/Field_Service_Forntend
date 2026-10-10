import { CalendarCheck, FileCheck, History, ShieldCheck } from "lucide-react";

const PRINCIPLES = [
  {
    title: "Transparency",
    icon: History,
    description:
      "Every status transition, technician note, and schedule adjustment is recorded in an immutable history log visible to customers and dispatchers.",
  },
  {
    title: "Fair Scheduling",
    icon: CalendarCheck,
    description:
      "A technician cannot be double booked. Scheduling enforces shift boundaries, travel windows, and matching qualification skill sets.",
  },
  {
    title: "Secure Payments",
    icon: ShieldCheck,
    description:
      "Payments are processed directly through Stripe Checkout and confirmed by cryptographic webhooks. Payment card details are never stored on our servers.",
  },
  {
    title: "Accountability",
    icon: FileCheck,
    description:
      "Technicians file structured digital service reports upon job completion, backed by verified customer ratings and an administrative audit trail.",
  },
];

export function PrinciplesSection() {
  return (
    <section
      aria-labelledby="principles-heading"
      className="py-16 sm:py-24 bg-panel border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#C2410C]">
            Core Values
          </p>
          <h2
            id="principles-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mt-2"
          >
            How the Platform Operates
          </h2>
          <p className="text-sm sm:text-base text-[#334155] mt-3">
            Four foundational operational principles guide every workflow from
            dispatching to invoice approval.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRINCIPLES.map((principle) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.title}
                className="flex flex-col p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                  {principle.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                  {principle.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
