"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

export interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  label?: string;
  onUploadingChange?: (isUploading: boolean) => void;
  className?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "uploading" | "error" | "done";
  errorMsg?: string;
  abortController?: AbortController;
}

export function ImageUploader({
  value = [],
  onChange,
  maxFiles = 5,
  disabled = false,
  label = "Upload images",
  onUploadingChange,
  className,
}: ImageUploaderProps) {
  const [inFlight, setInFlight] = React.useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // In-flight controllers tracking for unmount cleanup
  const activeControllersRef = React.useRef<Map<string, AbortController>>(
    new Map(),
  );

  const isUploadingAny = inFlight.some((f) => f.status === "uploading");

  React.useEffect(() => {
    onUploadingChange?.(isUploadingAny);
  }, [isUploadingAny, onUploadingChange]);

  // Clean up object URLs and abort pending on unmount
  React.useEffect(() => {
    return () => {
      for (const ctrl of activeControllersRef.current.values()) {
        ctrl.abort();
      }
      activeControllersRef.current.clear();
      for (const item of inFlight) {
        if (item.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.previewUrl);
        }
      }
    };
  }, [inFlight]);

  const processUpload = React.useCallback(
    async (fileObj: UploadingFile) => {
      const controller = new AbortController();
      activeControllersRef.current.set(fileObj.id, controller);

      setInFlight((prev) =>
        prev.map((item) =>
          item.id === fileObj.id
            ? {
                ...item,
                status: "uploading",
                progress: 0,
                errorMsg: undefined,
                abortController: controller,
              }
            : item,
        ),
      );

      try {
        const secureUrl = await uploadImageToCloudinary(fileObj.file, {
          signal: controller.signal,
          onProgress: (percent) => {
            setInFlight((prev) =>
              prev.map((item) =>
                item.id === fileObj.id ? { ...item, progress: percent } : item,
              ),
            );
          },
        });

        // Revoke blob URL
        if (fileObj.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(fileObj.previewUrl);
        }

        // Remove from in-flight and add to values
        activeControllersRef.current.delete(fileObj.id);
        setInFlight((prev) => prev.filter((item) => item.id !== fileObj.id));
        onChange([...value, secureUrl]);
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        activeControllersRef.current.delete(fileObj.id);
        const message =
          err instanceof Error ? err.message : "Upload failed unexpectedly";
        setInFlight((prev) =>
          prev.map((item) =>
            item.id === fileObj.id
              ? { ...item, status: "error", errorMsg: message }
              : item,
          ),
        );
      }
    },
    [value, onChange],
  );

  const handleFiles = React.useCallback(
    (files: FileList | File[]) => {
      if (disabled) return;

      const fileList = Array.from(files);
      const currentCount = value.length + inFlight.length;
      const availableSlots = maxFiles - currentCount;

      if (availableSlots <= 0) {
        toast.warning(
          `Maximum of ${maxFiles} image${maxFiles === 1 ? "" : "s"} reached`,
        );
        return;
      }

      if (fileList.length > availableSlots) {
        toast.warning(
          `Only ${availableSlots} more image${availableSlots === 1 ? "" : "s"} can be added. Extra files ignored.`,
        );
      }

      const filesToUpload = fileList.slice(0, availableSlots);

      for (const file of filesToUpload) {
        // Quick frontend check
        if (!file.type.startsWith("image/")) {
          toast.error(`"${file.name}" is not an image file.`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`"${file.name}" exceeds 5 MB limit.`);
          continue;
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const previewUrl = URL.createObjectURL(file);
        const newFileObj: UploadingFile = {
          id,
          file,
          previewUrl,
          progress: 0,
          status: "uploading",
        };

        setInFlight((prev) => [...prev, newFileObj]);
        processUpload(newFileObj);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [disabled, value.length, inFlight.length, maxFiles, processUpload],
  );

  const handleRemoveExisting = (indexToRemove: number) => {
    if (disabled) return;
    const newValues = value.filter((_, idx) => idx !== indexToRemove);
    onChange(newValues);
  };

  const handleRemoveInFlight = (id: string) => {
    const item = inFlight.find((f) => f.id === id);
    if (item) {
      if (item.abortController) {
        item.abortController.abort();
      }
      if (item.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }
      activeControllersRef.current.delete(id);
    }
    setInFlight((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRetry = (fileObj: UploadingFile) => {
    processUpload(fileObj);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const canAddMore = value.length + inFlight.length < maxFiles;

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor="image-upload-input"
            className="text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            {label}
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {value.length + inFlight.length}/{maxFiles} photos (max 5 MB each)
          </span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        id="image-upload-input"
        disabled={disabled || !canAddMore}
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
      />

      {/* Drop zone when slots remain */}
      {canAddMore && (
        <button
          type="button"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          aria-label="Upload images dropzone"
          className={cn(
            "group relative flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
            isDragging
              ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20"
              : "border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/40",
            disabled && "cursor-not-allowed opacity-60 pointer-events-none",
          )}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:scale-105 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/40 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-all">
            <Upload className="h-5 w-5" />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Click to upload or drag & drop
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            JPG, PNG, or WEBP up to 5 MB
          </p>
        </button>
      )}

      {/* Grid of uploaded and in-flight images */}
      {(value.length > 0 || inFlight.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
          {/* Successfully uploaded images */}
          {value.map((url, idx) => (
            <div
              key={url}
              className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm"
            >
              <Image
                src={url}
                alt={`Photo ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors pointer-events-none" />
              <button
                type="button"
                onClick={() => handleRemoveExisting(idx)}
                disabled={disabled}
                aria-label={`Remove photo ${idx + 1}`}
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Uploaded</span>
              </div>
            </div>
          ))}

          {/* In-flight uploading items */}
          {inFlight.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group relative aspect-square rounded-lg overflow-hidden border bg-slate-100 dark:bg-slate-900 shadow-sm",
                item.status === "error"
                  ? "border-rose-400 dark:border-rose-700 bg-rose-50/20"
                  : "border-slate-200 dark:border-slate-800",
              )}
            >
              <Image
                src={item.previewUrl}
                alt={item.file.name}
                fill
                unoptimized
                sizes="(max-width: 768px) 50vw, 25vw"
                className={cn(
                  "object-cover",
                  item.status === "uploading" && "opacity-60",
                )}
              />

              {item.status === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-2 text-white">
                  <Loader2 className="h-5 w-5 animate-spin text-white mb-1.5" />
                  <div className="w-full max-w-[80%] bg-white/30 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-500 h-full transition-all duration-150"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="mt-1 text-[10px] font-semibold text-white/90">
                    {item.progress}%
                  </span>
                </div>
              )}

              {item.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/80 p-2 text-white text-center">
                  <AlertCircle className="h-5 w-5 text-rose-400 mb-1" />
                  <p className="text-[11px] font-medium line-clamp-2 px-1 text-rose-200">
                    {item.errorMsg || "Upload failed"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => handleRetry(item)}
                      className="flex items-center gap-1 rounded bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-white/30 transition-colors"
                    >
                      <RefreshCw className="h-3 w-3" /> Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveInFlight(item.id)}
                      className="rounded bg-rose-600/80 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-rose-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {item.status === "uploading" && (
                <button
                  type="button"
                  onClick={() => handleRemoveInFlight(item.id)}
                  aria-label="Cancel upload"
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
