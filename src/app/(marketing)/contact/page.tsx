import {
  ArrowRight,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/contact-form";
import { buttonVariants } from "@/components/ui/button";
import { FAQ_ITEMS } from "@/constants/faq";
import { getContactEntries, siteConfig } from "@/constants/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Field Service operations and dispatch team. Send questions about service requests, invoices, or technician assignments.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | Field Service",
    description:
      "Get in touch with our operations and dispatch team. We are here to help with bookings, invoices, and technician scheduling.",
    url: "/contact",
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Contact Field Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Field Service",
    description:
      "Get in touch with our operations and dispatch team. We are here to help with bookings, invoices, and technician scheduling.",
    images: ["/opengraph-image"],
  },
};

const QUICK_FAQ_IDS = [
  "how-to-book",
  "review-turnaround",
  "how-to-pay",
  "premium-benefits",
];

export default function ContactPage() {
  const contactEntries = getContactEntries();
  const recipientEmail = siteConfig.contact.email;

  const quickFaqItems = FAQ_ITEMS.filter((item) =>
    QUICK_FAQ_IDS.includes(item.id),
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section
        aria-labelledby="contact-heading"
        className="py-16 sm:py-20 bg-gradient-to-b from-charcoal-900 to-charcoal-950 text-white border-b border-charcoal-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="max-w-3xl">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-400 mb-2">
              Dispatch & Operations
            </p>
            <h1
              id="contact-heading"
              className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white"
            >
              Contact us
            </h1>
            <p className="text-base sm:text-lg text-ash mt-4 leading-relaxed">
              Have questions regarding our service disciplines, dispatch
              reviews, or invoice billing? Reach out to our team directly.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content: Details + Form */}
      <section
        aria-labelledby="contact-form-heading"
        className="py-16 sm:py-24 bg-background"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="contact-form-heading" className="sr-only">
            Contact Channels and Message Form
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-xs space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Direct Contact Channels
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Verified operational touchpoints for customers and property
                    managers.
                  </p>
                </div>

                {contactEntries.length > 0 ? (
                  <ul className="space-y-5 border-t border-border pt-6">
                    {contactEntries.map((entry) => {
                      let Icon = Mail;
                      if (entry.type === "phone") Icon = Phone;
                      if (entry.type === "address") Icon = MapPin;
                      if (entry.type === "hours") Icon = Clock;

                      return (
                        <li
                          key={entry.label}
                          className="flex items-start gap-3.5"
                        >
                          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {entry.label}
                            </span>
                            <div>
                              {entry.href ? (
                                <a
                                  href={entry.href}
                                  className="text-sm sm:text-base font-medium text-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                >
                                  {entry.value}
                                </a>
                              ) : (
                                <p className="text-sm sm:text-base font-medium text-foreground">
                                  {entry.value}
                                </p>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="border-t border-border pt-6 space-y-4">
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Create an account to reach our team from your dashboard.
                    </p>
                    <Link
                      href="/register"
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "w-full justify-center font-semibold",
                      )}
                    >
                      Register an account
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Mailto Form */}
            <div className="lg:col-span-7">
              {recipientEmail ? (
                <ContactForm recipientEmail={recipientEmail} />
              ) : (
                <div className="p-8 rounded-2xl border border-border bg-card shadow-xs text-center space-y-4">
                  <h3 className="text-lg font-bold text-foreground">
                    Online Inquiries
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Direct public email inquiries are currently disabled. Please
                    create a free account to contact support and submit service
                    requests directly from your portal.
                  </p>
                  <Link
                    href="/register"
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "inline-flex font-semibold",
                    )}
                  >
                    Create an account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Answers Section */}
      <section
        aria-labelledby="quick-answers-heading"
        className="py-16 sm:py-20 bg-panel border-t border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Self Service
              </p>
              <h2
                id="quick-answers-heading"
                className="text-2xl sm:text-3xl font-bold text-foreground mt-1"
              >
                Quick Answers
              </h2>
            </div>
            <Link
              href="/pricing#faq"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "self-start sm:self-auto",
              )}
            >
              See all FAQ questions
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickFaqItems.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-2.5"
              >
                <div className="flex items-center gap-2 text-foreground font-semibold text-base">
                  <HelpCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <h3>{item.question}</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
