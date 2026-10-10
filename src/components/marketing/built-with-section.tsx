interface TechItem {
  name: string;
  purpose: string;
}

const FRONTEND_STACK: TechItem[] = [
  {
    name: "Next.js 15 (App Router)",
    purpose: "Server and Client components architecture",
  },
  { name: "TypeScript", purpose: "Strict end-to-end type safety" },
  {
    name: "Tailwind CSS",
    purpose: "Atomic styling with industrial amber design tokens",
  },
  {
    name: "shadcn/ui",
    purpose: "Accessible primitive UI component foundations",
  },
  {
    name: "TanStack Query",
    purpose: "Server state synchronization and background revalidation",
  },
  {
    name: "Zustand",
    purpose: "Strict in-memory client authentication state store",
  },
  {
    name: "React Hook Form & Zod",
    purpose: "Schema-driven validation and form management",
  },
  {
    name: "Recharts",
    purpose: "Accessible data visualization and operational metrics",
  },
];

const BACKEND_STACK: TechItem[] = [
  {
    name: "Node.js & Express",
    purpose: "RESTful API service and route controllers",
  },
  {
    name: "PostgreSQL & Prisma",
    purpose: "Relational database schema and object-relational mapping",
  },
  { name: "Redis", purpose: "Fast session caching and rate-limiting" },
  {
    name: "Stripe",
    purpose: "Secure checkout sessions, invoices, and webhooks",
  },
  {
    name: "Cloudinary",
    purpose: "Diagnostic photo storage and asset delivery",
  },
];

export function BuiltWithSection() {
  return (
    <section
      aria-labelledby="built-with-heading"
      className="py-16 sm:py-24 bg-background border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Technical Architecture
          </p>
          <h2
            id="built-with-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-2"
          >
            Built With Modern Standards
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Engineered for performance, strict type safety, and real-time
            operational workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Frontend */}
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">
                Frontend Architecture
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Client & Server
              </span>
            </div>

            <dl className="space-y-4">
              {FRONTEND_STACK.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1"
                >
                  <dt className="text-xs sm:text-sm font-semibold text-foreground">
                    {item.name}
                  </dt>
                  <dd className="text-xs text-muted-foreground sm:text-right">
                    {item.purpose}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Backend */}
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">
                Backend Infrastructure
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-charcoal-800 text-ash">
                API & Database
              </span>
            </div>

            <dl className="space-y-4">
              {BACKEND_STACK.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1"
                >
                  <dt className="text-xs sm:text-sm font-semibold text-foreground">
                    {item.name}
                  </dt>
                  <dd className="text-xs text-muted-foreground sm:text-right">
                    {item.purpose}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground inline-flex items-center px-4 py-2 rounded-full bg-muted/60 border border-border">
            This is a demonstration platform. Payments run in Stripe test mode.
          </p>
        </div>
      </div>
    </section>
  );
}
