"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AuthActions } from "./auth-actions";
import { NavLinks } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-charcoal-800"
            aria-label="Open Navigation Menu"
          >
            <Menu className="size-5" />
          </Button>
        }
      />
      <SheetContent
        side="right"
        className="w-[300px] sm:w-[350px] p-6 flex flex-col justify-between"
      >
        <div>
          <SheetHeader className="p-0 text-left mb-6">
            <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
            <Logo onClick={handleClose} />
          </SheetHeader>
          <Separator className="mb-6" />
          <NavLinks orientation="vertical" onLinkClick={handleClose} />
        </div>
        <div className="pt-6 border-t border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-3">
            Account
          </p>
          <AuthActions
            className="flex-col w-full [&>a]:w-full [&>a]:justify-center"
            onActionClick={handleClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
