import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact | Field Service",
  description: "Get in touch with the Field Service support and dispatch team.",
};

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
      {/* Left Column (Info) */}
      <div className="text-charcoal-900 space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            Get in touch
          </h1>
          <p className="text-charcoal-600 mt-3 text-base sm:text-lg leading-relaxed">
            Have questions about a service request, pricing, or technician
            verification? Our team is available 24/7 to help you.
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                Email
              </p>
              <a
                href="mailto:support@fieldservice.com"
                className="text-base font-semibold text-charcoal-900 hover:text-brand-600 transition-colors"
              >
                support@fieldservice.com
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                Phone
              </p>
              <a
                href="tel:+15551234567"
                className="text-base font-semibold text-charcoal-900 hover:text-brand-600 transition-colors"
              >
                +1 (555) 123-4567
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                Headquarters
              </p>
              <p className="text-base font-medium text-charcoal-800">
                100 Dispatch Way, Suite 400, Tech City
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Form) */}
      <div>
        <ContactForm />
      </div>
    </div>
  );
}
