import type React from "react";
import { Logo } from "@/components/shared/logo";

export default function PaymentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] dark:bg-charcoal-900">
      {/* Top branding bar */}
      <header className="bg-card border-b border-border shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Logo />
        </div>
        <div className="gradient-line w-full" aria-hidden="true" />
      </header>

      {/* Centered Payment Status Viewport */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border bg-card">
        <p>
          © {new Date().getFullYear()} Field Service Management. All
          transactions are securely encrypted via Stripe.
        </p>
      </footer>
    </div>
  );
}
