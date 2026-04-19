import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeetings } from "@/features/meetings/hooks";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { Button } from "@/components/ui/button";

const filters = ["all", "draft", "live", "ended"] as const;

export function MeetingHistoryPage() {
  const meetingsQuery = useMeetings();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");

  const meetings = useMemo(() => {
    const list = [...(meetingsQuery.data ?? [])].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return filter === "all" ? list : list.filter((meeting) => meeting.status === filter);
  }, [filter, meetingsQuery.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="slate">Meeting history</Badge>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Track every room and outcome.</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Filter by status, revisit past discussions, and jump back into a room or summary.
          </p>
        </div>
        <Button onClick={() => navigate("/meetings/new")}>New meeting</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === value
                ? "bg-blue-600 text-white shadow-glow"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-900"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {meetingsQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : meetings.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No meetings match this filter</CardTitle>
            <CardDescription>Try a different status or create a new meeting draft.</CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      )}
    </div>
  );
}
