import { useEffect, useState } from "react";
import { BrainCircuit, TestTube2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Agent } from "@/features/agents/types";
import { useTestAgent } from "@/features/agents/hooks";
import { useAppStore } from "@/app/store";

export function AgentDetailDialog({
  agent,
  open,
  onOpenChange,
}: {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const testMutation = useTestAgent();
  const { mutateAsync, isPending, data, reset } = testMutation;
  const pushToast = useAppStore((state) => state.pushToast);

  useEffect(() => {
    if (open) {
      setPrompt("");
      reset();
    }
  }, [open, reset]);

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={agent.name} description={agent.short_bio}>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar name={agent.name} accent={agent.color as any} className="h-12 w-12" />
              <div>
                <CardTitle>{agent.role}</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">{agent.speaking_style}</p>
              </div>
            </div>
            <Badge tone={agent.status === "active" ? "success" : agent.status === "idle" ? "warning" : "slate"}>{agent.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Instruction profile</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">{agent.instruction_profile}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Profile notes</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  Designed for founder-facing meeting orchestration.
                </li>
                <li className="flex items-start gap-2">
                  <BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  Used in round-robin or decision-mode meetings.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask the agent a question..."
            />
            <Button
              className="w-full"
              disabled={!prompt.trim() || isPending}
              onClick={async () => {
                if (!prompt.trim()) return;
                const result = await mutateAsync({ agentId: agent.id, input: { prompt } });
                pushToast({
                  title: "Agent test complete",
                  description: result.response,
                  tone: "success",
                });
              }}
            >
              <TestTube2 className="h-4 w-4" />
              {isPending ? "Testing..." : "Run test"}
            </Button>

            {data ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Response</p>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{data.response}</p>
                <Badge tone="blue" className="mt-3">
                  Confidence {Math.round(data.confidence * 100)}%
                </Badge>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </Dialog>
  );
}
