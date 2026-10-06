import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AuthActionsProps {
  className?: string;
  onActionClick?: () => void;
}

export function AuthActions({ className, onActionClick }: AuthActionsProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Link
        href="/login"
        onClick={onActionClick}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Login
      </Link>
      <Link
        href="/register"
        onClick={onActionClick}
        className={cn(buttonVariants({ variant: "default", size: "sm" }))}
      >
        Register
      </Link>
    </div>
  );
}
