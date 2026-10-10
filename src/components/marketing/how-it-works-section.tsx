import { HOW_IT_WORKS } from "@/constants/marketing";

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="py-16 sm:py-24 bg-panel border-y border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#C2410C]">
            Transparent Workflow
          </p>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mt-2"
          >
            How Field Service Works
          </h2>
          <p className="text-sm sm:text-base text-[#334155] mt-3">
            From initial problem submission to completed work and digital
            invoice approval — here is what happens at every stage.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {HOW_IT_WORKS.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.step}
                className="relative flex flex-col p-6 rounded-xl bg-card border border-border shadow-xs hover:border-amber-500/50 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-[#475569] bg-muted px-2 py-0.5 rounded-full">
                    Step {item.step}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[#0F172A] mb-1">
                  {item.title}
                </h3>
                <p className="text-xs font-medium text-[#C2410C] mb-2">
                  {item.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed mt-auto">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
