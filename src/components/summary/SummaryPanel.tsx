import { CheckCircle2, ListTodo } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { MeetingSummary } from "@/features/meetings/types";

export function SummaryPanel({ summary }: { summary?: MeetingSummary | null }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Live Summary</CardTitle>
          <CardDescription>Updated as the discussion evolves</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary ? (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Overview</p>
              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{summary.overview}</p>
            </div>
            <Separator />
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Decision</p>
              </div>
              <p className="mt-2 text-sm font-medium leading-6">{summary.decision}</p>
              {summary.rationale ? <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{summary.rationale}</p> : null}
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Key points</p>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {summary.key_points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Action items</p>
              </div>
              <div className="space-y-2">
                {summary.action_items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Owner: {item.owner}</p>
                      </div>
                      <Badge tone={item.priority === "high" ? "destructive" : item.priority === "medium" ? "warning" : "slate"}>
                        {item.priority}
                      </Badge>
                    </div>
                    {item.due_date ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Due {item.due_date}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Live summary will appear here once the discussion produces enough signal.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
