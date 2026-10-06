import { SearchX } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto size-20 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-600 shadow-xs">
          <SearchX className="size-10" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold tracking-widest uppercase text-brand-600 bg-brand-500/10 px-3 py-1 rounded-full">
            404 Error
          </span>
          <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight sm:text-4xl">
            Page not found
          </h1>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            Sorry, we couldn’t find the page you’re looking for. It might have
            been moved, renamed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full sm:w-auto",
            )}
          >
            Back to home
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full sm:w-auto",
            )}
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
