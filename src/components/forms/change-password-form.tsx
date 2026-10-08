"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PasswordInput } from "@/components/forms/password-input";
import { PasswordRequirements } from "@/components/forms/password-requirements";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useChangePassword } from "@/hooks/use-change-password";
import {
  type ChangePasswordFormValues,
  changePasswordSchema,
} from "@/lib/validations/auth";

export interface ChangePasswordFormProps {
  mustChange?: boolean;
}

export function ChangePasswordForm({
  mustChange = false,
}: ChangePasswordFormProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const changePasswordMutation = useChangePassword();

  const isForced = mustChange || Boolean(user?.mustChangePassword);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?redirect=/change-password");
    }
  }, [isLoading, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchedNewPassword = watch("newPassword") || "";

  const onSubmit = (values: ChangePasswordFormValues) => {
    changePasswordMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="bg-card w-full rounded-2xl p-6 sm:p-8 border border-border shadow-xs space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-card w-full rounded-2xl p-6 sm:p-8 border border-border shadow-xs space-y-6">
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-charcoal-900">
          Change your password
        </h1>
        {!isForced && (
          <p className="text-sm text-charcoal-600">
            Update your account password to keep your account secure.
          </p>
        )}
      </div>

      {/* Forced Change Info Notice */}
      {isForced && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3 text-amber-900">
          <ShieldAlert className="size-5 text-brand-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold block mb-0.5">
              Password Update Required
            </span>
            For your security you must set a new password before continuing.
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Current Password */}
        <div className="space-y-1.5">
          <Label htmlFor="currentPassword" className="text-charcoal-800">
            Current or temporary password
          </Label>
          <PasswordInput
            id="currentPassword"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={changePasswordMutation.isPending}
            aria-invalid={Boolean(errors.currentPassword)}
            aria-describedby={
              errors.currentPassword ? "current-password-error" : undefined
            }
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <p
              id="current-password-error"
              className="text-xs font-medium text-destructive"
            >
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-charcoal-800">
            New password
          </Label>
          <PasswordInput
            id="newPassword"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={changePasswordMutation.isPending}
            aria-invalid={Boolean(errors.newPassword)}
            aria-describedby={
              errors.newPassword ? "new-password-error" : undefined
            }
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p
              id="new-password-error"
              className="text-xs font-medium text-destructive"
            >
              {errors.newPassword.message}
            </p>
          )}

          {/* Live Requirements */}
          <PasswordRequirements
            password={watchedNewPassword}
            className="mt-2"
          />
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-charcoal-800">
            Confirm new password
          </Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={changePasswordMutation.isPending}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? "confirm-password-error" : undefined
            }
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p
              id="confirm-password-error"
              className="text-xs font-medium text-destructive"
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          className="w-full font-medium h-9 text-sm mt-2"
          disabled={changePasswordMutation.isPending}
        >
          {changePasswordMutation.isPending ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Updating password...
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </form>
    </div>
  );
}
