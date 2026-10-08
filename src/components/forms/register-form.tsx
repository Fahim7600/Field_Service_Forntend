"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PasswordInput } from "@/components/forms/password-input";
import { PasswordRequirements } from "@/components/forms/password-requirements";
import { SocialAuth } from "@/components/forms/social-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRegister } from "@/hooks/use-register";
import { ROLE_HOME } from "@/lib/auth-routes";
import {
  type RegisterFormValues,
  registerSchema,
} from "@/lib/validations/auth";
import { useAuthStore } from "@/stores/auth-store";

export function RegisterForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  // If already authenticated, redirect to role home
  useEffect(() => {
    if (status === "authenticated" && user) {
      const target = ROLE_HOME[user.role] || "/";
      router.replace(target);
    }
  }, [status, user, router]);

  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = watch("password") || "";

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values);
  };

  return (
    <div className="bg-card w-full rounded-2xl p-6 sm:p-8 border border-border shadow-xs space-y-6">
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-charcoal-900">
          Create your account
        </h1>
        <p className="text-sm text-charcoal-600">
          Book trusted field services in minutes
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-charcoal-800">
            Full name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Jane Customer"
            autoComplete="name"
            disabled={registerMutation.isPending}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" className="text-xs font-medium text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-charcoal-800">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="jane@example.com"
            autoComplete="email"
            disabled={registerMutation.isPending}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p
              id="email-error"
              className="text-xs font-medium text-destructive"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone (Optional) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="phone" className="text-charcoal-800">
              Phone number
            </Label>
            <span className="text-xs text-charcoal-500">Optional</span>
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 555 123 4567"
            autoComplete="tel"
            disabled={registerMutation.isPending}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            {...register("phone")}
          />
          {errors.phone && (
            <p
              id="phone-error"
              className="text-xs font-medium text-destructive"
            >
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Address (Optional) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="address" className="text-charcoal-800">
              Address
            </Label>
            <span className="text-xs text-charcoal-500">Optional</span>
          </div>
          <textarea
            id="address"
            rows={2}
            placeholder="123 Main St, New York, NY"
            autoComplete="street-address"
            disabled={registerMutation.isPending}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base md:text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-none transition-colors disabled:opacity-50"
            aria-invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? "address-error" : undefined}
            {...register("address")}
          />
          {errors.address && (
            <p
              id="address-error"
              className="text-xs font-medium text-destructive"
            >
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-charcoal-800">
            Password
          </Label>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={registerMutation.isPending}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p
              id="password-error"
              className="text-xs font-medium text-destructive"
            >
              {errors.password.message}
            </p>
          )}

          {/* Live Requirements Checklist */}
          <PasswordRequirements password={watchedPassword} className="mt-2" />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-charcoal-800">
            Confirm password
          </Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={registerMutation.isPending}
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
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-charcoal-600 font-medium">OR</span>
        </div>
      </div>

      {/* Social Google Auth */}
      <SocialAuth />

      {/* Login Link */}
      <div className="text-center text-xs text-charcoal-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-charcoal-900 hover:text-brand-600 underline-offset-4 hover:underline"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
