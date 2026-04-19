import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAgent, getAgent, listAgents, patchAgent, testAgent } from "./api";
import type { Agent, AgentTestRequest } from "./types";

export const agentKeys = {
  all: ["agents"] as const,
  lists: () => [...agentKeys.all, "list"] as const,
  list: () => [...agentKeys.lists()] as const,
  details: () => [...agentKeys.all, "detail"] as const,
  detail: (agentId: string) => [...agentKeys.details(), agentId] as const,
};

export function useAgents() {
  return useQuery({
    queryKey: agentKeys.list(),
    queryFn: listAgents,
  });
}

export function useAgent(agentId?: string) {
  return useQuery({
    queryKey: agentId ? agentKeys.detail(agentId) : agentKeys.detail("missing"),
    queryFn: () => getAgent(agentId!),
    enabled: Boolean(agentId),
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Agent>) => createAgent(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agentKeys.all }),
  });
}

export function usePatchAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, input }: { agentId: string; input: Partial<Agent> }) => patchAgent(agentId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(variables.agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
}

export function useTestAgent() {
  return useMutation({
    mutationFn: ({ agentId, input }: { agentId: string; input: AgentTestRequest }) => testAgent(agentId, input),
  });
}
