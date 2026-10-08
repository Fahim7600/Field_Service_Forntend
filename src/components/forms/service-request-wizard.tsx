"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
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
  Trash2,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { extractArray } from "@/lib/extract-data";
import { cn } from "@/lib/utils";
import {
  type ServiceRequestFormValues,
  serviceRequestSchema,
  TIME_SLOT_OPTIONS,
} from "@/lib/validations/request";
import { requestsService } from "@/services/requests.service";
import type { CreateServiceRequestPayload, ServiceCategory } from "@/types/api";

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
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isUploading, setIsUploading] = useState(false);

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
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = form;

  const watchedAttachments = watch("attachments") || [];

  // Create Request Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateServiceRequestPayload) =>
      requestsService.createServiceRequest(payload),
    onSuccess: (data) => {
      toast.success(
        `Service request #${data.requestNumber || ""} created successfully!`,
      );
      router.push("/customer");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create service request.");
    },
  });

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (watchedAttachments.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`File "${file.name}" is not an image.`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File "${file.name}" exceeds 5MB limit.`);
          continue;
        }

        const url = await uploadImageToCloudinary(file);
        newUrls.push(url);
      }

      if (newUrls.length > 0) {
        setValue("attachments", [...watchedAttachments, ...newUrls], {
          shouldValidate: true,
        });
        toast.success(`Uploaded ${newUrls.length} photo(s).`);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to upload image.";
      toast.error(message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setValue(
      "attachments",
      watchedAttachments.filter((_, idx) => idx !== indexToRemove),
      { shouldValidate: true },
    );
  };

  const onSubmit = (values: ServiceRequestFormValues) => {
    // Construct ISO preferredAt timestamp
    let preferredAt: string;
    try {
      const datePart = values.preferredDate;
      const timePart = values.preferredTime || "09:00:00";
      preferredAt = new Date(`${datePart}T${timePart}`).toISOString();
    } catch {
      preferredAt = new Date().toISOString();
    }

    const payload: CreateServiceRequestPayload = {
      categoryId: values.categoryId,
      title: values.title,
      description: values.description,
      address: values.address,
      preferredAt,
      attachments: values.attachments,
    };

    createMutation.mutate(payload);
  };

  // Get today's date formatted as YYYY-MM-DD for min date attribute
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
                      disabled={createMutation.isPending}
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
                    disabled={createMutation.isPending}
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
                    disabled={createMutation.isPending}
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
                      disabled={createMutation.isPending}
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
                        disabled={createMutation.isPending}
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
                      disabled={createMutation.isPending}
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

                {/* Upload Area */}
                <div className="space-y-3">
                  <div className="relative border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-brand-500 hover:bg-brand-50/20 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept="image/*"
                      disabled={
                        isUploading ||
                        createMutation.isPending ||
                        watchedAttachments.length >= 5
                      }
                      onChange={handleFileUpload}
                      className="absolute inset-0 size-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                        {isUploading ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          <UploadCloud className="size-5" />
                        )}
                      </div>
                      <div className="text-xs text-charcoal-700">
                        <span className="font-semibold text-brand-600">
                          Click to upload
                        </span>{" "}
                        or drag and drop photos
                      </div>
                      <p className="text-[11px] text-charcoal-500">
                        PNG, JPG, or WEBP (Max 5MB each, up to 5 photos)
                      </p>
                    </div>
                  </div>

                  {/* Thumbnail Previews */}
                  {watchedAttachments.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-charcoal-700 font-semibold">
                        Uploaded Photos ({watchedAttachments.length}/5)
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {watchedAttachments.map((url, idx) => (
                          <div
                            key={url}
                            className="relative group rounded-lg overflow-hidden border border-border bg-panel aspect-square"
                          >
                            <Image
                              src={url}
                              alt={`Attachment ${idx + 1}`}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(idx)}
                              disabled={createMutation.isPending}
                              className="absolute top-1 right-1 size-6 rounded-full bg-charcoal-900/80 text-white flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-destructive transition-all"
                              aria-label="Remove image"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

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
                  disabled={createMutation.isPending || isUploading}
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
                  disabled={isLoadingCategories || isUploading}
                >
                  Next Step
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="cta"
                  size="sm"
                  disabled={createMutation.isPending || isUploading}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Plus className="size-4 mr-1.5" />
                      Submit Request
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
