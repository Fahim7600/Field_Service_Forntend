"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle2, Loader2, MessageSquare, Star } from "lucide-react";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, getErrorMessage } from "@/lib/api-client";
import { loadFeedback, saveFeedback } from "@/lib/feedback-cache";
import { safeFormatDateTime } from "@/lib/format";
import { messages, notify } from "@/lib/notify";
import { workOrdersService } from "@/services/work-orders.service";
import { useAuthStore } from "@/stores/auth-store";
import type { WorkOrderFeedback } from "@/types/work-order";

const feedbackFormSchema = z.object({
  rating: z
    .number({ required_error: "Please select a star rating." })
    .int()
    .min(1, "Please select a star rating.")
    .max(5, "Rating cannot exceed 5 stars."),
  comment: z
    .string()
    .max(1000, "Comment cannot exceed 1,000 characters.")
    .optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export interface FeedbackCardProps {
  workOrderId: string;
  workOrderStatus?: string | null;
  existingFeedback?: WorkOrderFeedback | null;
  onRequestRefresh?: () => void;
}

export function FeedbackCard({
  workOrderId,
  workOrderStatus,
  existingFeedback,
  onRequestRefresh,
}: FeedbackCardProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const normalizedStatus = (workOrderStatus || "").toUpperCase();

  const [localFeedback, setLocalFeedback] =
    React.useState<WorkOrderFeedback | null>(existingFeedback ?? null);
  const [alreadyRated, setAlreadyRated] = React.useState(false);

  // Load from local storage cache on mount
  React.useEffect(() => {
    if (existingFeedback) {
      setLocalFeedback(existingFeedback);
      return;
    }
    const cached = loadFeedback(user?.id, workOrderId);
    if (cached) {
      setLocalFeedback({
        id: `cached-${workOrderId}`,
        workOrderId,
        rating: cached.rating,
        comment: cached.comment,
        createdAt: cached.createdAt,
      });
    }
  }, [user?.id, workOrderId, existingFeedback]);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const watchedComment = watch("comment") || "";

  const submitMutation = useMutation({
    meta: { silent: true },
    mutationFn: (values: FeedbackFormValues) =>
      workOrdersService.submitFeedback(workOrderId, {
        rating: values.rating,
        comment: values.comment?.trim() || undefined,
      }),
    onSuccess: (data, variables) => {
      const now = new Date().toISOString();
      notify.success(
        messages.feedback.submitted.title,
        messages.feedback.submitted.description,
      );

      const newFeedback: WorkOrderFeedback = {
        id: data?.id || "feedback-submitted",
        workOrderId,
        rating: variables.rating,
        comment: variables.comment?.trim() || null,
        createdAt: now,
      };

      setLocalFeedback(newFeedback);

      // Save to localStorage
      saveFeedback(user?.id, workOrderId, {
        rating: variables.rating,
        comment: variables.comment?.trim() || null,
        createdAt: now,
      });

      queryClient.invalidateQueries({ queryKey: ["customer", "request"] });
      queryClient.invalidateQueries({ queryKey: ["work-order"] });
      queryClient.invalidateQueries({ queryKey: ["service-history"] });
      onRequestRefresh?.();
    },
    onError: (err: unknown) => {
      const is409 =
        (err instanceof ApiError && err.status === 409) ||
        (axios.isAxiosError(err) && err.response?.status === 409) ||
        getErrorMessage(err).toLowerCase().includes("already rated");

      const is400 =
        (err instanceof ApiError && err.status === 400) ||
        (axios.isAxiosError(err) && err.response?.status === 400);

      if (is409) {
        notify.info(
          messages.feedback.alreadyRated.title,
          messages.feedback.alreadyRated.description,
        );
        setAlreadyRated(true);
        queryClient.invalidateQueries({ queryKey: ["customer", "request"] });
      } else if (is400) {
        notify.fromError(err, "Unable to submit feedback");
        onRequestRefresh?.();
      } else {
        notify.fromError(err, "Failed to submit feedback");
      }
    },
  });

  // If status is not completed, invoiced, paid, or closed, render nothing
  if (
    normalizedStatus !== "COMPLETED" &&
    normalizedStatus !== "INVOICED" &&
    normalizedStatus !== "PAID" &&
    normalizedStatus !== "CLOSED"
  ) {
    return null;
  }

  // If status is completed or invoiced (invoice not yet paid), render muted reminder
  if (normalizedStatus === "COMPLETED" || normalizedStatus === "INVOICED") {
    return (
      <Card className="border border-border/80 bg-muted/20 shadow-xs">
        <CardContent className="p-4 flex items-center gap-3 text-xs text-muted-foreground">
          <MessageSquare className="size-4 shrink-0 text-charcoal-400" />
          <span>You can rate this job after the invoice is paid.</span>
        </CardContent>
      </Card>
    );
  }

  // Read-only state if feedback exists
  const activeFeedback = localFeedback || existingFeedback;

  if (activeFeedback) {
    return (
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Star className="size-4 fill-amber-400 text-amber-400 shrink-0" />
              <CardTitle className="text-sm font-bold text-foreground">
                Your Service Feedback
              </CardTitle>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="size-3.5" />
              <span>Feedback Submitted</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-xs">
          <div className="space-y-1.5">
            <StarRating
              value={activeFeedback.rating}
              readOnly
              showLabel
              size="sm"
            />
            {activeFeedback.comment && (
              <p className="text-foreground bg-muted/40 p-3 rounded-xl border border-border/60 whitespace-pre-wrap leading-relaxed">
                &ldquo;{activeFeedback.comment}&rdquo;
              </p>
            )}
            {activeFeedback.createdAt && (
              <p className="text-[11px] text-muted-foreground">
                Submitted on {safeFormatDateTime(activeFeedback.createdAt)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 409 already rated when no stars / comment cached in local storage
  if (alreadyRated) {
    return (
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Star className="size-4 fill-amber-400 text-amber-400 shrink-0" />
              <CardTitle className="text-sm font-bold text-foreground">
                Your Service Feedback
              </CardTitle>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="size-3.5" />
              <span>Rated</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 text-xs text-muted-foreground">
          <p>You already rated this job. Thank you for your feedback.</p>
        </CardContent>
      </Card>
    );
  }

  // Interactive Form for PAID / CLOSED status
  const onFormSubmit = (data: FeedbackFormValues) => {
    submitMutation.mutate(data);
  };

  return (
    <Card className="border border-border bg-card shadow-xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Star className="size-4 text-amber-500 shrink-0" />
          <CardTitle className="text-sm font-bold text-foreground">
            Rate Your Service
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Please rate the technician&apos;s visit and overall quality of work.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Star Rating Field */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-foreground block">
              Rating <span className="text-destructive">*</span>
            </span>
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <StarRating
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  showLabel
                  size="md"
                  disabled={isSubmitting || submitMutation.isPending}
                />
              )}
            />
            {errors.rating && (
              <p className="text-xs text-destructive font-medium">
                {errors.rating.message}
              </p>
            )}
          </div>

          {/* Optional Comment Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="feedback-comment"
                className="text-xs font-semibold text-foreground"
              >
                Comments (Optional)
              </label>
              <span className="text-[10px] text-muted-foreground">
                {watchedComment.length}/1000
              </span>
            </div>
            <Textarea
              id="feedback-comment"
              {...register("comment")}
              placeholder="How did the technician do? Share details regarding punctuality, quality, and professionalism..."
              rows={3}
              maxLength={1000}
              disabled={isSubmitting || submitMutation.isPending}
              className="resize-none text-xs"
            />
            {errors.comment && (
              <p className="text-xs text-destructive font-medium">
                {errors.comment.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting || submitMutation.isPending}
              className="w-full sm:w-auto font-semibold text-xs"
            >
              {isSubmitting || submitMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Submitting feedback...</span>
                </>
              ) : (
                <span>Submit feedback</span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
