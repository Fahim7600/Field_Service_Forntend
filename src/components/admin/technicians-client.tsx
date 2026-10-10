"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  FilterX,
  Phone,
  RefreshCw,
  Search,
  UserPlus,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import {
  type ColumnDef,
  ResponsiveDataList,
} from "@/components/shared/responsive-data-list";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useDebouncedSearchFilter,
  useUrlFilters,
} from "@/hooks/use-url-filters";
import { extractArray } from "@/lib/extract-data";
import { safeFormatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminUsersService } from "@/services/admin-users.service";
import type { AdminUser, AdminUsersParams, UserStatus } from "@/types/admin";

function getInitials(name: string): string {
  if (!name) return "TC";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TechniciansClient() {
  const { filters, updateFilters, resetFilters } = useUrlFilters({
    page: 1,
    limit: 10,
  });

  const { searchTerm, setSearchTerm } = useDebouncedSearchFilter("search", 400);

  const statusParam = (filters.status as string) || "ALL";
  const page = filters.page || 1;
  const isFiltered = Boolean(searchTerm || statusParam !== "ALL");

  const queryParams: AdminUsersParams = {
    page,
    limit: 10,
    role: "TECHNICIAN",
    search: searchTerm || undefined,
    status: statusParam !== "ALL" ? (statusParam as UserStatus) : undefined,
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-technicians", queryParams],
    queryFn: () => adminUsersService.fetchAdminUsers(queryParams),
    staleTime: 15000,
  });

  const technicians = extractArray<AdminUser>(data);
  const pagination = data?.pagination;

  const columns: ColumnDef<AdminUser>[] = [
    {
      id: "name",
      header: "Technician",
      cell: (tech) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8 rounded-full border border-border">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs font-heading">
              {getInitials(tech.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-foreground">{tech.name}</div>
            <div className="text-xs text-muted-foreground font-mono">
              ID: {tech.id.slice(0, 8)}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      cell: (tech) => (
        <span className="text-xs text-muted-foreground truncate block max-w-[200px]">
          {tech.email}
        </span>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      cell: (tech) => (
        <span className="text-xs text-muted-foreground">
          {tech.phone || "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (tech) => <StatusBadge status={tech.status} />,
    },
    {
      id: "createdAt",
      header: "Joined",
      cell: (tech) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {safeFormatDate(tech.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      className: "text-right",
      cell: (tech) => (
        <Link
          href={`/admin/technicians/${tech.id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-8 text-xs gap-1.5 shadow-2xs",
          )}
        >
          <span>View analytics</span>
          <ArrowRight className="size-3" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Technicians"
        description="Performance and availability of your field team."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/users"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 shadow-2xs",
              )}
            >
              <UserPlus className="size-3.5" />
              <span>Manage Roles</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1.5 shadow-2xs"
            >
              <RefreshCw
                className={cn("size-3.5", isFetching && "animate-spin")}
              />
              <span className="sr-only sm:not-sr-only">Refresh</span>
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-xl shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search technicians by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={statusParam}
            onValueChange={(val) => updateFilters({ status: val })}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <FilterX className="size-3.5 mr-1" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="hidden md:block rounded-xl border border-border bg-card p-4 space-y-3">
            {["tech-s1", "tech-s2", "tech-s3", "tech-s4", "tech-s5"].map(
              (key) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 py-2"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded" />
                </div>
              ),
            )}
          </div>
          <div className="md:hidden space-y-3">
            {["tech-m1", "tech-m2", "tech-m3"].map((key) => (
              <Skeleton key={key} className="h-36 rounded-xl" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Failed to Load Technicians"
          description={
            error instanceof Error
              ? error.message
              : "An unexpected error occurred while fetching technicians."
          }
          action={
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="size-3.5 mr-2" />
              <span>Retry</span>
            </Button>
          }
        />
      ) : technicians.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={isFiltered ? "No matching technicians" : "No technicians yet"}
          description={
            isFiltered
              ? "Try adjusting your search criteria or status filter."
              : "Promote a user on the Users page to assign field tasks."
          }
          action={
            isFiltered ? (
              <Button onClick={resetFilters} variant="outline" size="sm">
                <FilterX className="size-3.5 mr-2" />
                <span>Clear Filters</span>
              </Button>
            ) : (
              <Link
                href="/admin/users"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
              >
                <UserPlus className="size-3.5 mr-2" />
                <span>Go to Users</span>
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          <ResponsiveDataList
            items={technicians}
            keyExtractor={(tech) => tech.id}
            columns={columns}
            mobileCardRender={(tech) => (
              <Card className="border border-border bg-card p-4 shadow-2xs space-y-3">
                <CardContent className="p-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-full border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs font-heading">
                          {getInitials(tech.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm text-foreground">
                          {tech.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {tech.email}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={tech.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/50 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3 text-muted-foreground/70" />
                      <span>{tech.phone || "No phone"}</span>
                    </div>
                    <div className="text-right tabular-nums">
                      Joined {safeFormatDate(tech.createdAt)}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/admin/technicians/${tech.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full justify-center gap-1.5 text-xs shadow-2xs",
                      )}
                    >
                      <span>View analytics</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          />

          {pagination && pagination.totalPages > 1 && (
            <PaginationControls
              meta={pagination}
              onPageChange={(p) => updateFilters({ page: p })}
            />
          )}
        </div>
      )}
    </div>
  );
}
