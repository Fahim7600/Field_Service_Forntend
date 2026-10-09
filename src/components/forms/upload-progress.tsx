import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface UploadProgressProps {
  progress: number;
  label?: string;
  className?: string;
}

export function UploadProgress({
  progress,
  label = "Uploading files...",
  className,
}: UploadProgressProps) {
  const percent = Math.min(Math.max(Math.round(progress), 0), 100);

  return (
    <div
      aria-live="polite"
      className={cn(
        "rounded-lg border border-brand-200 bg-brand-50/50 p-3 dark:border-brand-900/50 dark:bg-brand-950/20",
        className,
      )}
    >
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-brand-900 dark:text-brand-200">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}
