"use client";

import { Star } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

export interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const STAR_SIZES = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  disabled = false,
  size = "md",
  showLabel = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const starSizeClass = STAR_SIZES[size] || STAR_SIZES.md;
  const currentDisplayRating = hoverRating ?? value;

  if (readOnly || !onChange) {
    return (
      <div
        className={cn("inline-flex items-center gap-1.5", className)}
        role="img"
        aria-label={`${value} out of 5 stars`}
      >
        <div className="inline-flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((starValue) => {
            const isFilled = starValue <= value;
            return (
              <Star
                key={starValue}
                className={cn(
                  starSizeClass,
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted-foreground/30",
                )}
                aria-hidden="true"
              />
            );
          })}
        </div>
        {showLabel && value > 0 && (
          <span className="text-xs font-semibold text-foreground">
            {RATING_LABELS[value] || `${value}/5`}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex flex-col gap-1.5", className)}>
      <div
        role="radiogroup"
        aria-label="Rating, 1 to 5"
        className="inline-flex items-center gap-1"
        onMouseLeave={() => setHoverRating(null)}
      >
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= currentDisplayRating;
          const isChecked = value === starValue;

          return (
            <label
              key={starValue}
              onMouseEnter={() => !disabled && setHoverRating(starValue)}
              className={cn(
                "relative cursor-pointer rounded-sm p-0.5 transition-transform hover:scale-110 focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2",
                disabled && "cursor-not-allowed opacity-50 hover:scale-100",
              )}
            >
              <input
                type="radio"
                name="star-rating"
                value={starValue}
                checked={isChecked}
                disabled={disabled}
                onChange={() => onChange(starValue)}
                className="sr-only"
                aria-label={`${starValue} - ${RATING_LABELS[starValue] || "Star"}`}
              />
              <Star
                className={cn(
                  starSizeClass,
                  "transition-colors duration-150",
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted-foreground/30",
                )}
                aria-hidden="true"
              />
            </label>
          );
        })}
      </div>

      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground min-h-[1rem]">
          {currentDisplayRating > 0
            ? `${currentDisplayRating} — ${RATING_LABELS[currentDisplayRating]}`
            : "Select a rating (1 to 5)"}
        </span>
      )}
    </div>
  );
}
