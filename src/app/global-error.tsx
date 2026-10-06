"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F3F4F6] text-[#111827] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-xl border border-[#E5E7EB] shadow-sm">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-2xl">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
              Critical Application Error
            </h1>
            <p className="text-sm text-[#4B5563]">
              A critical failure occurred. Please reload the page to restore
              functionality.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 bg-[#1F2937] text-white rounded-lg text-sm font-medium hover:bg-[#111827] transition-colors cursor-pointer"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="px-4 py-2 border border-[#E5E7EB] text-[#1F2937] rounded-lg text-sm font-medium hover:bg-[#F9FAFB] transition-colors cursor-pointer"
            >
              Reload application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
