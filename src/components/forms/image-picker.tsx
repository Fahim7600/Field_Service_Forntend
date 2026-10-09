"use client";

import { AlertCircle, Upload, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";
import { validateImageFile } from "@/lib/uploads";
import { cn } from "@/lib/utils";

export interface PickedImage {
  id: string;
  file: File;
  previewUrl: string;
}

export interface ImagePickerProps {
  value: PickedImage[];
  onChange: (images: PickedImage[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  label?: string;
  existingCount?: number;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImagePicker({
  value = [],
  onChange,
  maxFiles = 5,
  disabled = false,
  label = "Attach photos",
  existingCount = 0,
  className,
}: ImagePickerProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const previewsRef = React.useRef<Set<string>>(new Set());

  // Track all preview URLs created to revoke them on unmount
  React.useEffect(() => {
    const currentPreviews = previewsRef.current;
    return () => {
      for (const url of currentPreviews) {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      }
      currentPreviews.clear();
    };
  }, []);

  const totalCurrentCount = value.length + existingCount;
  const availableSlots = Math.max(0, maxFiles - totalCurrentCount);
  const canAddMore = availableSlots > 0 && !disabled;

  const handleFiles = React.useCallback(
    (files: FileList | File[]) => {
      if (disabled) return;

      const fileList = Array.from(files);
      if (fileList.length === 0) return;

      if (availableSlots <= 0) {
        toast.warning(
          `Maximum limit of ${maxFiles} photo${maxFiles === 1 ? "" : "s"} reached.`,
        );
        return;
      }

      if (fileList.length > availableSlots) {
        toast.warning(
          `Only ${availableSlots} more photo${availableSlots === 1 ? "" : "s"} can be added. Extra files were ignored.`,
        );
      }

      const filesToProcess = fileList.slice(0, availableSlots);
      const newImages: PickedImage[] = [];

      for (const file of filesToProcess) {
        const validationError = validateImageFile(file);
        if (validationError) {
          toast.error(validationError);
          continue;
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const previewUrl = URL.createObjectURL(file);
        previewsRef.current.add(previewUrl);

        newImages.push({
          id,
          file,
          previewUrl,
        });
      }

      if (newImages.length > 0) {
        onChange([...value, ...newImages]);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [disabled, availableSlots, maxFiles, value, onChange],
  );

  const handleRemove = (idToRemove: string) => {
    if (disabled) return;
    const itemToRemove = value.find((item) => item.id === idToRemove);
    if (itemToRemove?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(itemToRemove.previewUrl);
      previewsRef.current.delete(itemToRemove.previewUrl);
    }
    const updated = value.filter((item) => item.id !== idToRemove);
    onChange(updated);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && canAddMore) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || !canAddMore) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor="image-picker-input"
            className="text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            {label}
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {totalCurrentCount}/{maxFiles} photos (max 5 MB each)
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
        id="image-picker-input"
        disabled={disabled || !canAddMore}
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
      />

      {/* Drop zone */}
      {canAddMore ? (
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
          aria-label="Upload photos dropzone"
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
            Click to browse or drag & drop photos
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            JPG, PNG, or WEBP up to 5 MB each
          </p>
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <AlertCircle className="h-4 w-4 shrink-0 text-slate-400" />
          <span>
            Maximum of {maxFiles} photo{maxFiles === 1 ? "" : "s"} attached.
          </span>
        </div>
      )}

      {/* Grid of selected images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
          {value.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-xs flex flex-col justify-between"
            >
              <Image
                src={item.previewUrl}
                alt={item.file.name}
                fill
                unoptimized
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                disabled={disabled}
                aria-label={`Remove ${item.file.name}`}
                className="absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:pointer-events-none"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* File details */}
              <div className="absolute bottom-0 inset-x-0 p-1.5 text-white z-10">
                <p className="text-[11px] font-medium truncate drop-shadow-xs">
                  {item.file.name}
                </p>
                <p className="text-[10px] text-slate-300 drop-shadow-xs">
                  {formatBytes(item.file.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
