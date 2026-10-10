import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DetailNotFoundProps {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function DetailNotFound({
  title = "Record Not Found",
  description = "The requested record could not be found or may have been removed.",
  backHref = "/",
  backLabel = "Go back",
  className,
}: DetailNotFoundProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-16 rounded-2xl border border-border bg-card shadow-xs max-w-xl mx-auto my-8",
        className,
      )}
    >
      <div className="size-14 rounded-full bg-muted flex items-center justify-center text-charcoal-600 mb-4 shadow-xs">
        <FileQuestion className="size-7" aria-hidden="true" />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 mb-2">
        {title}
      </h2>

      <p className="text-sm text-charcoal-600 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      <div>
        <Link
          href={backHref}
          className={cn(buttonVariants({ variant: "outline" }), "font-medium")}
        >
          <ArrowLeft className="size-4 mr-2" aria-hidden="true" />
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
