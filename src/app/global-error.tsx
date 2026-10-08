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
    console.error("Global critical failure:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F3F4F6] text-[#111827] flex items-center justify-center p-4 sm:p-6 font-sans antialiased">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-xl">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-2xl ring-8 ring-red-50">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
              Critical System Failure
            </h1>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              A fatal client error occurred. Please reload the application to
              restore operations.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 bg-[#1F2937] text-white rounded-xl text-sm font-semibold hover:bg-[#111827] transition-all cursor-pointer shadow-sm"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="px-5 py-2.5 border border-[#E5E7EB] text-[#1F2937] rounded-xl text-sm font-semibold hover:bg-[#F9FAFB] transition-all cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
