export type MeetingMode = "round_robin" | "decision_mode";
export type MeetingStatus = "draft" | "live" | "active" | "ended";

export interface MeetingParticipant {
  id?: string;
  meeting_id?: string;
  agent_id: string;
  agent_name: string;
  role: string;
  speaking_order: number;
  is_required?: boolean;
  is_current_speaker?: boolean;
}

export interface MeetingSummaryActionItem {
  id: string;
  title: string;
  owner: string;
  priority: "high" | "medium" | "low";
  due_date?: string;
  status: "open" | "done";
}

export interface MeetingSummary {
  id?: string;
  meeting_id?: string;
  overview: string;
  decision: string;
  rationale?: string;
  key_points: string[];
  action_items: MeetingSummaryActionItem[];
  updated_at: string;
  created_at?: string;
  raw_content?: string;
  action_items_json?: Record<string, unknown>[];
}

export interface Meeting {
  id: string;
  title: string;
  problem_statement: string;
  objective: string;
  mode: MeetingMode;
  status: MeetingStatus | "active";
  founder_id: string;
  founder_name?: string;
  participants: MeetingParticipant[];
  current_speaker_id?: string | null;
  current_speaker_name?: string | null;
  transcript_count?: number;
  summary?: MeetingSummary | null;
  started_at?: string | null;
  ended_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type MessageSenderKind = "founder" | "agent" | "system";

export interface MessageSection {
  heading: string;
  bullets: string[];
}

export interface Message {
  id: string;
  meeting_id: string;
  sender_kind: MessageSenderKind;
  sender_type?: string;
  sender_id?: string | null;
  turn_index?: number;
  metadata_json?: Record<string, unknown>;
  speaker_id?: string | null;
  speaker_name: string;
  speaker_role: string;
  content: string;
  display_text?: string;
  is_pending?: boolean;
  sections?: MessageSection[];
  created_at: string;
  updated_at?: string;
}

export interface MeetingCreateInput {
  title: string;
  problem_statement: string;
  objective: string;
  mode: MeetingMode;
  participant_agent_ids: string[];
}

export interface MeetingUpdateInput {
  title?: string;
  problem_statement?: string;
  objective?: string;
  mode?: MeetingMode;
}

export interface MeetingMessageCreateInput {
  content: string;
}
