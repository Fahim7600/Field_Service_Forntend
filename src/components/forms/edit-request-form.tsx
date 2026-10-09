"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Clock, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { extractArray } from "@/lib/extract-data";
import { combinePreferredAt, splitPreferredAt } from "@/lib/preferred-time";
import { cn } from "@/lib/utils";
import {
  type EditServiceRequestFormValues,
  editServiceRequestSchema,
  TIME_SLOT_OPTIONS,
} from "@/lib/validations/request";
import { requestsService } from "@/services/requests.service";
import type { CustomerRequestDetail, ServiceCategory } from "@/types/api";

const FALLBACK_CATEGORIES: ServiceCategory[] = [
  {
    id: "cat-hvac",
    name: "HVAC Repair & Maintenance",
    basePriceCents: 8500,
    skillId: "hvac",
  },
  {
    id: "cat-plumbing",
    name: "Plumbing & Leak Repair",
    basePriceCents: 7500,
    skillId: "plumbing",
  },
  {
    id: "cat-electrical",
    name: "Electrical Wiring & Diagnostics",
    basePriceCents: 9000,
    skillId: "electrical",
  },
  {
    id: "cat-appliance",
    name: "Appliance Repair",
    basePriceCents: 6500,
    skillId: "appliances",
  },
];

interface EditRequestFormProps {
  request: CustomerRequestDetail;
}

export function EditRequestForm({ request }: EditRequestFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const initialPreferred = useMemo(
    () => splitPreferredAt(request.preferredAt || request.preferredDate),
    [request.preferredAt, request.preferredDate],
  );

  const initialValues = useMemo<EditServiceRequestFormValues>(
    () => ({
      categoryId:
        request.category?.id ||
        (request as unknown as { categoryId?: string }).categoryId ||
        "",
      title: request.title || "",
      description: request.description || "",
      preferredDate: initialPreferred.date,
      preferredTime: initialPreferred.timeSlot,
      address: request.address || "",
    }),
    [request, initialPreferred],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<EditServiceRequestFormValues>({
    resolver: zodResolver(editServiceRequestSchema),
    mode: "onTouched",
    defaultValues: initialValues,
  });

  // Warn before unload if form has unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Fetch active categories
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ["service-categories"],
    queryFn: () => requestsService.fetchCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const availableCategories = useMemo(() => {
    const extracted = extractArray<ServiceCategory>(categoriesData);
    return extracted.length > 0 ? extracted : FALLBACK_CATEGORIES;
  }, [categoriesData]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const updateMutation = useMutation({
    mutationFn: async (values: EditServiceRequestFormValues) => {
      // Build diff payload sending ONLY changed fields
      const diff: Record<string, string> = {};

      if (values.categoryId !== initialValues.categoryId) {
        diff.categoryId = values.categoryId;
      }
      if (values.title.trim() !== initialValues.title.trim()) {
        diff.title = values.title.trim();
      }
      if (values.description.trim() !== initialValues.description.trim()) {
        diff.description = values.description.trim();
      }
      if (values.address.trim() !== initialValues.address.trim()) {
        diff.address = values.address.trim();
      }
      if (
        values.preferredDate !== initialValues.preferredDate ||
        values.preferredTime !== initialValues.preferredTime
      ) {
        diff.preferredAt = combinePreferredAt(
          values.preferredDate,
          values.preferredTime,
        );
      }

      if (Object.keys(diff).length === 0) {
        return null;
      }

      return requestsService.updateRequest(request.id, diff);
    },
    onSuccess: () => {
      toast.success("Request updated", {
        description: "Your changes have been saved.",
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-request", request.id],
      });
      queryClient.invalidateQueries({ queryKey: ["customer-requests"] });
      router.push(`/customer/requests/${request.id}`);
    },
    onError: (error: unknown) => {
      const err = error as { message?: string; statusCode?: number };
      const message = err.message || "Failed to update service request";
      toast.error(message);

      // If backend rejects because status was already approved/reviewed, invalidate and navigate back
      if (err.statusCode === 400 || err.statusCode === 409) {
        queryClient.invalidateQueries({
          queryKey: ["customer-request", request.id],
        });
        router.push(`/customer/requests/${request.id}`);
      }
    },
  });

  const onSubmit = (values: EditServiceRequestFormValues) => {
    updateMutation.mutate(values);
  };

  const isSaving = updateMutation.isPending;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="border-b border-border/40 pb-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Edit Service Request
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Update the details for request #
              {request.requestNumber || request.id.slice(0, 8)}.
            </CardDescription>
          </div>
          <Link
            href={`/customer/requests/${request.id}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1 text-muted-foreground hover:text-foreground",
            )}
          >
            <ArrowLeft className="size-4" />
            Cancel
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {updateMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Update failed</AlertTitle>
              <AlertDescription className="text-xs">
                {(updateMutation.error as { message?: string })?.message ||
                  "An unexpected error occurred while saving changes."}
              </AlertDescription>
            </Alert>
          )}

          {/* Service Category */}
          <div className="space-y-1.5">
            <Label htmlFor="categoryId" className="text-foreground">
              Service Category <span className="text-destructive">*</span>
            </Label>
            {isLoadingCategories ? (
              <Skeleton className="h-10 w-full rounded-lg" />
            ) : isCategoriesError ? (
              <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg">
                Failed to load service categories. Please try refreshing.
              </div>
            ) : (
              <select
                id="categoryId"
                disabled={isSaving}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-colors"
                aria-invalid={Boolean(errors.categoryId)}
                {...register("categoryId")}
              >
                <option value="">Select a category...</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                    {typeof cat.basePriceCents === "number"
                      ? ` (Base price: $${(cat.basePriceCents / 100).toFixed(2)})`
                      : ""}
                  </option>
                ))}
              </select>
            )}
            {errors.categoryId && (
              <p className="text-xs font-medium text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Request Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-foreground">
              Request Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. AC unit blowing warm air"
              autoComplete="off"
              disabled={isSaving}
              aria-invalid={Boolean(errors.title)}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs font-medium text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-foreground">
              Detailed Description <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="description"
              rows={4}
              placeholder="Please explain the issue in detail..."
              disabled={isSaving}
              className="w-full rounded-lg border border-input bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-none transition-colors"
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs font-medium text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preferred Date */}
            <div className="space-y-1.5">
              <Label htmlFor="preferredDate" className="text-foreground">
                Preferred Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="preferredDate"
                type="date"
                min={todayStr}
                disabled={isSaving}
                aria-invalid={Boolean(errors.preferredDate)}
                {...register("preferredDate")}
              />
              {errors.preferredDate && (
                <p className="text-xs font-medium text-destructive">
                  {errors.preferredDate.message}
                </p>
              )}
            </div>

            {/* Preferred Time Slot */}
            <div className="space-y-1.5">
              <Label htmlFor="preferredTime" className="text-foreground">
                Time Window <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <select
                  id="preferredTime"
                  disabled={isSaving}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-colors"
                  aria-invalid={Boolean(errors.preferredTime)}
                  {...register("preferredTime")}
                >
                  {TIME_SLOT_OPTIONS.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                <Clock className="size-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>
              {errors.preferredTime && (
                <p className="text-xs font-medium text-destructive">
                  {errors.preferredTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Service Location / Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-foreground">
              Service Address <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="address"
              rows={2}
              placeholder="Full street address, apartment/unit, city, zip"
              disabled={isSaving}
              className="w-full rounded-lg border border-input bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-none transition-colors"
              aria-invalid={Boolean(errors.address)}
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs font-medium text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <Link
              href={`/customer/requests/${request.id}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                isSaving && "pointer-events-none opacity-50",
              )}
            >
              Cancel
            </Link>

            <Button
              type="submit"
              disabled={!isDirty || !isValid || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
