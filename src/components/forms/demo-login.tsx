"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEMO_ACCOUNTS } from "@/constants/demo-accounts";
import { useLogin } from "@/hooks/use-login";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/auth";

export function DemoLogin() {
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const loginMutation = useLogin();

  const handleDemoLogin = (role: Role, email?: string, password?: string) => {
    if (!email || !password) {
      toast.info("Demo credentials are not configured");
      return;
    }

    setActiveRole(role);
    loginMutation.mutate(
      { email, password },
      {
        onSettled: () => {
          setActiveRole(null);
        },
      },
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
      {DEMO_ACCOUNTS.map((account, index) => {
        const Icon = account.icon;
        const isThirdCard = index === 2;
        const isLoadingThis =
          loginMutation.isPending && activeRole === account.role;

        return (
          <Card
            key={account.role}
            className={cn(
              "border border-border bg-panel/70 hover:bg-card transition-colors p-3.5 shadow-2xs flex flex-col justify-between",
              isThirdCard && "sm:col-span-2 sm:max-w-xs sm:mx-auto w-full",
            )}
          >
            <CardContent className="p-0 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="size-8 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 text-charcoal-800 shadow-2xs">
                  <Icon className="size-4 text-brand-600" aria-hidden="true" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-bold text-charcoal-900 truncate">
                    {account.label}
                  </h4>
                  <p className="text-[11px] text-charcoal-600 leading-snug line-clamp-2">
                    {account.description}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs h-7 font-medium border-border hover:bg-muted"
                disabled={loginMutation.isPending}
                onClick={() =>
                  handleDemoLogin(account.role, account.email, account.password)
                }
              >
                {isLoadingThis ? (
                  <>
                    <Loader2 className="size-3 mr-1.5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Demo Login"
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
