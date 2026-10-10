"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  FilterX,
  RefreshCw,
  ScrollText,
  Shield,
} from "lucide-react";
import * as React from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { QueryError } from "@/components/shared/query-error";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { diffValues, maskSensitive } from "@/lib/audit-diff";
import { extractArray } from "@/lib/extract-data";
import { safeFormatDateTime } from "@/lib/format";
import { humanizeEnum } from "@/lib/humanize";
import { messages, notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { adminLogsService } from "@/services/admin-logs.service";
import type { AuditLog, AuditLogParams } from "@/types/admin";

export function AuditLogsClient() {
  const { filters, updateFilters, resetFilters } = useUrlFilters({
    page: 1,
    limit: 20,
  });

  const actionFilter = (filters.action as string) || "";
  const entityFilter = (filters.entity as string) || "";
  const dateFrom = (filters.dateFrom as string) || "";
  const dateTo = (filters.dateTo as string) || "";
  const page = filters.page || 1;

  const [actionInput, setActionInput] = React.useState(actionFilter);
  const [entityInput, setEntityInput] = React.useState(entityFilter);

  const [expandedRowId, setExpandedRowId] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const [knownActions, setKnownActions] = React.useState<Set<string>>(
    () => new Set(["WORK_ORDER_ASSIGNED", "PAYMENT_SUCCEEDED"]),
  );
  const [knownEntities, setKnownEntities] = React.useState<Set<string>>(
    () => new Set(["WorkOrder", "Payment"]),
  );

  React.useEffect(() => {
    setActionInput(actionFilter);
  }, [actionFilter]);

  React.useEffect(() => {
    setEntityInput(entityFilter);
  }, [entityFilter]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedAction = actionInput.trim();
      const trimmedEntity = entityInput.trim();
      if (trimmedAction !== actionFilter || trimmedEntity !== entityFilter) {
        updateFilters({
          action: trimmedAction || undefined,
          entity: trimmedEntity || undefined,
          page: 1,
        });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [actionInput, entityInput, actionFilter, entityFilter, updateFilters]);

  const isFiltered = Boolean(
    actionFilter || entityFilter || dateFrom || dateTo,
  );

  const queryParams: AuditLogParams = {
    page,
    limit: 20,
    action: actionFilter || undefined,
    entity: entityFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-audit-logs", queryParams],
    queryFn: () => adminLogsService.fetchAuditLogs(queryParams),
    staleTime: 10000,
  });

  const logs = data?.items ?? extractArray<AuditLog>(data);
  const pagination = data?.meta ?? data?.pagination;

  React.useEffect(() => {
    if (logs && logs.length > 0) {
      setKnownActions((prev) => {
        let changed = false;
        const next = new Set(prev);
        for (const log of logs) {
          if (log.action && !next.has(log.action)) {
            next.add(log.action);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
      setKnownEntities((prev) => {
        let changed = false;
        const next = new Set(prev);
        for (const log of logs) {
          if (log.entity && !next.has(log.entity)) {
            next.add(log.entity);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }
  }, [logs]);

  const handleCopy = (id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      notify.success(
        messages.generic.copied.title,
        messages.generic.copied.description,
      );
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const handleDateChange = (fromVal: string, toVal: string) => {
    if (fromVal && toVal && new Date(fromVal) > new Date(toVal)) {
      notify.error("Invalid date range", "From date cannot be after to date.");
      return;
    }
    updateFilters({
      dateFrom: fromVal || undefined,
      dateTo: toVal || undefined,
      page: 1,
    });
  };

  const handleResetFilters = () => {
    setActionInput("");
    setEntityInput("");
    resetFilters();
  };

  return (
    <div className="space-y-6">
      <datalist id="audit-action-suggestions">
        {Array.from(knownActions).map((act) => (
          <option key={act} value={act} />
        ))}
      </datalist>

      <datalist id="audit-entity-suggestions">
        {Array.from(knownEntities).map((ent) => (
          <option key={ent} value={ent} />
        ))}
      </datalist>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
        <div className="flex flex-wrap items-start sm:items-center gap-3 flex-1">
          {/* Action Filter with Datalist */}
          <div className="flex flex-col gap-0.5">
            <Input
              list="audit-action-suggestions"
              placeholder="e.g. WORK_ORDER_ASSIGNED"
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              className="h-9 w-[190px] text-xs"
              aria-label="Action filter"
            />
            <span className="text-[10px] text-muted-foreground px-0.5">
              Exact value as stored
            </span>
          </div>

          {/* Entity Filter with Datalist */}
          <div className="flex flex-col gap-0.5">
            <Input
              list="audit-entity-suggestions"
              placeholder="e.g. WorkOrder"
              value={entityInput}
              onChange={(e) => setEntityInput(e.target.value)}
              className="h-9 w-[150px] text-xs"
              aria-label="Entity filter"
            />
            <span className="text-[10px] text-muted-foreground px-0.5">
              Exact value as stored
            </span>
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0 sm:pt-0 pb-3 sm:pb-0">
            <Calendar className="size-3.5" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateChange(e.target.value, dateTo)}
              aria-label="Filter from date"
              className="h-9 w-36 text-xs"
            />
            <span>to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => handleDateChange(dateFrom, e.target.value)}
              aria-label="Filter to date"
              className="h-9 w-36 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
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
            title="Refresh logs"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span className="sr-only">Refresh logs</span>
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <QueryError
          error={error}
          onRetry={() => refetch()}
          title="Failed to load audit logs"
        />
      )}

      {/* Audit Log Table & Expandable Cards */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          {logs.length === 0 ? (
            <EmptyState
              icon={ScrollText}
              title={
                isFiltered ? "No matching audit logs" : "No audit trail logs"
              }
              description={
                isFiltered
                  ? "No audit records match your current filter criteria."
                  : "System and administrative changes will appear here as they occur."
              }
              action={
                isFiltered ? (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-2.5">
              {/* Desktop & Mobile Responsive List */}
              {logs.map((log) => {
                const isExpanded = expandedRowId === log.id;
                const maskedOld = maskSensitive(log.oldValues);
                const maskedNew = maskSensitive(log.newValues);
                const diffs = diffValues(maskedOld, maskedNew);
                const actor = log.actor;
                const actorName =
                  actor?.name || (actor?.email ? actor.email : "System");
                const actorEmail =
                  actor?.name && actor?.email ? actor.email : null;
                const entityType = log.entity || "Entity";
                const shortEntityId = log.entityId
                  ? log.entityId.slice(0, 8)
                  : "-";
                const rowId = `audit-log-details-${log.id}`;

                return (
                  <Card
                    key={log.id}
                    className="border border-border bg-card shadow-2xs overflow-hidden transition-colors"
                  >
                    {/* Header Summary Row */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <Avatar className="size-8 rounded-full border border-border shrink-0 mt-0.5 sm:mt-0">
                          <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">
                            {actor?.name ? (
                              actor.name[0].toUpperCase()
                            ) : actor?.email ? (
                              actor.email[0].toUpperCase()
                            ) : (
                              <Shield className="size-3.5" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-sm text-foreground">
                              {actorName}
                            </span>
                            {actorEmail && (
                              <span className="text-xs text-muted-foreground font-normal">
                                {actorEmail}
                              </span>
                            )}
                            <Badge
                              variant="outline"
                              className="text-[11px] font-semibold bg-primary/10 text-primary border-primary/20"
                            >
                              {humanizeEnum(log.action)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              Target:{" "}
                              <strong className="text-foreground">
                                {entityType}
                              </strong>{" "}
                              (
                              <span className="font-mono">{shortEntityId}</span>
                              )
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {safeFormatDateTime(log.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRow(log.id)}
                          aria-expanded={isExpanded}
                          aria-controls={rowId}
                          className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          <span>
                            {isExpanded ? "Hide Details" : "View Details"}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="size-3.5 ml-1" />
                          ) : (
                            <ChevronDown className="size-3.5 ml-1" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Details Panel */}
                    {isExpanded && (
                      <div
                        id={rowId}
                        className="border-t border-border/80 bg-muted/20 p-4 space-y-4 text-xs animate-in fade-in-50 duration-150"
                      >
                        {/* Target Entity Details & IP */}
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-card border border-border">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                Full Entity ID:
                              </span>
                              <code className="font-mono font-semibold text-foreground select-all">
                                {log.entityId}
                              </code>
                            </div>
                            {log.ipAddress && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <span>•</span>
                                <span>IP:</span>
                                <code className="font-mono text-foreground font-medium">
                                  {log.ipAddress}
                                </code>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(log.entityId)}
                            className="h-7 text-[11px] px-2"
                          >
                            {copiedId === log.entityId ? (
                              <Check className="size-3 text-emerald-600 mr-1" />
                            ) : (
                              <Copy className="size-3 mr-1" />
                            )}
                            <span>
                              {copiedId === log.entityId ? "Copied" : "Copy ID"}
                            </span>
                          </Button>
                        </div>

                        {/* Diff List */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide">
                            Recorded Field Changes
                          </h4>
                          {diffs.length === 0 ? (
                            <p className="text-muted-foreground italic text-xs">
                              No specific field delta recorded.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {diffs.map((d) => (
                                <div
                                  key={d.field}
                                  className="p-2.5 rounded-lg bg-card border border-border space-y-1"
                                >
                                  <span className="font-mono font-semibold text-foreground text-[11px] block">
                                    {d.field}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className="text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded font-mono break-all line-through">
                                      {d.from}
                                    </span>
                                    <span className="text-muted-foreground">
                                      →
                                    </span>
                                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono break-all font-semibold">
                                      {d.to}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Collapsed Raw JSON Data */}
                        <details className="group rounded-lg border border-border bg-card p-3">
                          <summary className="font-semibold text-xs text-muted-foreground group-open:text-foreground cursor-pointer select-none">
                            Raw Audit Payload (JSON)
                          </summary>
                          <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-muted-foreground block">
                                Before (oldValues)
                              </span>
                              <pre className="p-2.5 rounded bg-muted/50 font-mono text-[11px] max-h-56 overflow-auto whitespace-pre-wrap break-all">
                                {maskedOld
                                  ? JSON.stringify(maskedOld, null, 2)
                                  : "null"}
                              </pre>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-muted-foreground block">
                                After (newValues)
                              </span>
                              <pre className="p-2.5 rounded bg-muted/50 font-mono text-[11px] max-h-56 overflow-auto whitespace-pre-wrap break-all">
                                {maskedNew
                                  ? JSON.stringify(maskedNew, null, 2)
                                  : "null"}
                              </pre>
                            </div>
                          </div>
                        </details>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

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
