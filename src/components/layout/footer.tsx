import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { getContactEntries, siteConfig } from "@/constants/site";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const contactEntries = getContactEntries();

  const exploreLinks = [
    { title: "Services", href: "/services" },
    { title: "Pricing", href: "/pricing" },
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" },
  ];

  const accountLinks = [
    { title: "Login", href: "/login" },
    { title: "Register", href: "/register" },
  ];

  return (
    <footer className="bg-[#111827] text-[#CBD5E1] border-t border-[#1F2937]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* ONE row on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {/* Brand block (left) */}
          <div className="space-y-3">
            <Logo variant="light" />
            <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-xs">
              {siteConfig.tagline}
            </p>
          </div>

          {/* Explore links */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">
              Explore
            </h3>
            <ul className="space-y-1.5 text-sm">
              {exploreLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[#E2E8F0] hover:text-[#FBBF24] transition-colors focus-visible:outline-hidden focus-visible:text-[#FBBF24] focus-visible:underline"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">
              Account
            </h3>
            <ul className="space-y-1.5 text-sm">
              {accountLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[#E2E8F0] hover:text-[#FBBF24] transition-colors focus-visible:outline-hidden focus-visible:text-[#FBBF24] focus-visible:underline"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact block (right) */}
          {contactEntries.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">
                Contact
              </h3>
              <ul className="space-y-2 text-sm text-[#E2E8F0]">
                {contactEntries.map((entry) => (
                  <li key={entry.label} className="flex items-center gap-2">
                    {entry.type === "email" && (
                      <Mail
                        className="size-4 shrink-0 text-[#CBD5E1]"
                        aria-hidden="true"
                      />
                    )}
                    {entry.type === "phone" && (
                      <Phone
                        className="size-4 shrink-0 text-[#CBD5E1]"
                        aria-hidden="true"
                      />
                    )}
                    {entry.type === "address" && (
                      <MapPin
                        className="size-4 shrink-0 text-[#CBD5E1]"
                        aria-hidden="true"
                      />
                    )}
                    {entry.type === "hours" && (
                      <Clock
                        className="size-4 shrink-0 text-[#CBD5E1]"
                        aria-hidden="true"
                      />
                    )}
                    {entry.href ? (
                      <a
                        href={entry.href}
                        className="text-[#E2E8F0] hover:text-[#FBBF24] transition-colors truncate focus-visible:outline-hidden focus-visible:text-[#FBBF24]"
                      >
                        {entry.value}
                      </a>
                    ) : (
                      <span className="truncate">{entry.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-4 border-t border-[#1F2937] flex flex-row items-center justify-between gap-3 text-xs text-[#CBD5E1]">
          <p>© {currentYear} Field Service. All rights reserved.</p>
          <div className="flex items-center gap-2.5">
            <span className="text-[#374151]" aria-hidden="true">
              |
            </span>
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#CBD5E1] hover:text-[#FBBF24] transition-colors underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:text-[#FBBF24]"
            >
              Photos from Unsplash
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
