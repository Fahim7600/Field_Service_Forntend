import { ArrowRight, Flame, Plug, Sparkles, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Services | Field Service",
  description: "Expert solutions for your home and business.",
};

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: React.ElementType;
}

const SERVICES: ServiceItem[] = [
  {
    id: "hvac-repair",
    title: "HVAC Repair",
    price: "Starting at $85/hr",
    description:
      "Complete heating, ventilation, and air conditioning maintenance and emergency repair.",
    icon: Flame,
  },
  {
    id: "plumbing",
    title: "Plumbing",
    price: "Starting at $75/hr",
    description:
      "Leak detection, pipe repairs, drain cleaning, and full fixture installations.",
    icon: Wrench,
  },
  {
    id: "electrical",
    title: "Electrical",
    price: "Starting at $90/hr",
    description:
      "Safe and certified electrical wiring, panel upgrades, and smart home installations.",
    icon: Plug,
  },
  {
    id: "appliance-repair",
    title: "Appliance Repair",
    price: "Starting at $65/hr",
    description:
      "Washing machines, ovens, refrigerators, and dishwashers fixed fast.",
    icon: Sparkles,
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <PageHeader
        title="Our Services"
        description="Expert solutions for your home and business."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-12">
        {SERVICES.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="bg-white border border-gray-200 p-6 rounded-xl flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-charcoal-900">
                    {service.title}
                  </h2>
                </div>
                <p className="text-charcoal-600 mt-3 leading-relaxed">
                  {service.description}
                </p>
                <div className="inline-flex bg-brand-50 text-brand-700 font-semibold px-3 py-1 rounded-full mt-4 w-fit text-sm">
                  {service.price}
                </div>
              </div>

              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full mt-6 h-10 font-semibold justify-center",
                )}
              >
                Book This Service
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
