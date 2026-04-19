import { Link } from "react-router-dom";
import { ArrowRight, Bot, CalendarPlus, Sparkles } from "lucide-react";
import { useAgents } from "@/features/agents/hooks";
import { useMeetings } from "@/features/meetings/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentCard } from "@/components/agents/AgentCard";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { Badge } from "@/components/ui/badge";

export function DashboardPage() {
  const agentsQuery = useAgents();
  const meetingsQuery = useMeetings();

  const agents = agentsQuery.data ?? [];
  const meetings = [...(meetingsQuery.data ?? [])].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white px-6 py-7 shadow-soft dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-[1.4fr_0.8fr] lg:px-8">
        <div className="space-y-4">
          <Badge tone="blue">Founder dashboard</Badge>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">Run focused meetings with your virtual team.</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
              Create a meeting, invite the right agents, and watch the discussion unfold in real time with summary and action items
              ready as soon as the room converges.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/meetings/new"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white shadow-glow transition-colors hover:bg-blue-700"
            >
              <CalendarPlus className="h-4 w-4" />
              Create meeting
            </Link>
            <Link
              to="/meetings"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              View meetings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <Card className="border-0 bg-slate-50 shadow-none dark:bg-slate-900">
          <CardHeader>
            <div>
              <CardTitle>Workspace status</CardTitle>
              <CardDescription>Everything you need at a glance</CardDescription>
            </div>
            <Sparkles className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <MetricTile label="Agents" value={agents.length.toString()} />
            <MetricTile label="Meetings" value={meetings.length.toString()} />
            <MetricTile label="Live" value={meetings.filter((meeting) => meeting.status === "live").length.toString()} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Virtual agents</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Pick participants based on the kind of guidance you need.</p>
          </div>
          <Link
            to="/agents"
            className="hidden h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 sm:inline-flex"
          >
            Manage agents
            <Bot className="h-4 w-4" />
          </Link>
        </div>

        {agentsQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        ) : agents.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {agents.slice(0, 3).map((agent) => (
              <AgentCard key={agent.id} agent={agent} onInspect={() => undefined} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-400">No agents available yet.</CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Recent meetings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Open a room, inspect the transcript, or continue a live discussion.</p>
          </div>
          <Badge tone="slate">Most recent first</Badge>
        </div>

        {meetingsQuery.isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : meetings.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {meetings.slice(0, 4).map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-400">No meetings yet. Start by creating a new meeting draft.</CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft dark:bg-slate-950">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
