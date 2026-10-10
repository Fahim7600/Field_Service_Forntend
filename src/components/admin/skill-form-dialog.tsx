"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, Wrench } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { ApiError, getErrorMessage } from "@/lib/api-client";
import { catalogService } from "@/services/catalog.service";
import type { SkillPayload } from "@/types/admin";

const skillFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Skill name must be at least 2 characters")
    .max(60, "Skill name cannot exceed 60 characters"),
});

type SkillFormValues = z.infer<typeof skillFormSchema>;

interface SkillFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SkillFormDialog({ open, onOpenChange }: SkillFormDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({ name: "" });
    }
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: async (values: SkillFormValues) => {
      const payload: SkillPayload = {
        name: values.name.trim(),
      };
      return catalogService.createSkill(payload);
    },
    onSuccess: (newSkill) => {
      toast.success("Skill Created", {
        description: `Skill "${newSkill.name}" has been added to the catalog.`,
        icon: <CheckCircle2 className="size-4 text-emerald-600" />,
      });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
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
          message: "A skill with this name already exists.",
        });
      } else {
        toast.error("Failed to Create Skill", {
          description: errMsg,
          icon: <AlertCircle className="size-4 text-destructive" />,
        });
      }
    },
  });

  const onSubmit = (values: SkillFormValues) => {
    mutation.mutate(values);
  };

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
            <Wrench className="size-5 text-primary" />
            <span>Add New Skill</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Add a qualification skill required for technicians and service
            categories.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="skill-name" className="text-xs font-semibold">
              Skill Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="skill-name"
              placeholder="e.g. HVAC Diagnostics, Electrical Repair"
              disabled={mutation.isPending}
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.name.message}
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
              disabled={mutation.isPending || !isValid}
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin mr-1.5" />
              ) : (
                <CheckCircle2 className="size-4 mr-1.5" />
              )}
              <span>Create Skill</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
