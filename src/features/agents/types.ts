export type AgentStatus = "active" | "idle" | "offline";

export interface Agent {
  id: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
  description: string;
  instruction_prompt: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  short_bio: string;
  instruction_profile: string;
  speaking_style: string;
  color: string;
  status: AgentStatus;
  avatar_seed: string;
}

export interface AgentTestRequest {
  prompt: string;
}

export interface AgentTestResponse {
  agent_id: string;
  raw_content: string;
  parsed_json: Record<string, unknown>;
  response: string;
  confidence: number;
}
