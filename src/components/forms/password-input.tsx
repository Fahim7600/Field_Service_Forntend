"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends React.ComponentProps<"input"> {
  className?: string;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, disabled, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="relative w-full">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-9", className)}
        ref={ref}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        disabled={disabled}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-600 hover:text-charcoal-900 focus-visible:outline-hidden focus-visible:text-brand-600 disabled:opacity-50 disabled:pointer-events-none p-0.5 rounded transition-colors"
        aria-label={showPassword ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";
