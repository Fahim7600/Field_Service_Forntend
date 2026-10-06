"use client";

import { BellRing, CheckCircle2, Flame, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header bar with gradient line */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-sm">
              <Wrench className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-charcoal-900">
                FieldServe
              </h1>
              <p className="text-xs text-charcoal-600">
                Field Service Management Platform
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
            v0.1.0 Initial Setup
          </Badge>
        </div>
        <div className="gradient-line w-full" />
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-charcoal-900">
            Design System & Component Verification
          </h2>
          <p className="text-sm text-charcoal-600">
            Industrial Amber Theme tokens, shadcn/ui components, and API proxy
            verification.
          </p>
        </div>

        {/* Color Palette Grid */}
        <Card className="border border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg text-charcoal-900">
              Color Tokens & Swatches
            </CardTitle>
            <CardDescription className="text-charcoal-600">
              Industrial amber palette, charcoal scale, and high-contrast
              surface definitions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Brand Colors */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-3">
                Brand Amber / Safety Orange
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-lg p-3 bg-brand-500 text-white shadow-xs">
                  <div className="font-semibold text-sm">brand-500</div>
                  <div className="text-xs opacity-90">#F97316</div>
                </div>
                <div className="rounded-lg p-3 bg-brand-600 text-white shadow-xs">
                  <div className="font-semibold text-sm">brand-600</div>
                  <div className="text-xs opacity-90">#EA580C</div>
                </div>
                <div className="rounded-lg p-3 bg-brand-700 text-white shadow-xs">
                  <div className="font-semibold text-sm">brand-700</div>
                  <div className="text-xs opacity-90">#C2410C</div>
                </div>
                <div className="rounded-lg p-3 bg-terracotta text-white shadow-xs">
                  <div className="font-semibold text-sm">terracotta</div>
                  <div className="text-xs opacity-90">#A8442A</div>
                </div>
              </div>
            </div>

            {/* Charcoal Scale */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-3">
                Charcoal Scale
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-lg p-3 bg-charcoal-900 text-white shadow-xs">
                  <div className="font-semibold text-sm">charcoal-900</div>
                  <div className="text-xs text-ash">#111827</div>
                </div>
                <div className="rounded-lg p-3 bg-charcoal-800 text-white shadow-xs">
                  <div className="font-semibold text-sm">charcoal-800</div>
                  <div className="text-xs text-ash">#1F2937 (Primary)</div>
                </div>
                <div className="rounded-lg p-3 bg-charcoal-600 text-white shadow-xs">
                  <div className="font-semibold text-sm">charcoal-600</div>
                  <div className="text-xs text-ash">#4B5563</div>
                </div>
                <div className="rounded-lg p-3 bg-ash text-charcoal-900 shadow-xs">
                  <div className="font-semibold text-sm">ash</div>
                  <div className="text-xs opacity-80">#9CA3AF</div>
                </div>
              </div>
            </div>

            {/* Surfaces */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-3">
                Surfaces & Borders
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-lg p-3 bg-background border border-border text-charcoal-900">
                  <div className="font-semibold text-sm">app background</div>
                  <div className="text-xs text-charcoal-600">#F3F4F6</div>
                </div>
                <div className="rounded-lg p-3 bg-panel border border-border text-charcoal-900">
                  <div className="font-semibold text-sm">panel background</div>
                  <div className="text-xs text-charcoal-600">#F9FAFB</div>
                </div>
                <div className="rounded-lg p-3 bg-card border border-border text-charcoal-900">
                  <div className="font-semibold text-sm">card surface</div>
                  <div className="text-xs text-charcoal-600">#FFFFFF</div>
                </div>
                <div className="rounded-lg p-3 bg-border text-charcoal-900">
                  <div className="font-semibold text-sm">border</div>
                  <div className="text-xs text-charcoal-600">#E5E7EB</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive UI Components Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Button Variants & Actions */}
          <Card className="border border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg text-charcoal-900">
                Button Variants & CTA Rule
              </CardTitle>
              <CardDescription className="text-charcoal-600">
                Default charcoal primary buttons vs. exclusive CTA amber
                gradient.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Default Charcoal Button */}
                <Button variant="default">Charcoal Default Button</Button>

                {/* Orange CTA Button */}
                <Button variant="cta">
                  <Flame className="w-4 h-4 mr-1.5" /> Book Service (CTA)
                </Button>

                {/* Outline Button */}
                <Button variant="outline">Outline Button</Button>
              </div>

              <Separator />

              {/* Toast Trigger */}
              <div>
                <p className="text-xs font-semibold text-charcoal-600 mb-2">
                  Sonner Toast Notification
                </p>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    toast.success("Sonner Notification", {
                      description:
                        "FieldServe system notifications are operational.",
                      icon: <CheckCircle2 className="w-4 h-4 text-brand-600" />,
                    })
                  }
                >
                  <BellRing className="w-4 h-4 mr-2 text-charcoal-600" />
                  Fire Sonner Toast
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Badges and Skeletons */}
          <Card className="border border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg text-charcoal-900">
                Badges & Loading Skeletons
              </CardTitle>
              <CardDescription className="text-charcoal-600">
                Status indicators and placeholder states.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Badges */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-charcoal-600">
                  Badges
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default Badge</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline Status</Badge>
                </div>
              </div>

              <Separator />

              {/* Skeletons */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-charcoal-600">
                  Skeleton Placeholders
                </p>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-panel border-t border-border text-xs text-charcoal-600 py-3">
              Theme initialized with Inter typography and industrial amber
              tokens.
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
