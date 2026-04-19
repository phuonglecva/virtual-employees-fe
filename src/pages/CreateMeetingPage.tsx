import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Bot, Check, PlusCircle } from "lucide-react";
import { useAgents } from "@/features/agents/hooks";
import { useCreateMeeting } from "@/features/meetings/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/app/store";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  problem_statement: z.string().min(1, "Problem statement is required"),
  objective: z.string().min(1, "Objective is required"),
  mode: z.enum(["round_robin", "decision_mode"]),
  participant_agent_ids: z.array(z.string()).min(1, "Select at least one participant"),
});

type FormValues = z.infer<typeof schema>;

export function CreateMeetingPage() {
  const navigate = useNavigate();
  const agentsQuery = useAgents();
  const createMutation = useCreateMeeting();
  const pushToast = useAppStore((state) => state.pushToast);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      problem_statement: "",
      objective: "",
      mode: "round_robin",
      participant_agent_ids: [],
    },
  });

  const selectedIds = watch("participant_agent_ids");
  const selectedAgents = useMemo(
    () => (agentsQuery.data ?? []).filter((agent) => selectedIds.includes(agent.id)),
    [agentsQuery.data, selectedIds],
  );

  useEffect(() => {
    if (selectedIds.length === 0 && agentsQuery.data?.length) {
      setValue("participant_agent_ids", [agentsQuery.data[0]!.id], { shouldValidate: true });
    }
  }, [agentsQuery.data, selectedIds.length, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    const meeting = await createMutation.mutateAsync(values);
    pushToast({
      title: "Meeting draft created",
      description: `"${meeting.title}" is ready to open.`,
      tone: "success",
    });
    navigate(`/meetings/${meeting.id}`);
  });

  const agents = agentsQuery.data ?? [];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Create meeting</CardTitle>
            <CardDescription>Set the room up before you bring the team in.</CardDescription>
          </div>
          <Badge tone="blue">Draft flow</Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4">
            <Field label="Title" error={errors.title?.message}>
              <Input {...register("title")} placeholder="Pricing reset for launch week" />
            </Field>
            <Field label="Problem statement" error={errors.problem_statement?.message}>
              <Textarea {...register("problem_statement")} placeholder="We need to..." />
            </Field>
            <Field label="Objective" error={errors.objective?.message}>
              <Input {...register("objective")} placeholder="Reach a concrete decision we can act on" />
            </Field>
            <Field label="Mode" error={errors.mode?.message}>
              <select
                className={cn(
                  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-950/40",
                )}
                {...register("mode")}
              >
                <option value="round_robin">Round robin</option>
                <option value="decision_mode">Decision mode</option>
              </select>
            </Field>
          </div>

          <div className="space-y-3">
            <Label>Participant agents</Label>
            {errors.participant_agent_ids?.message ? <p className="text-sm text-rose-600">{errors.participant_agent_ids.message}</p> : null}
            <div className="grid gap-3 md:grid-cols-2">
              {agentsQuery.isLoading ? (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Loading agents...
                </div>
              ) : (
                agents.map((agent) => {
                  const active = selectedIds.includes(agent.id);
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => {
                        const next = active ? selectedIds.filter((value) => value !== agent.id) : [...selectedIds, agent.id];
                        setValue("participant_agent_ids", next, { shouldValidate: true });
                      }}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all",
                        active
                          ? "border-blue-300 bg-blue-50 shadow-glow dark:border-blue-900 dark:bg-blue-950/40"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{agent.name}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{agent.role}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {active ? <Check className="inline h-3.5 w-3.5" /> : <PlusCircle className="inline h-3.5 w-3.5" />}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedAgents.map((agent) => (
                <Badge key={agent.id} tone="blue">
                  {agent.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" onClick={onSubmit} disabled={isSubmitting || createMutation.isPending}>
              <Bot className="h-4 w-4" />
              {createMutation.isPending ? "Creating..." : "Create meeting"}
            </Button>
            <Button variant="outline" type="button" onClick={() => navigate("/")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <div>
            <CardTitle>Preview</CardTitle>
            <CardDescription>What the founder will see in the room</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Title</p>
            <p className="mt-2 text-sm font-medium">{watch("title") || "Untitled meeting"}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Objective</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{watch("objective") || "No objective set yet."}</p>
          </div>
          <div className="rounded-3xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Selected agents will appear as chips and then join the live room in speaking order.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
