"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordRequirementsProps {
  password?: string;
  className?: string;
}

interface RequirementItem {
  id: string;
  label: string;
  isMet: (val: string) => boolean;
}

const REQUIREMENTS: RequirementItem[] = [
  {
    id: "length",
    label: "At least 8 characters",
    isMet: (val) => val.length >= 8,
  },
  {
    id: "lowercase",
    label: "A lowercase letter (a-z)",
    isMet: (val) => /[a-z]/.test(val),
  },
  {
    id: "uppercase",
    label: "An uppercase letter (A-Z)",
    isMet: (val) => /[A-Z]/.test(val),
  },
  {
    id: "number",
    label: "A number (0-9)",
    isMet: (val) => /\d/.test(val),
  },
];

export function PasswordRequirements({
  password = "",
  className,
}: PasswordRequirementsProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-panel p-3 border border-border space-y-2 text-xs",
        className,
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="font-semibold text-charcoal-800 text-[11px] uppercase tracking-wider">
        Password Requirements:
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {REQUIREMENTS.map((req) => {
          const met = req.isMet(password);
          return (
            <li
              key={req.id}
              className={cn(
                "flex items-center gap-2 transition-colors",
                met ? "text-emerald-700 font-medium" : "text-charcoal-500",
              )}
            >
              {met ? (
                <span className="size-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Check className="size-2.5 text-emerald-600 stroke-[3]" />
                </span>
              ) : (
                <span className="size-4 flex items-center justify-center shrink-0">
                  <span className="size-1.5 rounded-full bg-charcoal-400" />
                </span>
              )}
              <span className="text-[11px] leading-tight">{req.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
