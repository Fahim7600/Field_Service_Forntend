"use client";

import { useQuery } from "@tanstack/react-query";
import { FilterX, Info, Plus, RefreshCw, Search, Wrench } from "lucide-react";
import * as React from "react";

import { SkillFormDialog } from "@/components/admin/skill-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { QueryError } from "@/components/shared/query-error";
import {
  type ColumnDef,
  ResponsiveDataList,
} from "@/components/shared/responsive-data-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { extractArray } from "@/lib/extract-data";
import { safeFormatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { catalogService } from "@/services/catalog.service";
import type { Skill } from "@/types/admin";

export function SkillsTab() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const {
    data: skillsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["skills"],
    queryFn: () => catalogService.fetchSkills(),
    staleTime: 60000,
  });

  const skills = extractArray<Skill>(skillsData);

  const filteredSkills = React.useMemo(() => {
    if (!searchTerm.trim()) return skills;
    const q = searchTerm.toLowerCase().trim();
    return skills.filter((s) => s.name?.toLowerCase().includes(q));
  }, [skills, searchTerm]);

  const columns: ColumnDef<Skill>[] = [
    {
      header: "Skill Name",
      cell: (skill) => (
        <div className="flex items-center gap-2.5 min-w-[200px]">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Wrench className="size-4" />
          </div>
          <span className="font-semibold text-sm text-foreground">
            {skill.name}
          </span>
        </div>
      ),
    },
    {
      header: "Type",
      className: "w-36",
      cell: () => (
        <Badge
          variant="outline"
          className="text-xs bg-muted text-muted-foreground border-border"
        >
          Technician Skill
        </Badge>
      ),
    },
    {
      header: "Created",
      className: "w-44 text-xs text-muted-foreground",
      cell: (skill) => safeFormatDate(skill.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Information note about skill immutability in OpenAPI */}
      <Alert className="bg-muted/40 border-border text-xs py-2.5">
        <Info className="size-4 text-muted-foreground" />
        <AlertDescription className="text-muted-foreground text-xs">
          Skills cannot be renamed or removed after creation to preserve
          technician assignment and service history integrity.
        </AlertDescription>
      </Alert>

      {/* Tab Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search skills by name..."
            className="pl-9 h-9 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <FilterX className="size-3.5 mr-1" />
              Clear
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 shrink-0"
            title="Refresh skills"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span className="sr-only">Refresh skills</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-9 px-3.5 text-xs font-semibold shrink-0"
          >
            <Plus className="size-4 mr-1.5" />
            <span>Add Skill</span>
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error Card */}
      {isError && (
        <QueryError
          error={error}
          onRetry={() => refetch()}
          title="Failed to load skills catalog"
        />
      )}

      {/* Skills Data List */}
      {!isLoading && !isError && (
        <ResponsiveDataList
          items={filteredSkills}
          keyExtractor={(item) => item.id}
          columns={columns}
          emptyState={
            <EmptyState
              icon={Wrench}
              title={searchTerm ? "No matching skills" : "No skills yet"}
              description={
                searchTerm
                  ? "No skills match your search query."
                  : "Create technician skills so they can be assigned to categories and profiles."
              }
              action={
                searchTerm ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="size-4 mr-1.5" />
                    Add Skill
                  </Button>
                )
              }
            />
          }
          mobileCardRender={(skill) => (
            <Card className="p-4 border border-border bg-card shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Wrench className="size-4" />
                </div>
                <div>
                  <span className="font-semibold text-sm text-foreground block">
                    {skill.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Created {safeFormatDate(skill.createdAt)}
                  </span>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] bg-muted text-muted-foreground"
              >
                Skill
              </Badge>
            </Card>
          )}
        />
      )}

      {/* Create Skill Dialog */}
      <SkillFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
