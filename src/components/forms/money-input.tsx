"use client";

import * as React from "react";
import { centsToInputString, parseMoneyToCents } from "@/lib/money";
import { cn } from "@/lib/utils";

export interface MoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: string;
  onCentsChange?: (cents: number | null) => void;
  label?: string;
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    {
      className,
      value,
      defaultValue,
      onChange,
      onBlur,
      onCentsChange,
      error,
      disabled,
      id,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const [localValue, setLocalValue] = React.useState<string>(() => {
      if (value !== undefined) return String(value);
      if (defaultValue !== undefined) return String(defaultValue);
      return "";
    });

    // Sync external value when controlled
    React.useEffect(() => {
      if (value !== undefined) {
        setLocalValue(String(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setLocalValue(raw);
      if (onChange) {
        onChange(e);
      }
      if (onCentsChange) {
        const cents = parseMoneyToCents(raw);
        onCentsChange(cents);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const cents = parseMoneyToCents(raw);
      if (cents !== null) {
        const formatted = centsToInputString(cents);
        setLocalValue(formatted);
        // Dispatch synthetic change if needed or fire onChange
        if (onChange) {
          const syntheticEvent = {
            ...e,
            target: { ...e.target, value: formatted },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
        if (onCentsChange) {
          onCentsChange(cents);
        }
      }
      if (onBlur) {
        onBlur(e);
      }
    };

    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1">
        <div className="relative flex items-center rounded-lg shadow-2xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground font-medium text-xs sm:text-sm select-none">
            $
          </div>
          <input
            {...props}
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            disabled={disabled}
            value={value !== undefined ? value : localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-label={ariaLabel || props.placeholder || "Amount in USD"}
            aria-invalid={Boolean(error)}
            aria-describedby={error && inputId ? `${inputId}-error` : undefined}
            className={cn(
              "flex h-9 w-full rounded-lg border border-input bg-transparent py-1 pl-7 pr-3 text-sm font-medium transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus-visible:ring-destructive",
              className,
            )}
          />
        </div>
        {error && (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            className="text-[11px] font-medium text-destructive leading-tight"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

MoneyInput.displayName = "MoneyInput";
