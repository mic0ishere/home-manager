"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  RefreshCwIcon,
  ScrollTextIcon,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

interface DoorLogEntry {
  id: string | number;
  doorId?: string;
  door_id?: string;
  userEmail?: string;
  user_email?: string;
  userName?: string | null;
  user_name?: string | null;
  createdAt?: string | Date;
  created_at?: string | Date;
}

interface DoorLogsResponse {
  logs: DoorLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

function formatLogTimestamp(value?: string | Date) {
  if (!value) return "—";
  try {
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return String(value);
  }
}

export function DoorLogsSection() {
  const [page, setPage] = useState(1);
  const pageSize = 100;

  const { data, isPending, isFetching, isError, error, refetch } =
    useQuery<DoorLogsResponse>({
      queryKey: ["admin", "door-logs", page, pageSize],
      queryFn: async () => {
        const res = await fetch(
          `/api/admin/door-logs?page=${page}&limit=${pageSize}`,
        );
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to load logs");
        }
        return res.json();
      },
    });

  const logs = data?.logs ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const uniqueDoorIds = Array.from(
    new Set(logs.map((log) => log.doorId || log.door_id).filter(Boolean)),
  ).toSorted();
  const middleIndex = Math.floor(uniqueDoorIds.length / 2);
  const secondaryDoorColors = uniqueDoorIds.slice(0, middleIndex);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <h2 className="truncate text-sm font-semibold">Door Opening Logs</h2>

        <Button
          className="shrink-0"
          variant="outline"
          size="sm"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          <RefreshCwIcon
            className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Card className="p-0">
        <CardContent className="p-0">
          {isPending ? (
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Could not load door logs."}
            </div>
          ) : logs.length === 0 ? (
            <Empty className="m-0 rounded-none border-0 px-6 py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ScrollTextIcon />
                </EmptyMedia>
                <EmptyTitle>No log entries yet</EmptyTitle>
                <EmptyDescription>
                  Door opening events will appear here once doors are unlocked.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Time</th>
                      <th className="py-2.5 px-4 font-medium">Door</th>
                      <th className="py-2.5 px-4 font-medium">User</th>
                      <th className="py-2.5 px-4 font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {logs.map((log) => {
                      const doorId = log.doorId || log.door_id || "unknown";
                      const userEmail = log.userEmail || log.user_email || "";
                      const userName = log.userName || log.user_name || "—";
                      const createdAt = log.createdAt || log.created_at;

                      const doorColorVariant = secondaryDoorColors.includes(
                        doorId,
                      )
                        ? "secondary"
                        : "default";

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          <td className="py-2.5 px-4 text-muted-foreground font-mono whitespace-nowrap">
                            {formatLogTimestamp(createdAt)}
                          </td>
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <Badge
                              variant={doorColorVariant}
                              className="text-[10px] uppercase font-semibold tracking-wider"
                            >
                              {doorId} door
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 font-medium text-foreground whitespace-nowrap">
                            {userName}
                          </td>
                          <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                            {userEmail}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.total > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t p-3 text-xs text-muted-foreground">
                  <div>
                    Showing {(page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, pagination.total)} of{" "}
                    {pagination.total} entries
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1 || isFetching}
                    >
                      <ChevronLeftIcon className="size-3.5 mr-1" />
                      Previous
                    </Button>
                    <span className="px-2 text-xs">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages || isFetching}
                    >
                      Next
                      <ChevronRightIcon className="size-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
