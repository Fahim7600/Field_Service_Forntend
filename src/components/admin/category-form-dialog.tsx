"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Layers,
  Loader2,
  Wrench,
} from "lucide-react";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { MoneyInput } from "@/components/forms/money-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, getErrorMessage } from "@/lib/api-client";
import { centsToInputString, parseMoneyToCents } from "@/lib/money";
import { messages, notify } from "@/lib/notify";
import { catalogService } from "@/services/catalog.service";
import type { CategoryPayload, ServiceCategory, Skill } from "@/types/admin";

const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name cannot exceed 80 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  skillId: z.string().min(1, "Please select a required technician skill"),
  priceString: z
    .string()
    .min(1, "Base price is required")
    .refine((val) => {
      const cents = parseMoneyToCents(val);
      return cents !== null && cents >= 0;
    }, "Enter a valid positive price"),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ServiceCategory | null;
  skills: Skill[];
  onSkillTabSwitch?: () => void;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  skills,
  onSkillTabSwitch,
}: CategoryFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(category);

  const defaultValues: CategoryFormValues = React.useMemo(() => {
    if (category) {
      return {
        name: category.name || "",
        description: category.description || "",
        skillId: category.skillId || "",
        priceString: centsToInputString(category.basePriceCents ?? 0),
      };
    }
    return {
      name: "",
      description: "",
      skillId: skills.length > 0 ? skills[0].id : "",
      priceString: "0.00",
    };
  }, [category, skills]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isDirty, isValid },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    mode: "onTouched",
    defaultValues,
  });

  // Reset form when dialog opens or category prop changes
  React.useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const mutation = useMutation({
    meta: { silent: true },
    mutationFn: async (values: CategoryFormValues) => {
      const basePriceCents = parseMoneyToCents(values.priceString) ?? 0;

      if (isEditing && category) {
        // Build diff sending ONLY changed fields
        const diff: Partial<CategoryPayload> = {};
        const trimmedName = values.name.trim();
        const trimmedDesc = values.description?.trim() || "";
        const originalDesc = category.description?.trim() || "";

        if (trimmedName !== category.name) {
          diff.name = trimmedName;
        }
        if (trimmedDesc !== originalDesc) {
          diff.description = trimmedDesc || undefined;
        }
        if (values.skillId !== category.skillId) {
          diff.skillId = values.skillId;
        }
        if (basePriceCents !== category.basePriceCents) {
          diff.basePriceCents = basePriceCents;
        }

        if (Object.keys(diff).length === 0) {
          return category;
        }

        return catalogService.updateCategory(category.id, diff);
      }

      const payload: CategoryPayload = {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        skillId: values.skillId,
        basePriceCents,
      };

      return catalogService.createCategory(payload);
    },
    onSuccess: () => {
      notify.success(
        messages.admin.categorySaved.title,
        messages.admin.categorySaved.description,
      );
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      onOpenChange(false);
    },
    onError: (err) => {
      const errMsg = getErrorMessage(err);
      if (
        (err instanceof ApiError && err.status === 409) ||
        errMsg.toLowerCase().includes("already exists") ||
        errMsg.toLowerCase().includes("duplicate")
      ) {
        setError("name", {
          type: "manual",
          message: "A service category with this name already exists.",
        });
      } else {
        notify.fromError(err);
      }
    },
  });

  const onSubmit = (values: CategoryFormValues) => {
    mutation.mutate(values);
  };

  const hasNoSkills = skills.length === 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!mutation.isPending) {
          onOpenChange(isOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            <span>{isEditing ? "Edit Service Type" : "Add Service Type"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Modify category pricing, title, or required technician skill."
              : "Define a new service category for customer booking and technician dispatch."}
          </DialogDescription>
        </DialogHeader>

        {hasNoSkills && (
          <Alert variant="destructive" className="my-1">
            <AlertTriangle className="size-4" />
            <AlertTitle className="text-xs font-semibold">
              No Skills Available
            </AlertTitle>
            <AlertDescription className="text-xs space-y-2">
              <p>
                Every service category requires an assigned technician skill.
                Please create at least one skill first on the Skills tab.
              </p>
              {onSkillTabSwitch && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2.5 mt-1"
                  onClick={() => {
                    onOpenChange(false);
                    onSkillTabSwitch();
                  }}
                >
                  <Wrench className="size-3 mr-1" />
                  Switch to Skills Tab
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Name Field */}
          <div className="space-y-1.5">
            <Label htmlFor="category-name" className="text-xs font-semibold">
              Service Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="category-name"
              placeholder="e.g. Plumbing Repair & Diagnostics"
              disabled={mutation.isPending || hasNoSkills}
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Skill Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="category-skill" className="text-xs font-semibold">
              Required Technician Skill{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="skillId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={mutation.isPending || hasNoSkills}
                >
                  <SelectTrigger id="category-skill" className="w-full">
                    <SelectValue placeholder="Select required skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {skills.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.skillId && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.skillId.message}
              </p>
            )}
          </div>

          {/* Base Price Field */}
          <div className="space-y-1.5">
            <Label htmlFor="category-price" className="text-xs font-semibold">
              Base Diagnostic / Starting Price{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="priceString"
              render={({ field }) => (
                <MoneyInput
                  id="category-price"
                  placeholder="0.00"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={mutation.isPending || hasNoSkills}
                  error={errors.priceString?.message}
                />
              )}
            />
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <Label htmlFor="category-desc" className="text-xs font-semibold">
              Description{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (Optional)
              </span>
            </Label>
            <Textarea
              id="category-desc"
              placeholder="Brief summary of what this service covers..."
              rows={3}
              disabled={mutation.isPending || hasNoSkills}
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <DialogClose
              disabled={mutation.isPending}
              render={
                <Button
                  variant="outline"
                  size="sm"
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
              }
            />
            <Button
              type="submit"
              size="sm"
              disabled={
                mutation.isPending ||
                hasNoSkills ||
                (isEditing && !isDirty) ||
                !isValid
              }
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin mr-1.5" />
              ) : (
                <CheckCircle2 className="size-4 mr-1.5" />
              )}
              <span>
                {mutation.isPending
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Service Type"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
