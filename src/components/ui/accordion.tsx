"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface AccordionContextType {
  value?: string | string[];
  onItemToggle: (itemValue: string) => void;
  type?: "single" | "multiple";
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
}

export function Accordion({
  type = "single",
  defaultValue,
  value: controlledValue,
  onValueChange,
  collapsible = true,
  className,
  children,
  ...props
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    string | string[] | undefined
  >(defaultValue || (type === "single" ? "" : []));

  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const onItemToggle = React.useCallback(
    (itemValue: string) => {
      if (type === "single") {
        const nextValue =
          activeValue === itemValue
            ? collapsible
              ? ""
              : itemValue
            : itemValue;
        if (!isControlled) setUncontrolledValue(nextValue);
        onValueChange?.(nextValue);
      } else {
        const currentList = Array.isArray(activeValue) ? activeValue : [];
        const nextList = currentList.includes(itemValue)
          ? currentList.filter((v) => v !== itemValue)
          : [...currentList, itemValue];
        if (!isControlled) setUncontrolledValue(nextList);
        onValueChange?.(nextList);
      }
    },
    [type, activeValue, collapsible, isControlled, onValueChange],
  );

  return (
    <AccordionContext.Provider
      value={{ value: activeValue, onItemToggle, type }}
    >
      <div
        data-slot="accordion"
        className={cn("divide-y divide-border", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextType {
  value: string;
  isOpen: boolean;
}

const AccordionItemContext =
  React.createContext<AccordionItemContextType | null>(null);

export interface AccordionItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionItem({
  value,
  className,
  children,
  ...props
}: AccordionItemProps) {
  const context = React.useContext(AccordionContext);
  const isOpen = Array.isArray(context?.value)
    ? context.value.includes(value)
    : context?.value === value;

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div
        data-slot="accordion-item"
        data-state={isOpen ? "open" : "closed"}
        className={cn("border-b border-border py-2", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  const accordionContext = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);

  if (!itemContext) {
    throw new Error("AccordionTrigger must be used inside AccordionItem");
  }

  const { value, isOpen } = itemContext;

  return (
    <h3 className="flex">
      <button
        type="button"
        data-slot="accordion-trigger"
        data-state={isOpen ? "open" : "closed"}
        aria-expanded={isOpen}
        onClick={() => accordionContext?.onItemToggle(value)}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-left font-semibold text-charcoal-900 transition-all hover:text-brand-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-charcoal-500 transition-transform duration-200",
            isOpen && "rotate-180 text-brand-600",
          )}
        />
      </button>
    </h3>
  );
}

export interface AccordionContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  const itemContext = React.useContext(AccordionItemContext);

  if (!itemContext) {
    throw new Error("AccordionContent must be used inside AccordionItem");
  }

  if (!itemContext.isOpen) {
    return null;
  }

  return (
    <div
      data-slot="accordion-content"
      data-state={itemContext.isOpen ? "open" : "closed"}
      className={cn(
        "overflow-hidden text-charcoal-600 pb-4 pt-0 text-sm leading-relaxed",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
