"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  User as UserIcon,
} from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { messages, notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import {
  type AccountDetailsFormValues,
  accountDetailsSchema,
} from "@/lib/validations/profile";
import { usersService } from "@/services/users.service";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/auth";

export interface AccountDetailsFormProps {
  user?: User | null;
  className?: string;
}

export function AccountDetailsForm({
  user: initialUser,
  className,
}: AccountDetailsFormProps) {
  const { user: authUser } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const currentUser = initialUser || authUser;

  const form = useForm<AccountDetailsFormValues>({
    resolver: zodResolver(accountDetailsSchema),
    mode: "onTouched",
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      address: currentUser?.address || "",
    },
  });

  // Sync form if user loads asynchronously
  React.useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
      });
    }
  }, [currentUser, form]);

  const onSubmit = async (values: AccountDetailsFormValues) => {
    try {
      setIsSubmitting(true);

      // Only send fields that actually changed
      const payload: Record<string, string> = {};
      if (values.name !== currentUser?.name) payload.name = values.name.trim();
      if ((values.phone || "") !== (currentUser?.phone || "")) {
        payload.phone = (values.phone || "").trim();
      }
      if ((values.address || "") !== (currentUser?.address || "")) {
        payload.address = (values.address || "").trim();
      }

      if (Object.keys(payload).length === 0) {
        notify.info(
          "No changes to save",
          "You haven't made any changes to your details.",
        );
        return;
      }

      const updatedUser = await usersService.updateMe(payload);

      // Update auth store
      if (currentUser) {
        setUser({
          ...currentUser,
          ...updatedUser,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["users", "me"] });

      // Reset form dirty state with new values
      form.reset({
        name: updatedUser.name || values.name,
        email: updatedUser.email || values.email,
        phone: updatedUser.phone || values.phone,
        address: updatedUser.address || values.address,
      });

      notify.success(
        messages.profile.updated.title,
        messages.profile.updated.description,
      );
    } catch (err: unknown) {
      notify.fromError(err, "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDirty = form.formState.isDirty;
  const isValid = form.formState.isValid;

  return (
    <Card className={cn("border-border shadow-xs", className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <UserIcon className="size-4 text-brand-600" />
          Personal & Contact Details
        </CardTitle>
        <CardDescription>
          Update your public profile and contact preferences.
        </CardDescription>
      </CardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 text-xs">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="account-name" className="text-xs font-semibold">
              Full Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="account-name"
              placeholder="e.g. Alex Morgan"
              disabled={isSubmitting}
              {...form.register("name")}
              className={cn(form.formState.errors.name && "border-rose-500")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-rose-500 font-medium">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-1.5">
            <Label htmlFor="account-email" className="text-xs font-semibold">
              Email Address
            </Label>
            <div className="relative">
              <Input
                id="account-email"
                type="email"
                disabled
                value={currentUser?.email || ""}
                className="bg-muted/40 text-muted-foreground cursor-not-allowed pl-8"
              />
              <Mail className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Email address is managed by your system administrator.
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="account-phone" className="text-xs font-semibold">
              Phone Number (Optional)
            </Label>
            <div className="relative">
              <Input
                id="account-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                disabled={isSubmitting}
                {...form.register("phone")}
                className={cn(
                  "pl-8",
                  form.formState.errors.phone && "border-rose-500",
                )}
              />
              <Phone className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {form.formState.errors.phone && (
              <p className="text-xs text-rose-500 font-medium">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="account-address" className="text-xs font-semibold">
              Mailing / Service Address (Optional)
            </Label>
            <div className="relative">
              <Textarea
                id="account-address"
                rows={2}
                placeholder="123 Industrial Way, Suite 400..."
                disabled={isSubmitting}
                {...form.register("address")}
                className={cn(
                  form.formState.errors.address && "border-rose-500",
                )}
              />
            </div>
            {form.formState.errors.address ? (
              <p className="text-xs text-rose-500 font-medium">
                {form.formState.errors.address.message}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Max 200 characters.
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/80 pt-4 bg-muted/20">
          <span className="text-[11px] text-muted-foreground">
            {isDirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <Button
            type="submit"
            variant="default"
            size="sm"
            disabled={!isDirty || !isValid || isSubmitting}
            className="shadow-xs font-semibold text-xs gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
