import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { footerLinks, getContactEntries, siteConfig } from "@/constants/site";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const contactEntries = getContactEntries();

  return (
    <footer className="bg-charcoal-900 text-ash border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Description (Column 1) */}
          <div className="space-y-4 md:col-span-1">
            <Logo variant="light" />
            <p className="text-sm text-ash leading-relaxed max-w-xs">
              {siteConfig.shortDescription}
            </p>
          </div>

          {/* Link Columns & Optional Contact */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:col-span-3 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  {section.title}
                </h3>
                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-ash hover:text-brand-500 transition-colors focus-visible:outline-hidden focus-visible:text-brand-500"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {contactEntries.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Contact
                </h3>
                <ul className="space-y-2.5 text-sm text-ash">
                  {contactEntries.map((entry) => (
                    <li key={entry.label} className="flex flex-col">
                      <span className="text-xs text-ash/60">{entry.label}</span>
                      {entry.href ? (
                        <a
                          href={entry.href}
                          className="hover:text-brand-500 transition-colors"
                        >
                          {entry.value}
                        </a>
                      ) : (
                        <span>{entry.value}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-charcoal-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ash">
          <p>© {currentYear} Field Service. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ash/60 hover:text-ash transition-colors underline-offset-4 hover:underline"
            >
              Photos from Unsplash
            </a>
            <span className="text-charcoal-700">|</span>
            <p className="text-ash/80">
              Enterprise Field Service Management Platform
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
