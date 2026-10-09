import { ArrowLeft, FileText, Info } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Service Report #${id.slice(0, 8)} | Technician`,
    description: "Submit service report and work completion documentation.",
  };
}

export default async function TechnicianReportPlaceholderPage({
  params,
}: PageProps) {
  const { id } = await params;

  return (
    <Container className="py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/technician/tasks/${id}`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 gap-1 text-muted-foreground hover:text-foreground text-xs",
          )}
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to task #{id.slice(0, 8)}</span>
        </Link>
      </div>

      <PageHeader
        title="Service Report"
        description={`Record completion summary, parts used, hours spent, and sign-off for Task #${id.slice(0, 8)}.`}
      />

      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-8 text-center space-y-4">
          <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <FileText className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">
              Service Report Submission
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              The full multi-part service report form, photo upload, and
              customer digital signature workflow is configured for this step.
            </p>
          </div>

          <Alert className="max-w-md mx-auto text-left border-blue-500/30 bg-blue-500/10 text-xs">
            <Info className="size-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-xs font-bold text-blue-900 dark:text-blue-200">
              Next Step Integration
            </AlertTitle>
            <AlertDescription className="text-[11px] text-blue-800 dark:text-blue-300 pt-0.5">
              The interactive report form is built in the next step.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </Container>
  );
}
