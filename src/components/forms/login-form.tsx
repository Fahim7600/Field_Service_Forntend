"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { DemoLogin } from "@/components/forms/demo-login";
import { PasswordInput } from "@/components/forms/password-input";
import { SocialAuth } from "@/components/forms/social-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLogin } from "@/hooks/use-login";
import { getSafeRedirect } from "@/lib/auth-routes";
import { type LoginFormValues, loginSchema } from "@/lib/validations/auth";
import { useAuthStore } from "@/stores/auth-store";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  // If already authenticated, redirect immediately to role home
  useEffect(() => {
    if (status === "authenticated" && user) {
      const redirectParam = searchParams.get("redirect");
      const target = getSafeRedirect(redirectParam, user.role);
      router.replace(target);
    }
  }, [status, user, router, searchParams]);

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="bg-card w-full rounded-2xl p-6 sm:p-8 border border-border shadow-xs space-y-6">
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-charcoal-900">
          Welcome back
        </h1>
        <p className="text-sm text-charcoal-600">
          Login to your account to continue
        </p>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-charcoal-800">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            disabled={loginMutation.isPending}
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

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-charcoal-800">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-brand-600 hover:text-brand-700 hover:underline focus-visible:outline-hidden"
              tabIndex={-1}
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loginMutation.isPending}
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
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          className="w-full font-medium h-9 text-sm mt-2"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>

      {/* Register Link */}
      <div className="text-center text-xs text-charcoal-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-charcoal-900 hover:text-brand-600 underline-offset-4 hover:underline"
        >
          Register
        </Link>
      </div>

      {/* Social Auth Spot */}
      <SocialAuth />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-charcoal-600 font-medium">OR</span>
        </div>
      </div>

      {/* Quick Demo Login Section */}
      <div className="space-y-1">
        <div className="space-y-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
            Quick Demo Login
          </h2>
          <p className="text-xs text-charcoal-600">
            Explore each role with one click.
          </p>
        </div>
        <DemoLogin />
      </div>
    </div>
  );
}
