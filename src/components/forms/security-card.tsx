"use client";

import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SecurityCardProps {
  className?: string;
}

export function SecurityCard({ className }: SecurityCardProps) {
  return (
    <Card className={cn("border-border shadow-xs", className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="size-4 text-brand-600" />
          Security & Authentication
        </CardTitle>
        <CardDescription>
          Manage your password and security credentials.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 text-xs">
        <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
          <div className="size-8 rounded-md bg-muted text-foreground flex items-center justify-center shrink-0 mt-0.5">
            <KeyRound className="size-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-semibold text-foreground text-xs">
              Account Password
            </h4>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Ensure your account is protected with a strong, unique password
              containing uppercase, lowercase, and numeric characters.
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-border/80 pt-4 bg-muted/20">
        <span className="text-[11px] text-muted-foreground">
          You will be prompted to log in again after changing your password.
        </span>
        <Link
          href="/change-password"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5 text-xs font-semibold shrink-0 shadow-2xs",
          )}
        >
          <Lock className="size-3.5" />
          <span>Change Password</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
