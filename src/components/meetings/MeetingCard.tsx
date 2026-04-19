import { ArrowRight, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Meeting } from "@/features/meetings/types";

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle className="line-clamp-1">{meeting.title}</CardTitle>
          <CardDescription className="mt-2 line-clamp-2">{meeting.objective}</CardDescription>
        </div>
        <Badge tone={meeting.status === "live" || meeting.status === "active" ? "success" : meeting.status === "ended" ? "slate" : "warning"}>
          {meeting.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{meeting.problem_statement}</p>
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {formatRelativeTime(meeting.updated_at)}
          </span>
          <span>{meeting.participants.length} agents</span>
        </div>
        <Link
          to={`/meetings/${meeting.id}`}
          className={cn(
            "inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900",
          )}
        >
          Open room
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
