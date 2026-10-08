"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
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
import { Select, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { getErrorMessage } from "@/lib/api-client";
import { extractArray } from "@/lib/extract-data";
import { formatSafeDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import type { UserListItem, UsersQueryParams } from "@/types/api";
import type { Role } from "@/types/auth";

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className:
      "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
  },
  TECHNICIAN: {
    label: "Technician",
    className:
      "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  },
  CUSTOMER: {
    label: "Customer",
    className:
      "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30",
  },
};

export function AdminUsersClient() {
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuth();
  const { filters, updateFilters } = useUrlFilters();

  const roleFilter = (filters.role as string) || "ALL";
  const searchParam = (filters.search as string) || "";
  const page = filters.page || 1;

  const [searchInput, setSearchInput] = React.useState(searchParam);

  // Dialog states
  const [roleUser, setRoleUser] = React.useState<UserListItem | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<Role>("CUSTOMER");
  const [deleteUserTarget, setDeleteUserTarget] =
    React.useState<UserListItem | null>(null);

  const queryParams: UsersQueryParams = {
    page,
    limit: 10,
    search: searchParam || undefined,
    role: roleFilter !== "ALL" ? roleFilter : undefined,
    sortBy: "createdAt",
    order: "desc",
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-users", queryParams],
    queryFn: () => adminService.fetchUsers(queryParams),
    staleTime: 10000,
  });

  const users = extractArray<UserListItem>(data);
  const pagination = data?.pagination;

  // Mutation: Change Role
  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) =>
      adminService.updateUserRole(id, { role }),
    onSuccess: (updatedUser, variables) => {
      toast.success("User Role Updated", {
        description: `${updatedUser.name || "User"} has been reassigned to the ${variables.role} role.`,
        icon: <UserCog className="size-4 text-primary" />,
      });
      setRoleUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error("Role Update Failed", {
        description: getErrorMessage(err),
        icon: <AlertCircle className="size-4 text-destructive" />,
      });
    },
  });

  // Mutation: Change Status (Suspend/Activate)
  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "ACTIVE" | "SUSPENDED";
    }) => adminService.updateUserStatus(id, { status }),
    onSuccess: (updatedUser, variables) => {
      const isSuspending = variables.status === "SUSPENDED";
      toast.success(
        isSuspending ? "User Account Suspended" : "User Account Activated",
        {
          description: `${updatedUser.name || "User"} account status is now ${variables.status}.`,
          icon: isSuspending ? (
            <UserX className="size-4 text-destructive" />
          ) : (
            <UserCheck className="size-4 text-emerald-600" />
          ),
        },
      );
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error("Status Update Failed", {
        description: getErrorMessage(err),
        icon: <AlertCircle className="size-4 text-destructive" />,
      });
    },
  });

  // Mutation: Delete User
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      toast.success("User Account Deleted", {
        description: "The user has been permanently removed from the system.",
        icon: <Trash2 className="size-4 text-destructive" />,
      });
      setDeleteUserTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error("User Deletion Failed", {
        description: getErrorMessage(err),
        icon: <AlertCircle className="size-4 text-destructive" />,
      });
    },
  });

  const handleRoleTabChange = (val: string) => {
    updateFilters({ role: val === "ALL" ? undefined : val, page: 1 });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined, page: 1 });
  };

  const handleOpenRoleModal = (user: UserListItem) => {
    setRoleUser(user);
    setSelectedRole(user.role as Role);
  };

  const columns: ColumnDef<UserListItem>[] = [
    {
      header: "User",
      cell: (user) => {
        const initials = user.name
          ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "U";
        const isSelf = currentAdmin?.id === user.id;

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
                    className="text-[10px] font-mono text-muted-foreground border-border py-0 px-1"
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
      className: "w-32",
      cell: (user) => {
        const roleMeta = ROLE_BADGES[user.role] || {
          label: user.role,
          className: "bg-muted text-muted-foreground",
        };
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold px-2 py-0.5",
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
              "text-xs font-medium gap-1.5 px-2 py-0.5",
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
            <span>{user.status}</span>
          </Badge>
        );
      },
    },
    {
      header: "Joined",
      className: "w-36 text-xs text-muted-foreground",
      cell: (user) => formatSafeDate(user.createdAt),
    },
    {
      header: "Actions",
      className: "w-20 text-right",
      cell: (user) => {
        const isSelf = currentAdmin?.id === user.id;

        if (isSelf) {
          return (
            <span className="text-[11px] text-muted-foreground font-mono italic">
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
                  statusMutation.mutate({
                    id: user.id,
                    status: isActive ? "SUSPENDED" : "ACTIVE",
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
                onClick={() => setDeleteUserTarget(user)}
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
      {/* Header Controls & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs
          value={roleFilter}
          onValueChange={handleRoleTabChange}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="ALL">All Roles</TabsTrigger>
            <TabsTrigger value="CUSTOMER">Customers</TabsTrigger>
            <TabsTrigger value="TECHNICIAN">Technicians</TabsTrigger>
            <TabsTrigger value="ADMIN">Admins</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 sm:w-72 relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9 h-9 text-xs"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 shrink-0"
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

      {/* Error Card */}
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
                  : "An unexpected error occurred while fetching accounts."}
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
                title="No users found"
                description={
                  searchParam || roleFilter !== "ALL"
                    ? "No accounts match your filter criteria. Try adjusting the query."
                    : "No user accounts are registered yet."
                }
              />
            }
            mobileCardRender={(user) => {
              const isSelf = currentAdmin?.id === user.id;
              const roleMeta = ROLE_BADGES[user.role] || {
                label: user.role,
                className: "bg-muted text-muted-foreground",
              };
              const isActive = user.status === "ACTIVE";

              return (
                <Card className="p-4 border border-border bg-card shadow-2xs space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-sm text-foreground truncate">
                        {user.name}
                      </span>
                      {isSelf && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono text-muted-foreground"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold",
                          roleMeta.className,
                        )}
                      >
                        {roleMeta.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold gap-1",
                          isActive
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            isActive ? "bg-emerald-500" : "bg-rose-500",
                          )}
                        />
                        <span>{user.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
                    <span className="truncate">{user.email}</span>
                    <span className="shrink-0">
                      {formatSafeDate(user.createdAt)}
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

      {/* Dialog 1: Change Role Modal */}
      <Dialog
        open={!!roleUser}
        onOpenChange={(open) => !open && setRoleUser(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="size-5 text-primary" />
              <span>Change User Role</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select a new organizational role for{" "}
              <strong className="text-foreground">{roleUser?.name}</strong> (
              {roleUser?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="role-select" className="text-xs font-semibold">
                Assigned Role
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(val) => setSelectedRole(val as Role)}
              >
                <SelectItem value="CUSTOMER">
                  Customer (Standard User)
                </SelectItem>
                <SelectItem value="TECHNICIAN">
                  Technician (Field Specialist)
                </SelectItem>
                <SelectItem value="ADMIN">
                  Administrator (Full Access)
                </SelectItem>
              </Select>
            </div>

            {selectedRole === "ADMIN" && (
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>
                  Granting Admin privileges gives this user full platform
                  access, dispatch control, and billing settings.
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose
              render={
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              }
            />
            <Button
              size="sm"
              disabled={roleMutation.isPending || !roleUser}
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
              <span>Confirm Role Change</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Delete Confirmation Modal */}
      <Dialog
        open={!!deleteUserTarget}
        onOpenChange={(open) => !open && setDeleteUserTarget(null)}
      >
        <DialogContent className="sm:max-w-md border-destructive/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              <span>Delete User Account</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                {deleteUserTarget?.name}
              </strong>
              ? This action cannot be undone and will permanently remove their
              access.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive text-xs space-y-1">
            <p className="font-semibold">Destructive Operation</p>
            <p className="text-muted-foreground">
              All linked session tokens will be invalidated immediately.
              Historical work orders will remain attached for audit purposes.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose
              render={
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              }
            />
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending || !deleteUserTarget}
              onClick={() => {
                if (deleteUserTarget) {
                  deleteMutation.mutate(deleteUserTarget.id);
                }
              }}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="size-4 mr-1.5" />
              )}
              <span>Permanently Delete</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
