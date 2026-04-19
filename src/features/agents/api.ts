import { apiClient } from "@/lib/axios";
import { USE_MOCK_DATA } from "@/lib/constants";
import { mockBackend } from "../mock/mockBackend";
import type { Agent, AgentTestRequest, AgentTestResponse } from "./types";

const shouldUseMock = USE_MOCK_DATA;

interface AgentRead {
  created_at: string;
  updated_at: string;
  id: string;
  name: string;
  role: string;
  description: string;
  instruction_prompt: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
}

interface AgentCreate {
  name: string;
  role: string;
  description?: string;
  instruction_prompt?: string;
  model_name: string;
  temperature?: number;
  max_tokens?: number;
  is_active?: boolean;
}

interface AgentUpdate {
  name?: string | null;
  role?: string | null;
  description?: string | null;
  instruction_prompt?: string | null;
  model_name?: string | null;
  temperature?: number | null;
  max_tokens?: number | null;
  is_active?: boolean | null;
}

function mapStatus(isActive: boolean): Agent["status"] {
  return isActive ? "active" : "offline";
}

function toUiAgent(agent: AgentRead): Agent {
  return {
    ...agent,
    status: mapStatus(agent.is_active),
    short_bio: agent.description,
    instruction_profile: agent.instruction_prompt,
    speaking_style: agent.description || "Operational guidance profile",
    color: agent.is_active ? "blue" : "slate",
    avatar_seed: agent.name,
  };
}

function toCreatePayload(input: Partial<Agent>): AgentCreate {
  return {
    name: input.name || "New Agent",
    role: input.role || "Advisor",
    description: input.short_bio || input.description || "",
    instruction_prompt: input.instruction_profile || input.instruction_prompt || "",
    model_name: input.model_name || "gpt-4.1-mini",
    temperature: input.temperature ?? 0.2,
    max_tokens: input.max_tokens ?? 512,
    is_active: input.is_active ?? true,
  };
}

function toUpdatePayload(input: Partial<Agent>): AgentUpdate {
  return {
    name: input.name ?? null,
    role: input.role ?? null,
    description: input.short_bio ?? input.description ?? null,
    instruction_prompt: input.instruction_profile ?? input.instruction_prompt ?? null,
    model_name: input.model_name ?? null,
    temperature: input.temperature ?? null,
    max_tokens: input.max_tokens ?? null,
    is_active: input.is_active ?? null,
  };
}

function mapTestResponse(response: AgentTestResponse): AgentTestResponse {
  return response;
}

export async function listAgents(): Promise<Agent[]> {
  if (shouldUseMock) return mockBackend.listAgents();
  const { data } = await apiClient.get<AgentRead[]>("/api/v1/agents");
  return data.map(toUiAgent);
}

export async function getAgent(agentId: string): Promise<Agent> {
  if (shouldUseMock) return mockBackend.getAgent(agentId);
  const { data } = await apiClient.get<AgentRead>(`/api/v1/agents/${agentId}`);
  return toUiAgent(data);
}

export async function createAgent(input: Partial<Agent>): Promise<Agent> {
  if (shouldUseMock) return mockBackend.createAgent(input);
  const { data } = await apiClient.post<AgentRead>("/api/v1/agents", toCreatePayload(input));
  return toUiAgent(data);
}

export async function patchAgent(agentId: string, input: Partial<Agent>): Promise<Agent> {
  if (shouldUseMock) return mockBackend.patchAgent(agentId, input);
  const { data } = await apiClient.patch<AgentRead>(`/api/v1/agents/${agentId}`, toUpdatePayload(input));
  return toUiAgent(data);
}

export async function testAgent(agentId: string, input: AgentTestRequest): Promise<AgentTestResponse> {
  if (shouldUseMock) return mockBackend.testAgent(agentId, input);
  const { data } = await apiClient.post<
    {
      agent_id: string;
      raw_content: string;
      parsed_json: Record<string, unknown>;
    }
  >(`/api/v1/agents/${agentId}/test`, null, {
    params: { prompt: input.prompt },
  });
  return mapTestResponse({
    agent_id: data.agent_id,
    raw_content: data.raw_content,
    parsed_json: data.parsed_json,
    response: data.raw_content,
    confidence: typeof data.parsed_json?.confidence === "number" ? (data.parsed_json.confidence as number) : 0.8,
  });
}
