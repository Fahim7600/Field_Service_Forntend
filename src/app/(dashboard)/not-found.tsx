import { FileQuestion, Home } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page Not Found | Dashboard",
  description: "The requested dashboard page could not be found.",
};

export default function DashboardNotFound() {
  return (
    <Container className="py-16 max-w-lg">
      <Card className="border-border shadow-sm text-center">
        <CardContent className="p-8 space-y-4">
          <div className="size-14 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <FileQuestion className="size-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">
              This page does not exist
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              The dashboard page or resource you are looking for has been moved,
              deleted, or does not exist.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "gap-1.5 font-semibold text-xs shadow-xs",
              )}
            >
              <Home className="size-3.5" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
