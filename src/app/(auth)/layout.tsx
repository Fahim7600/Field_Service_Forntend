import type React from "react";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#0F172A] [color-scheme:light]">
      {/* Slim top branding bar with gradient line */}
      <header className="bg-card border-b border-border shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Logo />
        </div>
        <div className="gradient-line w-full" aria-hidden="true" />
      </header>

      {/* Centered Auth Viewport */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
