"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FilterX,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserCog,
  Users,
  UserX,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import {
  type ColumnDef,
  ResponsiveDataList,
} from "@/components/shared/responsive-data-list";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { getErrorMessage } from "@/lib/api-client";
import { extractArray } from "@/lib/extract-data";
import { safeFormatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminUsersService } from "@/services/admin-users.service";
import type {
  AdminUser,
  AdminUsersParams,
  UserRole,
  UserStatus,
} from "@/types/admin";

const ROLE_BADGES: Record<UserRole, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className:
      "bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 font-semibold",
  },
  TECHNICIAN: {
    label: "Technician",
    className:
      "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10 font-medium",
  },
  CUSTOMER: {
    label: "Customer",
    className:
      "border-muted-foreground/30 text-muted-foreground bg-muted font-normal",
  },
};

export function AdminUsersClient() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { filters, updateFilters, resetFilters } = useUrlFilters({
    page: 1,
    limit: 10,
  });

  const rawQ = (filters.q as string) || "";
  const [searchInput, setSearchInput] = React.useState(rawQ);

  // Keep local search input in sync if URL changes
  React.useEffect(() => {
    setSearchInput(rawQ);
  }, [rawQ]);

  // Debounce search update to URL (400ms)
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== rawQ) {
        updateFilters({ q: searchInput || undefined, page: 1 });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, rawQ, updateFilters]);

  const roleFilter = (filters.role as string) || "ALL";
  const statusFilter = (filters.status as string) || "ALL";
  const page = filters.page || 1;

  // Dialog & Modal state
  const [roleUser, setRoleUser] = React.useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<UserRole>("CUSTOMER");
  const [statusTarget, setStatusTarget] = React.useState<{
    user: AdminUser;
    nextStatus: UserStatus;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminUser | null>(
    null,
  );

  const queryParams: AdminUsersParams = {
    page,
    limit: 10,
    search: rawQ || undefined,
    role: roleFilter !== "ALL" ? (roleFilter as UserRole) : undefined,
    status: statusFilter !== "ALL" ? (statusFilter as UserStatus) : undefined,
    sortBy: "createdAt",
    order: "desc",
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-users", queryParams],
    queryFn: () => adminUsersService.fetchAdminUsers(queryParams),
    staleTime: 10000,
  });

  const users = extractArray<AdminUser>(data);
  const pagination = data?.pagination;
  const isFiltered = Boolean(
    rawQ || roleFilter !== "ALL" || statusFilter !== "ALL",
  );

  // Mutation: Change Role
  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) =>
      adminUsersService.changeUserRole(id, role),
    onSuccess: (updatedUser, variables) => {
      toast.success("Role Changed Successfully", {
        description: `${updatedUser?.name || "User"} is now assigned the ${variables.role} role.`,
        icon: <UserCog className="size-4 text-primary" />,
      });
      setRoleUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error("Failed to Update Role", {
        description: getErrorMessage(err),
        icon: <AlertCircle className="size-4 text-destructive" />,
      });
      refetch();
    },
  });

  // Mutation: Change Status
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: UserStatus }) =>
      adminUsersService.changeUserStatus(id, status),
    onSuccess: (updatedUser, variables) => {
      const isSuspended = variables.status === "SUSPENDED";
      toast.success(isSuspended ? "Account Suspended" : "Account Activated", {
        description: `${updatedUser?.name || "User"} account is now ${variables.status.toLowerCase()}.`,
        icon: isSuspended ? (
          <UserX className="size-4 text-destructive" />
        ) : (
          <UserCheck className="size-4 text-emerald-600" />
        ),
      });
      setStatusTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error("Status Update Failed", {
        description: getErrorMessage(err),
        icon: <AlertCircle className="size-4 text-destructive" />,
      });
      refetch();
    },
  });

  // Mutation: Soft Delete User
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => adminUsersService.deleteUser(id),
    onSuccess: () => {
      toast.success("User Deleted", {
        description:
          "The user account was soft-deleted and can no longer log in.",
        icon: <Trash2 className="size-4 text-destructive" />,
      });
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error("User Deletion Failed", {
        description: getErrorMessage(err),
        icon: <AlertCircle className="size-4 text-destructive" />,
      });
      refetch();
    },
  });

  const handleOpenRoleModal = (user: AdminUser) => {
    setRoleUser(user);
    setSelectedRole(user.role);
  };

  const columns: ColumnDef<AdminUser>[] = [
    {
      header: "User",
      cell: (user) => {
        const initials = user.name
          ? user.name
              .split(" ")
              .filter(Boolean)
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "U";
        const isSelf = currentUser?.id === user.id;

        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 rounded-full border border-border shrink-0">
              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground truncate">
                  {user.name}
                </span>
                {isSelf && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono font-semibold bg-muted text-foreground border-border py-0 px-1.5"
                  >
                    You
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Role",
      className: "w-36",
      cell: (user) => {
        const roleMeta = ROLE_BADGES[user.role] || {
          label: user.role,
          className: "bg-muted text-muted-foreground",
        };
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-2.5 py-0.5 rounded-md",
              roleMeta.className,
            )}
          >
            {roleMeta.label}
          </Badge>
        );
      },
    },
    {
      header: "Status",
      className: "w-32",
      cell: (user) => {
        const isActive = user.status === "ACTIVE";
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium gap-1.5 px-2.5 py-0.5 rounded-md",
              isActive
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                isActive ? "bg-emerald-500" : "bg-rose-500",
              )}
            />
            <span>{isActive ? "Active" : "Suspended"}</span>
          </Badge>
        );
      },
    },
    {
      header: "Joined",
      className: "w-36 text-xs text-muted-foreground",
      cell: (user) => safeFormatDate(user.createdAt),
    },
    {
      header: "Actions",
      className: "w-20 text-right",
      cell: (user) => {
        const isSelf = currentUser?.id === user.id;

        if (isSelf) {
          return (
            <span
              title="You cannot change your own account"
              className="text-[11px] text-muted-foreground font-mono italic px-2 cursor-not-allowed"
            >
              Self
            </span>
          );
        }

        const isActive = user.status === "ACTIVE";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Open actions</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Manage User</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleOpenRoleModal(user)}>
                <UserCog className="size-4 mr-2 text-primary" />
                <span>Change Role</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  setStatusTarget({
                    user,
                    nextStatus: isActive ? "SUSPENDED" : "ACTIVE",
                  })
                }
              >
                {isActive ? (
                  <>
                    <UserX className="size-4 mr-2 text-amber-600" />
                    <span>Suspend User</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="size-4 mr-2 text-emerald-600" />
                    <span>Activate User</span>
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => setDeleteTarget(user)}
              >
                <Trash2 className="size-4 mr-2" />
                <span>Delete Account</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 h-9 text-xs"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <Select
            value={roleFilter}
            onValueChange={(val) =>
              updateFilters({ role: val === "ALL" ? undefined : val, page: 1 })
            }
          >
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder="Role: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="CUSTOMER">Customer</SelectItem>
              <SelectItem value="TECHNICIAN">Technician</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) =>
              updateFilters({
                status: val === "ALL" ? undefined : val,
                page: 1,
              })
            }
          >
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder="Status: All" />
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
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <FilterX className="size-3.5 mr-1" />
              Reset
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 shrink-0"
            title="Refresh user list"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span className="sr-only">Refresh users</span>
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
          <CardContent className="space-y-3 p-0">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-destructive">
                Failed to load user directory
              </h3>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "An unexpected error occurred while loading users."}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Responsive Data List */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          <ResponsiveDataList
            items={users}
            keyExtractor={(item) => item.id}
            columns={columns}
            emptyState={
              <EmptyState
                icon={Users}
                title={isFiltered ? "No matching users" : "No users registered"}
                description={
                  isFiltered
                    ? "No users match your filter criteria. Try clearing search or filters."
                    : "There are currently no users in the system."
                }
                action={
                  isFiltered ? (
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  ) : undefined
                }
              />
            }
            mobileCardRender={(user) => {
              const isSelf = currentUser?.id === user.id;
              const roleMeta = ROLE_BADGES[user.role] || {
                label: user.role,
                className: "bg-muted text-muted-foreground",
              };
              const isActive = user.status === "ACTIVE";

              return (
                <Card className="p-4 border border-border bg-card shadow-2xs space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="size-8 rounded-full border border-border shrink-0">
                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-foreground truncate">
                            {user.name}
                          </span>
                          {isSelf && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono py-0 px-1"
                            >
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {!isSelf ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleOpenRoleModal(user)}
                          >
                            <UserCog className="size-4 mr-2 text-primary" />
                            <span>Change Role</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setStatusTarget({
                                user,
                                nextStatus: isActive ? "SUSPENDED" : "ACTIVE",
                              })
                            }
                          >
                            {isActive ? (
                              <>
                                <UserX className="size-4 mr-2 text-amber-600" />
                                <span>Suspend User</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="size-4 mr-2 text-emerald-600" />
                                <span>Activate User</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 className="size-4 mr-2" />
                            <span>Delete Account</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-[11px] text-muted-foreground font-mono italic">
                        Self
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px]", roleMeta.className)}
                      >
                        {roleMeta.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] gap-1",
                          isActive
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            isActive ? "bg-emerald-500" : "bg-rose-500",
                          )}
                        />
                        <span>{isActive ? "Active" : "Suspended"}</span>
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">
                      {safeFormatDate(user.createdAt)}
                    </span>
                  </div>
                </Card>
              );
            }}
          />

          {pagination && pagination.totalPages > 1 && (
            <PaginationControls
              meta={pagination}
              onPageChange={(p) => updateFilters({ page: p })}
            />
          )}
        </div>
      )}

      {/* Action 1: Change Role Dialog */}
      <Dialog
        open={!!roleUser}
        onOpenChange={(open) => {
          if (!roleMutation.isPending && !open) {
            setRoleUser(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="size-5 text-primary" />
              <span>Change User Role</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Reassign role for{" "}
              <strong className="text-foreground">{roleUser?.name}</strong> (
              {roleUser?.email}).
            </DialogDescription>
          </DialogHeader>

          {roleUser?.role === "ADMIN" && (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>
                Caution: This user is currently an Administrator. Changing their
                role will revoke full platform access.
              </span>
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="role-select" className="text-xs font-semibold">
                Select New Role
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(val) => setSelectedRole(val as UserRole)}
                disabled={roleMutation.isPending}
              >
                <SelectTrigger id="role-select" className="w-full">
                  <SelectValue placeholder="Choose role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">
                    Customer (Standard User)
                  </SelectItem>
                  <SelectItem value="TECHNICIAN">
                    Technician (Field Specialist)
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    Administrator (Full Access)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRole === "TECHNICIAN" && (
              <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2">
                <Shield className="size-4 shrink-0 mt-0.5 text-blue-600" />
                <span>
                  The user must set their skills and profile before they can be
                  assigned jobs.
                </span>
              </div>
            )}

            {selectedRole === "ADMIN" && (
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600" />
                <span>Admins have full access to all data and actions.</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose
              disabled={roleMutation.isPending}
              render={
                <Button
                  variant="outline"
                  size="sm"
                  disabled={roleMutation.isPending}
                >
                  Cancel
                </Button>
              }
            />
            <Button
              size="sm"
              disabled={
                roleMutation.isPending ||
                !roleUser ||
                selectedRole === roleUser.role
              }
              onClick={() => {
                if (roleUser) {
                  roleMutation.mutate({ id: roleUser.id, role: selectedRole });
                }
              }}
            >
              {roleMutation.isPending ? (
                <Loader2 className="size-4 animate-spin mr-1.5" />
              ) : (
                <CheckCircle2 className="size-4 mr-1.5" />
              )}
              <span>Save Role</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action 2: Suspend / Activate Alert Dialog */}
      <AlertDialog
        open={!!statusTarget}
        onOpenChange={(open) => {
          if (!statusMutation.isPending && !open) {
            setStatusTarget(null);
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {statusTarget?.nextStatus === "SUSPENDED" ? (
                <UserX className="size-5 text-amber-600" />
              ) : (
                <UserCheck className="size-5 text-emerald-600" />
              )}
              <span>
                {statusTarget?.nextStatus === "SUSPENDED"
                  ? "Suspend User Account"
                  : "Activate User Account"}
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs space-y-2">
              <span>
                Are you sure you want to{" "}
                {statusTarget?.nextStatus === "SUSPENDED"
                  ? "suspend"
                  : "activate"}{" "}
                <strong className="text-foreground">
                  {statusTarget?.user.name}
                </strong>{" "}
                ({statusTarget?.user.email})?
              </span>
              {statusTarget?.nextStatus === "SUSPENDED" && (
                <span className="block font-medium text-destructive pt-1">
                  Suspended users cannot log in.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {statusTarget?.user.role === "ADMIN" && (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>
                Caution: This user is an Administrator. Suspending this account
                will immediately lock their administrative privileges.
              </span>
            </div>
          )}

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={statusMutation.isPending}
              onClick={() => setStatusTarget(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={statusMutation.isPending || !statusTarget}
              onClick={(e) => {
                e.preventDefault();
                if (statusTarget) {
                  statusMutation.mutate({
                    id: statusTarget.user.id,
                    status: statusTarget.nextStatus,
                  });
                }
              }}
              className={
                statusTarget?.nextStatus === "SUSPENDED"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : undefined
              }
            >
              {statusMutation.isPending && (
                <Loader2 className="size-4 animate-spin mr-1.5" />
              )}
              <span>
                {statusTarget?.nextStatus === "SUSPENDED"
                  ? "Confirm Suspension"
                  : "Confirm Activation"}
              </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Action 3: Soft Delete Alert Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending && !open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              <span>Delete User Account</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs space-y-2">
              <span>
                Are you sure you want to delete{" "}
                <strong className="text-foreground">
                  {deleteTarget?.name}
                </strong>{" "}
                ({deleteTarget?.email})?
              </span>
              <span className="block font-medium text-foreground pt-1">
                This is a soft delete. The user will no longer be able to log
                in.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteTarget?.role === "ADMIN" && (
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5 text-destructive" />
              <span>
                Caution: Deleting an Administrator account impacts system
                governance. Ensure other active administrators remain.
              </span>
            </div>
          )}

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending || !deleteTarget}
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id);
                }
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="size-4 mr-1.5" />
              )}
              <span>Delete User</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
