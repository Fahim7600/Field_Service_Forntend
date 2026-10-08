import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types/api";

export interface PaginationControlsProps {
  meta?: PaginationMeta | null;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export function PaginationControls({
  meta,
  onPageChange,
  className,
}: PaginationControlsProps) {
  if (!meta || meta.totalPages <= 1) {
    return null;
  }

  const { page, totalPages, total } = meta;
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border text-xs text-charcoal-600",
        className,
      )}
    >
      <p>
        Showing page{" "}
        <span className="font-semibold text-charcoal-900">{page}</span> of{" "}
        <span className="font-semibold text-charcoal-900">{totalPages}</span>
        {total !== undefined && (
          <>
            {" "}
            (<span className="font-semibold text-charcoal-900">{total}</span>{" "}
            total items)
          </>
        )}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isFirstPage}
          onClick={() => onPageChange(page - 1)}
          className="h-8 px-2.5 text-xs font-medium"
        >
          <ChevronLeft className="size-3.5 mr-1" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLastPage}
          onClick={() => onPageChange(page + 1)}
          className="h-8 px-2.5 text-xs font-medium"
        >
          Next
          <ChevronRight className="size-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
