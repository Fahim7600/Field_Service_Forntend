import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main id="main-content" className="min-h-[calc(100vh-4rem-260px)] flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
