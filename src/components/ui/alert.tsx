import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        destructive:
          "border-destructive/50 text-destructive bg-destructive/10 dark:border-destructive [&>svg]:text-destructive",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
        info: "border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-200 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return (
    <h5
      data-slot="alert-title"
      className={cn(
        "mb-1 font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-xs [&_p]:leading-relaxed opacity-90", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
