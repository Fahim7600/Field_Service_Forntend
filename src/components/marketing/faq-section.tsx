"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/constants/faq";
import { cn } from "@/lib/utils";

export interface FaqSectionProps {
  items: FaqItem[];
  heading?: string;
  subheading?: string;
  id?: string;
  className?: string;
  type?: "single" | "multiple";
}

export function FaqSection({
  items,
  heading = "Frequently Asked Questions",
  subheading = "Clear answers about booking, scheduling, invoices, and Premium coverage.",
  id = "faq",
  className,
  type = "single",
}: FaqSectionProps) {
  if (items.length === 0) return null;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("py-16 sm:py-24 bg-background", className)}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#C2410C]">
            Common Questions
          </p>
          <h2
            id={`${id}-heading`}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mt-2"
          >
            {heading}
          </h2>
          {subheading && (
            <p className="text-sm sm:text-base text-[#334155] mt-3 max-w-2xl mx-auto">
              {subheading}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
          <Accordion type={type} collapsible className="w-full">
            {items.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-[#0F172A] hover:text-[#C2410C] transition-colors">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-[#334155] leading-relaxed pt-2">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
