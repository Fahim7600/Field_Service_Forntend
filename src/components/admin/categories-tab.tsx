"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit2,
  FilterX,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";
import * as React from "react";

import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { QueryError } from "@/components/shared/query-error";
import {
  type ColumnDef,
  ResponsiveDataList,
} from "@/components/shared/responsive-data-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { extractArray } from "@/lib/extract-data";
import { formatMoney, safeFormatDate } from "@/lib/format";
import { messages, notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { catalogService } from "@/services/catalog.service";
import type { ServiceCategory, Skill } from "@/types/admin";

interface CategoriesTabProps {
  onSkillTabSwitch: () => void;
}

export function CategoriesTab({ onSkillTabSwitch }: CategoriesTabProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState("");

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editCategory, setEditCategory] =
    React.useState<ServiceCategory | null>(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<ServiceCategory | null>(null);

  // 1. Fetch Categories
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
    refetch: refetchCategories,
    isFetching: isCategoriesFetching,
  } = useQuery({
    queryKey: ["service-categories"],
    queryFn: () => catalogService.fetchCategories(),
    staleTime: 30000,
  });

  // 2. Fetch Skills for skill name lookups and category form
  const { data: skillsData } = useQuery({
    queryKey: ["skills"],
    queryFn: () => catalogService.fetchSkills(),
    staleTime: 60000,
  });

  const categories = extractArray<ServiceCategory>(categoriesData);
  const skills = extractArray<Skill>(skillsData);

  // Map of skillId to skillName for quick lookup
  const skillNameMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const skill of skills) {
      map.set(skill.id, skill.name);
    }
    return map;
  }, [skills]);

  // Client-side search filtering
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const q = searchTerm.toLowerCase().trim();
    return categories.filter((cat) => {
      const nameMatch = cat.name?.toLowerCase().includes(q);
      const skillName =
        skillNameMap.get(cat.skillId)?.toLowerCase() ||
        (typeof cat.skill === "object" && cat.skill?.name
          ? cat.skill.name.toLowerCase()
          : "");
      const skillMatch = skillName.includes(q);
      return nameMatch || skillMatch;
    });
  }, [categories, searchTerm, skillNameMap]);

  // Delete Category Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => catalogService.deleteCategory(id),
    onSuccess: () => {
      notify.success(
        messages.generic.deleted.title,
        messages.generic.deleted.description,
      );
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
    },
  });

  const columns: ColumnDef<ServiceCategory>[] = [
    {
      header: "Service Type",
      cell: (cat) => (
        <div className="space-y-0.5 min-w-[180px]">
          <span className="font-semibold text-sm text-foreground block">
            {cat.name}
          </span>
          {cat.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {cat.description}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Required Skill",
      className: "w-44",
      cell: (cat) => {
        const skillName =
          skillNameMap.get(cat.skillId) ||
          (typeof cat.skill === "object" && cat.skill?.name
            ? cat.skill.name
            : "Assigned Skill");
        return (
          <Badge
            variant="outline"
            className="text-xs font-medium bg-secondary/30 text-secondary-foreground border-border px-2.5 py-0.5 rounded-md flex items-center gap-1.5 w-fit"
          >
            <Wrench className="size-3 text-muted-foreground" />
            <span>{skillName}</span>
          </Badge>
        );
      },
    },
    {
      header: "Base Price",
      className: "w-32",
      cell: (cat) => (
        <span className="font-mono font-semibold text-sm text-foreground">
          {formatMoney(cat.basePriceCents)}
        </span>
      ),
    },
    {
      header: "Updated",
      className: "w-36 text-xs text-muted-foreground",
      cell: (cat) => safeFormatDate(cat.updatedAt || cat.createdAt),
    },
    {
      header: "Actions",
      className: "w-28 text-right",
      cell: (cat) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditCategory(cat)}
            className="rounded-lg text-muted-foreground hover:text-foreground"
            title="Edit service type"
          >
            <Edit2 className="size-3.5" />
            <span className="sr-only">Edit {cat.name}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleteTarget(cat)}
            className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Delete service type"
          >
            <Trash2 className="size-3.5" />
            <span className="sr-only">Delete {cat.name}</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Filter categories by name or skill..."
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
            onClick={() => refetchCategories()}
            disabled={isCategoriesFetching}
            className="h-9 px-3 shrink-0"
            title="Refresh categories"
          >
            <RefreshCw
              className={cn("size-3.5", isCategoriesFetching && "animate-spin")}
            />
            <span className="sr-only">Refresh categories</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-9 px-3.5 text-xs font-semibold shrink-0"
          >
            <Plus className="size-4 mr-1.5" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isCategoriesLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isCategoriesError && (
        <QueryError
          error={categoriesError}
          onRetry={() => refetchCategories()}
          title="Failed to load service categories"
        />
      )}

      {/* Categories Data List */}
      {!isCategoriesLoading && !isCategoriesError && (
        <ResponsiveDataList
          items={filteredCategories}
          keyExtractor={(item) => item.id}
          columns={columns}
          emptyState={
            <EmptyState
              icon={Layers}
              title={
                searchTerm
                  ? "No matching service types"
                  : "No service types yet"
              }
              description={
                searchTerm
                  ? "No categories match your search term. Try searching for another name or skill."
                  : "Get started by adding your first service type to the catalog."
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
                    Add Category
                  </Button>
                )
              }
            />
          }
          mobileCardRender={(cat) => {
            const skillName =
              skillNameMap.get(cat.skillId) ||
              (typeof cat.skill === "object" && cat.skill?.name
                ? cat.skill.name
                : "Assigned Skill");

            return (
              <Card className="p-4 border border-border bg-card shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <span className="font-bold text-sm text-foreground block truncate">
                      {cat.name}
                    </span>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditCategory(cat)}
                      className="rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(cat)}
                      className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-secondary/30 text-secondary-foreground border-border flex items-center gap-1"
                  >
                    <Wrench className="size-2.5 text-muted-foreground" />
                    <span>{skillName}</span>
                  </Badge>
                  <span className="font-mono font-bold text-foreground">
                    {formatMoney(cat.basePriceCents)}
                  </span>
                </div>
              </Card>
            );
          }}
        />
      )}

      {/* Create Dialog */}
      <CategoryFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        skills={skills}
        onSkillTabSwitch={onSkillTabSwitch}
      />

      {/* Edit Dialog */}
      <CategoryFormDialog
        open={!!editCategory}
        onOpenChange={(open) => !open && setEditCategory(null)}
        category={editCategory}
        skills={skills}
        onSkillTabSwitch={onSkillTabSwitch}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this service category?"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? Existing requests keep working but customers will no longer be able to book it.`
            : "The category will be removed."
        }
        confirmLabel="Delete Category"
        variant="destructive"
        pending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
      />
    </div>
  );
}
