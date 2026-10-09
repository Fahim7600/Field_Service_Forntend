"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Wrench,
} from "lucide-react";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AccountDetailsForm } from "@/components/forms/account-details-form";
import { SecurityCard } from "@/components/forms/security-card";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api-client";
import { loadSkills, saveSkills } from "@/lib/skills-cache";
import { cn } from "@/lib/utils";
import {
  type TechnicianProfileFormValues,
  technicianProfileSchema,
} from "@/lib/validations/profile";
import { usersService } from "@/services/users.service";
import { useAuthStore } from "@/stores/auth-store";

const WEEKDAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

export function TechnicianProfileClient() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || "";

  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [selectedSkillIds, setSelectedSkillIds] = React.useState<string[]>([]);
  const [initialSkillIds, setInitialSkillIds] = React.useState<string[]>([]);
  const [hasSkillsCache, setHasSkillsCache] = React.useState(false);
  const [isSavingSkills, setIsSavingSkills] = React.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  // Load skills cache on mount when user is ready
  React.useEffect(() => {
    if (userId) {
      const cached = loadSkills(userId);
      if (cached && Array.isArray(cached)) {
        setSelectedSkillIds(cached);
        setInitialSkillIds(cached);
        setHasSkillsCache(true);
      } else {
        setHasSkillsCache(false);
      }
    }
  }, [userId]);

  // 1. Fetch available skills catalog
  const {
    data: skillsData,
    isLoading: isSkillsLoading,
    isError: isSkillsError,
    refetch: refetchSkills,
  } = useQuery({
    queryKey: ["skills", "catalog"],
    queryFn: () => usersService.fetchSkills({ limit: 50 }),
    staleTime: 60_000,
  });

  const availableSkills = skillsData?.data || [];

  // 2. Professional Profile Form
  const profileForm = useForm<TechnicianProfileFormValues>({
    resolver: zodResolver(technicianProfileSchema),
    mode: "onTouched",
    defaultValues: {
      bio: "",
      serviceArea: "",
      workingHours: {
        monday: { enabled: true, start: "08:00", end: "17:00" },
        tuesday: { enabled: true, start: "08:00", end: "17:00" },
        wednesday: { enabled: true, start: "08:00", end: "17:00" },
        thursday: { enabled: true, start: "08:00", end: "17:00" },
        friday: { enabled: true, start: "08:00", end: "17:00" },
        saturday: { enabled: false, start: "09:00", end: "14:00" },
        sunday: { enabled: false, start: "09:00", end: "14:00" },
      },
    },
  });

  const onSaveProfile = async (values: TechnicianProfileFormValues) => {
    try {
      setIsSavingProfile(true);

      const workingHoursPayload: Record<
        string,
        { start: string; end: string } | null
      > = {};
      for (const day of WEEKDAYS) {
        const d = values.workingHours[day.key];
        if (d?.enabled) {
          workingHoursPayload[day.key] = { start: d.start, end: d.end };
        } else {
          workingHoursPayload[day.key] = null;
        }
      }

      await usersService.updateTechnicianProfile({
        bio: values.bio?.trim() || undefined,
        serviceArea: values.serviceArea?.trim() || undefined,
        workingHours: workingHoursPayload,
      });

      profileForm.reset(values);
      toast.success("Professional profile saved", {
        description:
          "Your bio, service area, and working hours have been updated.",
      });
    } catch (err: unknown) {
      toast.error("Failed to save profile", {
        description: getErrorMessage(err),
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 3. Skills Checkbox Toggle (Max 10)
  const handleToggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) => {
      if (prev.includes(skillId)) {
        return prev.filter((id) => id !== skillId);
      }
      if (prev.length >= 10) {
        toast.warning("Maximum of 10 skills allowed.");
        return prev;
      }
      return [...prev, skillId];
    });
  };

  const isSkillsDirty =
    selectedSkillIds.length !== initialSkillIds.length ||
    selectedSkillIds.some((id) => !initialSkillIds.includes(id));

  const executeSaveSkills = async () => {
    if (selectedSkillIds.length === 0) {
      toast.warning("Please select at least one skill.");
      return;
    }

    try {
      setIsSavingSkills(true);
      const res = await usersService.updateTechnicianSkills(selectedSkillIds);
      const updatedIds = res.skills?.map((s) => s.id) || selectedSkillIds;

      setSelectedSkillIds(updatedIds);
      setInitialSkillIds(updatedIds);
      if (userId) {
        saveSkills(userId, updatedIds);
        setHasSkillsCache(true);
      }

      toast.success("Skills updated", {
        description: `Successfully assigned ${updatedIds.length} service skills.`,
      });
    } catch (err: unknown) {
      toast.error("Failed to update skills", {
        description: getErrorMessage(err),
      });
    } finally {
      setIsSavingSkills(false);
      setShowConfirmDialog(false);
    }
  };

  const onSaveSkillsClick = () => {
    if (selectedSkillIds.length === 0) {
      toast.warning("Select at least one skill.");
      return;
    }

    // If there is NO cache (unknown existing state), require confirmation
    if (!hasSkillsCache) {
      setShowConfirmDialog(true);
    } else {
      executeSaveSkills();
    }
  };

  const bioLength = profileForm.watch("bio")?.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technician Profile & Settings"
        description="Manage your account information, service specialties, and weekly dispatch availability."
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Left Column: Account Details & Security */}
        <div className="space-y-6">
          {/* Card 1: Account Details */}
          <AccountDetailsForm />

          {/* Card 4: Security */}
          <SecurityCard />
        </div>

        {/* Right Column: Professional Profile & Skills */}
        <div className="space-y-6">
          {/* Card 2: Professional Profile & Working Hours */}
          <Card className="border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="size-4 text-brand-600" />
                Professional Profile & Working Hours
              </CardTitle>
              <CardDescription>
                Configure your service bio, coverage area, and shift hours for
                dispatchers.
              </CardDescription>
            </CardHeader>

            <form onSubmit={profileForm.handleSubmit(onSaveProfile)}>
              <CardContent className="space-y-5 text-xs">
                {/* Bio */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tech-bio" className="text-xs font-semibold">
                      Professional Bio (Optional)
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      {bioLength}/1000 chars
                    </span>
                  </div>
                  <Textarea
                    id="tech-bio"
                    rows={3}
                    placeholder="Briefly describe your field certifications, expertise, and repair specialties..."
                    disabled={isSavingProfile}
                    {...profileForm.register("bio")}
                    className={cn(
                      profileForm.formState.errors.bio && "border-rose-500",
                    )}
                  />
                  {profileForm.formState.errors.bio && (
                    <p className="text-xs text-rose-500 font-medium">
                      {profileForm.formState.errors.bio.message}
                    </p>
                  )}
                </div>

                {/* Service Area */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="tech-service-area"
                    className="text-xs font-semibold"
                  >
                    Service Coverage Area (Optional)
                  </Label>
                  <Input
                    id="tech-service-area"
                    placeholder="e.g. Greater Seattle Metro, Bellevue, Redmond"
                    disabled={isSavingProfile}
                    {...profileForm.register("serviceArea")}
                    className={cn(
                      profileForm.formState.errors.serviceArea &&
                        "border-rose-500",
                    )}
                  />
                  {profileForm.formState.errors.serviceArea && (
                    <p className="text-xs text-rose-500 font-medium">
                      {profileForm.formState.errors.serviceArea.message}
                    </p>
                  )}
                </div>

                {/* Working Hours by Weekday */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Clock className="size-3.5 text-brand-600" />
                      Weekly Shift Hours (HH:mm)
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Enable the days you are available for automated job
                      dispatch.
                    </p>
                  </div>

                  <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                    {WEEKDAYS.map((day) => {
                      const dayValue = profileForm.watch(
                        `workingHours.${day.key}`,
                      );
                      const isEnabled = dayValue?.enabled ?? false;

                      return (
                        <div
                          key={day.key}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1.5 border-b border-border/40 last:border-0"
                        >
                          <div className="flex items-center gap-2.5 min-w-[110px]">
                            <Controller
                              control={profileForm.control}
                              name={`workingHours.${day.key}.enabled`}
                              render={({ field }) => (
                                <Switch
                                  id={`switch-${day.key}`}
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isSavingProfile}
                                />
                              )}
                            />
                            <Label
                              htmlFor={`switch-${day.key}`}
                              className="text-xs font-medium cursor-pointer"
                            >
                              {day.label}
                            </Label>
                          </div>

                          {isEnabled ? (
                            <div className="flex items-center gap-2 pl-9 sm:pl-0">
                              <Input
                                type="time"
                                disabled={isSavingProfile}
                                {...profileForm.register(
                                  `workingHours.${day.key}.start`,
                                )}
                                className="h-8 text-xs w-24"
                              />
                              <span className="text-muted-foreground text-xs">
                                to
                              </span>
                              <Input
                                type="time"
                                disabled={isSavingProfile}
                                {...profileForm.register(
                                  `workingHours.${day.key}.end`,
                                )}
                                className="h-8 text-xs w-24"
                              />
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic pl-9 sm:pl-0">
                              Off duty
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-border/80 pt-4 bg-muted/20">
                <span className="text-[11px] text-muted-foreground">
                  {profileForm.formState.isDirty
                    ? "Unsaved changes"
                    : "All changes saved"}
                </span>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={
                    !profileForm.formState.isDirty ||
                    !profileForm.formState.isValid ||
                    isSavingProfile
                  }
                  className="shadow-xs font-semibold text-xs gap-1.5"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      <span>Save Profile</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Card 3: Skills Selection Grid */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="size-4 text-brand-600" />
                  Service Skills & Certifications
                </CardTitle>
                <Badge variant="outline" className="text-xs font-mono">
                  {selectedSkillIds.length}/10 Selected
                </Badge>
              </div>
              <CardDescription>
                Select the service categories you are qualified to execute (1-10
                skills).
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              {/* Unknown existing state warning */}
              {!hasSkillsCache && (
                <Alert className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <AlertTitle className="font-semibold text-xs">
                    Skills Cache Not Found
                  </AlertTitle>
                  <AlertDescription className="text-[11px] pt-0.5 text-amber-800 dark:text-amber-300">
                    We cannot load your current skills from the server. Saving
                    replaces your whole skill list with exactly what you select
                    here.
                  </AlertDescription>
                </Alert>
              )}

              {/* Alert if 0 skills selected */}
              {selectedSkillIds.length === 0 && (
                <Alert className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <AlertTitle className="font-semibold text-xs">
                    No Skills Selected
                  </AlertTitle>
                  <AlertDescription className="text-[11px] pt-0.5 text-amber-800 dark:text-amber-300">
                    Select at least one skill. Without skills you will not
                    appear when the dispatcher assigns jobs.
                  </AlertDescription>
                </Alert>
              )}

              {/* Badges of current saved skills if cache exists */}
              {hasSkillsCache && initialSkillIds.length > 0 && (
                <div className="space-y-1.5 rounded-lg border border-border/80 bg-muted/20 p-3">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    Your current active skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {initialSkillIds.map((id) => {
                      const skillObj = availableSkills.find((s) => s.id === id);
                      return (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="text-[11px] font-medium"
                        >
                          {skillObj?.name || id}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Skills Loading */}
              {isSkillsLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              )}

              {/* Skills Error */}
              {isSkillsError && (
                <div className="p-4 text-center rounded-xl border border-destructive/30 bg-destructive/5 space-y-2">
                  <p className="text-xs text-destructive font-medium">
                    Failed to load available skills catalog.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => refetchSkills()}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="size-3 mr-1" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Skills Checkbox Card Grid */}
              {!isSkillsLoading &&
                !isSkillsError &&
                (availableSkills.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                    No system skills found in catalog.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSkills.map((skill) => {
                      const isSelected = selectedSkillIds.includes(skill.id);

                      return (
                        <label
                          key={skill.id}
                          htmlFor={`skill-${skill.id}`}
                          className={cn(
                            "relative flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 select-none",
                            isSelected
                              ? "border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 shadow-2xs"
                              : "border-border bg-card hover:bg-muted/30",
                          )}
                        >
                          <input
                            id={`skill-${skill.id}`}
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSkill(skill.id)}
                            disabled={isSavingSkills}
                            className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <span className="font-semibold text-foreground text-xs block truncate">
                              {skill.name}
                            </span>
                            {skill.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-2">
                                {skill.description}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ))}
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-border/80 pt-4 bg-muted/20">
              <span className="text-[11px] text-muted-foreground">
                {isSkillsDirty ? "Skill selection changed" : "Skills synced"}
              </span>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onSaveSkillsClick}
                disabled={
                  !isSkillsDirty ||
                  isSavingSkills ||
                  selectedSkillIds.length === 0
                }
                className="shadow-xs font-semibold text-xs gap-1.5"
              >
                {isSavingSkills ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Saving Skills...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    <span>Save Skills</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog for Unknown Cache Skills Save */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace all technician skills?</AlertDialogTitle>
            <AlertDialogDescription>
              We cannot retrieve your prior skill assignments from the server.
              Saving now will replace your entire skills list with the{" "}
              <strong>{selectedSkillIds.length}</strong> selected skill
              {selectedSkillIds.length === 1 ? "" : "s"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSavingSkills}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeSaveSkills}
              disabled={isSavingSkills}
            >
              {isSavingSkills ? "Replacing..." : "Yes, Replace Skills"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
