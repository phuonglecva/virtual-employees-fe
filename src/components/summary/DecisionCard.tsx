import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MeetingSummary } from "@/features/meetings/types";

export function DecisionCard({ summary }: { summary?: MeetingSummary | null }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Decision</CardTitle>
          <CardDescription>What the team should move forward with</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <p className="text-base font-semibold">{summary.decision}</p>
            </div>
            <Badge tone="blue">Updated {new Date(summary.updated_at).toLocaleTimeString()}</Badge>
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No decision captured yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
