import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAgents } from "@/features/agents/hooks";
import { AgentCard } from "@/components/agents/AgentCard";
import { AgentDetailDialog } from "@/components/agents/AgentDetailDialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Agent } from "@/features/agents/types";
import { Badge } from "@/components/ui/badge";

export function AgentsPage() {
  const agentsQuery = useAgents();
  const [query, setQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const agents = useMemo(() => {
    const list = agentsQuery.data ?? [];
    return list.filter((agent) => {
      const haystack = `${agent.name} ${agent.role} ${agent.short_bio} ${agent.instruction_profile}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [agentsQuery.data, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="blue">Agent roster</Badge>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Inspect and test your virtual team.</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Review role profiles, verify instruction style, and quickly test how each agent would respond.
          </p>
        </div>
        <div className="w-full max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agents..." className="pl-9" />
          </div>
        </div>
      </div>

      {agentsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </div>
      ) : agents.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onInspect={setSelectedAgent} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No agents found</CardTitle>
            <CardDescription>Try a different search term or create a new agent through the API later.</CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      )}

      <AgentDetailDialog agent={selectedAgent} open={Boolean(selectedAgent)} onOpenChange={(open) => !open && setSelectedAgent(null)} />
    </div>
  );
}
