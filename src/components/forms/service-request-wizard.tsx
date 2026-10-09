"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  ImageIcon,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ImagePicker, type PickedImage } from "@/components/forms/image-picker";
import { UploadProgress } from "@/components/forms/upload-progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateRequest } from "@/hooks/use-create-request";
import { extractArray } from "@/lib/extract-data";
import { cn } from "@/lib/utils";
import {
  type ServiceRequestFormValues,
  serviceRequestSchema,
  TIME_SLOT_OPTIONS,
} from "@/lib/validations/request";
import { requestsService } from "@/services/requests.service";
import type { ServiceCategory } from "@/types/api";

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
    skillId: "appliance",
  },
];

const STEPS = [
  {
    id: 1,
    title: "Details",
    description: "Category & description",
    icon: FileText,
  },
  {
    id: 2,
    title: "Schedule",
    description: "Date, time & address",
    icon: CalendarIcon,
  },
  {
    id: 3,
    title: "Photos",
    description: "Optional attachments",
    icon: ImageIcon,
  },
] as const;

export function ServiceRequestWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Fetch Categories
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ["service-categories"],
    queryFn: () => requestsService.fetchCategories(),
  });

  const categoriesList = extractArray<ServiceCategory>(categories);
  const availableCategories =
    categoriesList.length > 0 ? categoriesList : FALLBACK_CATEGORIES;

  const {
    state: createStatus,
    createdRequestId,
    errorMessage: creationError,
    uploadProgress,
    isBusy,
    submitRequest,
    retryAttachments,
    skipAttachments,
  } = useCreateRequest();

  const form = useForm<ServiceRequestFormValues>({
    resolver: zodResolver(serviceRequestSchema),
    mode: "onTouched",
    defaultValues: {
      categoryId: "",
      title: "",
      description: "",
      preferredDate: "",
      preferredTime: "09:00:00",
      address: "",
      attachments: [],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    formState: { errors },
  } = form;

  const watchedAttachments = watch("attachments") || [];

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await trigger(["categoryId", "title", "description"]);
      if (isValid) setStep(2);
    } else if (step === 2) {
      const isValid = await trigger([
        "preferredDate",
        "preferredTime",
        "address",
      ]);
      if (isValid) setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2);
    }
  };

  const onSubmit = async (values: ServiceRequestFormValues) => {
    await submitRequest(values);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Visual Step Indicator */}
      <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-xs">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
          {STEPS.map((s, index) => {
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            const StepIcon = s.icon;

            return (
              <div
                key={s.id}
                className={cn(
                  "flex flex-col items-center sm:items-start text-center sm:text-left gap-2 relative",
                  index < STEPS.length - 1 &&
                    "sm:after:content-[''] sm:after:absolute sm:after:top-4 sm:after:left-[calc(50%+24px)] sm:after:w-[calc(100%-48px)] sm:after:h-0.5 sm:after:bg-border",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "size-8 sm:size-9 rounded-full flex items-center justify-center font-semibold text-xs transition-colors shrink-0",
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                          ? "bg-brand-600 text-white ring-4 ring-brand-500/20 shadow-xs"
                          : "bg-muted text-charcoal-500",
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-4 stroke-[2.5]" />
                    ) : (
                      <StepIcon className="size-4" />
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p
                      className={cn(
                        "text-xs font-bold leading-none",
                        isCurrent
                          ? "text-charcoal-900"
                          : isCompleted
                            ? "text-emerald-700"
                            : "text-charcoal-500",
                      )}
                    >
                      Step {s.id}
                    </p>
                    <p className="text-xs text-charcoal-600 font-medium mt-0.5">
                      {s.title}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Partial failure notice if request was created but attachments failed */}
      {createStatus === "error-attachments" && (
        <Alert className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="font-bold text-sm">
            Request Created — Photo Upload Failed
          </AlertTitle>
          <AlertDescription className="text-xs pt-1 space-y-3">
            <p>
              Your request was created successfully, but the photos could not be
              uploaded: {creationError || "Attachment upload error."}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={() =>
                  retryAttachments((watchedAttachments as PickedImage[]) || [])
                }
              >
                <RefreshCw className="size-3.5 mr-1.5" />
                Retry photo upload
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={skipAttachments}
              >
                Skip photos and continue
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1 Error Alert if initial create failed */}
      {createStatus === "error-create" && creationError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle className="font-bold text-sm">
            Failed to submit request
          </AlertTitle>
          <AlertDescription className="text-xs pt-1">
            {creationError}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Step Form Container */}
      <Card className="border border-border bg-card shadow-xs">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* STEP 1: Details */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in-50 duration-200">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-charcoal-900">
                    Service Details
                  </h2>
                  <p className="text-xs text-charcoal-600">
                    Select a service category and describe the problem you need
                    solved.
                  </p>
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <Label htmlFor="categoryId" className="text-charcoal-800">
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
                      disabled={isBusy}
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-colors"
                      aria-invalid={Boolean(errors.categoryId)}
                      aria-describedby={
                        errors.categoryId ? "category-error" : undefined
                      }
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
                    <p
                      id="category-error"
                      className="text-xs font-medium text-destructive"
                    >
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>

                {/* Request Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-charcoal-800">
                    Request Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. AC unit blowing warm air"
                    autoComplete="off"
                    disabled={isBusy}
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={errors.title ? "title-error" : undefined}
                    {...register("title")}
                  />
                  {errors.title && (
                    <p
                      id="title-error"
                      className="text-xs font-medium text-destructive"
                    >
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-charcoal-800">
                    Detailed Description{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <textarea
                    id="description"
                    rows={4}
                    placeholder="Please explain the issue in detail (symptoms, when it started, any error codes)..."
                    disabled={isBusy}
                    className="w-full rounded-lg border border-input bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-none transition-colors"
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={
                      errors.description ? "desc-error" : undefined
                    }
                    {...register("description")}
                  />
                  {errors.description && (
                    <p
                      id="desc-error"
                      className="text-xs font-medium text-destructive"
                    >
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Schedule & Location */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in-50 duration-200">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-charcoal-900">
                    Schedule &amp; Location
                  </h2>
                  <p className="text-xs text-charcoal-600">
                    Specify when you would prefer a technician to visit and the
                    service location.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Preferred Date */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="preferredDate"
                      className="text-charcoal-800"
                    >
                      Preferred Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      min={todayStr}
                      disabled={isBusy}
                      aria-invalid={Boolean(errors.preferredDate)}
                      aria-describedby={
                        errors.preferredDate ? "date-error" : undefined
                      }
                      {...register("preferredDate")}
                    />
                    {errors.preferredDate && (
                      <p
                        id="date-error"
                        className="text-xs font-medium text-destructive"
                      >
                        {errors.preferredDate.message}
                      </p>
                    )}
                  </div>

                  {/* Preferred Time Slot */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="preferredTime"
                      className="text-charcoal-800"
                    >
                      Time Window <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <select
                        id="preferredTime"
                        disabled={isBusy}
                        className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-colors"
                        aria-invalid={Boolean(errors.preferredTime)}
                        aria-describedby={
                          errors.preferredTime ? "time-error" : undefined
                        }
                        {...register("preferredTime")}
                      >
                        {TIME_SLOT_OPTIONS.map((slot) => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                      <Clock className="size-4 text-charcoal-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                    {errors.preferredTime && (
                      <p
                        id="time-error"
                        className="text-xs font-medium text-destructive"
                      >
                        {errors.preferredTime.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Service Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-charcoal-800">
                    Service Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <textarea
                      id="address"
                      rows={2}
                      placeholder="e.g. 123 Main St, Apt 4B, New York, NY 10001"
                      autoComplete="street-address"
                      disabled={isBusy}
                      className="w-full rounded-lg border border-input bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-none transition-colors"
                      aria-invalid={Boolean(errors.address)}
                      aria-describedby={
                        errors.address ? "address-error" : undefined
                      }
                      {...register("address")}
                    />
                    <MapPin className="size-4 text-charcoal-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                  {errors.address && (
                    <p
                      id="address-error"
                      className="text-xs font-medium text-destructive"
                    >
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Photos / Attachments */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in-50 duration-200">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-charcoal-900">
                    Photos &amp; Attachments
                  </h2>
                  <p className="text-xs text-charcoal-600">
                    Upload photos of the equipment, issue, or error code to help
                    technicians diagnose faster (up to 5 images).
                  </p>
                </div>

                {/* Local ImagePicker */}
                <Controller
                  control={control}
                  name="attachments"
                  render={({ field }) => (
                    <ImagePicker
                      value={(field.value as PickedImage[]) || []}
                      onChange={(images) => field.onChange(images)}
                      disabled={isBusy}
                      label="Photos (Optional)"
                      maxFiles={5}
                    />
                  )}
                />

                {/* Upload Progress during step 2 upload */}
                {createStatus === "uploading-attachments" && (
                  <UploadProgress
                    progress={uploadProgress}
                    label="Uploading photo attachments to your request..."
                  />
                )}

                {/* Summary Box */}
                <div className="rounded-xl border border-border bg-panel p-4 space-y-2 text-xs text-charcoal-700">
                  <p className="font-bold text-charcoal-900 text-sm">
                    Summary Preview
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium text-charcoal-500 block">
                        Title:
                      </span>
                      <span className="font-semibold text-charcoal-800">
                        {form.getValues("title") || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-charcoal-500 block">
                        Schedule:
                      </span>
                      <span className="font-semibold text-charcoal-800">
                        {form.getValues("preferredDate") || "—"} (
                        {TIME_SLOT_OPTIONS.find(
                          (t) => t.value === form.getValues("preferredTime"),
                        )?.label || "Morning"}
                        )
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-medium text-charcoal-500 block">
                        Address:
                      </span>
                      <span className="text-charcoal-800">
                        {form.getValues("address") || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  disabled={isBusy}
                >
                  <ChevronLeft className="size-4 mr-1" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleNext}
                  disabled={isLoadingCategories || isBusy}
                >
                  Next Step
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="cta"
                  size="sm"
                  disabled={isBusy || Boolean(createdRequestId)}
                >
                  {isBusy ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      {createStatus === "uploading-attachments"
                        ? "Uploading photos..."
                        : "Submitting request..."}
                    </>
                  ) : (
                    <>
                      <Plus className="size-4 mr-1.5" />
                      Book Service Request
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
