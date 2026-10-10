"use client";

import { Wrench } from "lucide-react";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface SafeImageProps
  extends Omit<ImageProps, "onError" | "alt" | "src"> {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function SafeImage({
  src,
  alt,
  className,
  fallbackClassName,
  width,
  height,
  fill,
  sizes,
  priority,
  ...rest
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{
          width: fill ? "100%" : width ? `${width}px` : undefined,
          height: fill ? "100%" : height ? `${height}px` : undefined,
        }}
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-amber-950/60 text-amber-400/80 border border-charcoal-800/80",
          fill ? "w-full h-full absolute inset-0" : "",
          fallbackClassName || className,
        )}
      >
        <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
          <Wrench className="h-8 w-8 text-amber-500/80 animate-pulse" />
          <span className="text-xs text-ash/80 line-clamp-1 max-w-[200px]">
            {alt}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      priority={priority}
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
}
