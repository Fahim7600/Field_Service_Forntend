"use client";

import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import type { PickedImage } from "@/components/forms/image-picker";
import type { ServiceRequestFormValues } from "@/lib/validations/request";
import { requestsService } from "@/services/requests.service";

export type CreateRequestState =
  | "idle"
  | "creating-request"
  | "uploading-attachments"
  | "success"
  | "error-create"
  | "error-attachments";

export function useCreateRequest() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [state, setState] = React.useState<CreateRequestState>("idle");
  const [createdRequestId, setCreatedRequestId] = React.useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);

  const createdIdRef = React.useRef<string | null>(null);

  const invalidateQueries = React.useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["service-requests"] }),
      queryClient.invalidateQueries({ queryKey: ["customer", "requests"] }),
      queryClient.invalidateQueries({ queryKey: ["customer", "dashboard"] }),
    ]);
  }, [queryClient]);

  /**
   * Uploads attachments to the already-created service request.
   */
  const uploadAttachmentsOnly = React.useCallback(
    async (requestId: string, attachments: PickedImage[]) => {
      setState("uploading-attachments");
      setErrorMessage(null);
      setUploadProgress(0);

      try {
        const files = attachments.map((a) => a.file);
        await requestsService.uploadAttachments(requestId, files, (percent) => {
          setUploadProgress(percent);
        });

        setState("success");
        await invalidateQueries();
        toast.success("Request submitted", {
          description: "We will review it shortly.",
        });
        router.push(`/customer/requests/${requestId}`);
        router.refresh();
      } catch (err: unknown) {
        let msg = "Failed to upload attachments";
        if (axios.isAxiosError(err)) {
          const resData = err.response?.data as {
            message?: string;
            errors?: string[];
          };
          msg = resData?.message || err.message || msg;
        } else if (err instanceof Error) {
          msg = err.message;
        }

        setState("error-attachments");
        setErrorMessage(msg);
        toast.error("Photo upload failed", { description: msg });
      }
    },
    [invalidateQueries, router],
  );

  /**
   * Full submit: Step 1 (Create Request) -> Step 2 (Upload attachments if any).
   */
  const submitRequest = React.useCallback(
    async (values: ServiceRequestFormValues) => {
      // If request was already created, do not recreate it
      if (createdIdRef.current) {
        if (values.attachments && values.attachments.length > 0) {
          await uploadAttachmentsOnly(createdIdRef.current, values.attachments);
        }
        return;
      }

      setState("creating-request");
      setErrorMessage(null);

      let preferredAt: string;
      try {
        const datePart = values.preferredDate;
        const timePart = values.preferredTime || "09:00:00";
        preferredAt = new Date(`${datePart}T${timePart}`).toISOString();
      } catch {
        preferredAt = new Date().toISOString();
      }

      let newId: string;
      try {
        const res = await requestsService.createServiceRequest({
          categoryId: values.categoryId,
          title: values.title,
          description: values.description,
          address: values.address,
          preferredAt,
        });
        newId = res.id;
        createdIdRef.current = newId;
        setCreatedRequestId(newId);
      } catch (err: unknown) {
        let msg = "Failed to create service request";
        if (axios.isAxiosError(err)) {
          const resData = err.response?.data as {
            message?: string;
            errors?: string[];
          };
          msg = resData?.message || err.message || msg;
        } else if (err instanceof Error) {
          msg = err.message;
        }

        setState("error-create");
        setErrorMessage(msg);
        toast.error("Failed to create request", { description: msg });
        return;
      }

      // Step 2: Upload attachments if any
      if (values.attachments && values.attachments.length > 0) {
        await uploadAttachmentsOnly(newId, values.attachments);
      } else {
        setState("success");
        await invalidateQueries();
        toast.success("Request submitted", {
          description: "We will review it shortly.",
        });
        router.push(`/customer/requests/${newId}`);
        router.refresh();
      }
    },
    [uploadAttachmentsOnly, invalidateQueries, router],
  );

  const skipAttachments = React.useCallback(() => {
    if (!createdIdRef.current) return;
    invalidateQueries().then(() => {
      router.push(`/customer/requests/${createdIdRef.current}`);
      router.refresh();
    });
  }, [invalidateQueries, router]);

  const isBusy =
    state === "creating-request" || state === "uploading-attachments";

  return {
    state,
    createdRequestId,
    errorMessage,
    uploadProgress,
    isBusy,
    submitRequest,
    retryAttachments: (attachments: PickedImage[]) => {
      if (createdIdRef.current) {
        uploadAttachmentsOnly(createdIdRef.current, attachments);
      }
    },
    skipAttachments,
  };
}
