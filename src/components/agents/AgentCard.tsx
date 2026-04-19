import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Agent } from "@/features/agents/types";

export function AgentCard({
  agent,
  onInspect,
}: {
  agent: Agent;
  onInspect: (agent: Agent) => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar name={agent.name} accent={agent.color as any} />
          <div>
            <CardTitle>{agent.name}</CardTitle>
            <CardDescription>{agent.role}</CardDescription>
          </div>
        </div>
        <Badge tone={agent.status === "active" ? "success" : agent.status === "idle" ? "warning" : "slate"}>{agent.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{agent.short_bio}</p>
        <p className="rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          {agent.speaking_style}
        </p>
        <Button variant="outline" className="w-full" onClick={() => onInspect(agent)}>
          View profile
        </Button>
      </CardContent>
    </Card>
  );
}
