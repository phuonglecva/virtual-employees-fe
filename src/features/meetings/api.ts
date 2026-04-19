import { apiClient } from "@/lib/axios";
import { USE_MOCK_DATA, FOUNDER_ID } from "@/lib/constants";
import { mockBackend } from "../mock/mockBackend";
import { getMeetingUiMode, storeMeetingUiMode } from "./uiMode";
import type {
  Meeting,
  MeetingCreateInput,
  MeetingMessageCreateInput,
  MeetingSummary,
  MeetingSummaryActionItem,
  MeetingUpdateInput,
  Message,
} from "./types";

const shouldUseMock = USE_MOCK_DATA;

interface MeetingParticipantRead {
  id: string;
  meeting_id: string;
  agent_id: string;
  speaking_order: number;
  is_required: boolean;
}

interface MeetingRead {
  created_at: string;
  updated_at: string;
  id: string;
  title: string;
  problem_statement: string | null;
  objective: string;
  mode: "structured";
  status: "draft" | "active" | "ended";
  founder_id: string;
  started_at: string | null;
  ended_at: string | null;
  participants: MeetingParticipantRead[];
}

interface MeetingCreate {
  title: string;
  problem_statement: string | null;
  objective: string;
  mode: "structured";
  founder_id: string;
  participants: Array<{
    agent_id: string;
    speaking_order: number;
    is_required: boolean;
  }>;
}

interface MeetingUpdate {
  title?: string | null;
  problem_statement?: string | null;
  objective?: string | null;
  mode?: "structured" | null;
}

interface MeetingSummaryRead {
  created_at: string;
  updated_at: string;
  id: string;
  meeting_id: string;
  summary: string;
  decision: string;
  action_items_json?: Record<string, unknown>[];
}

interface MessageRead {
  created_at: string;
  updated_at: string;
  id: string;
  meeting_id: string;
  sender_type: string;
  sender_id: string | null;
  turn_index: number;
  content: string;
  metadata_json: Record<string, unknown>;
}

interface MessageCreate {
  sender_type: string;
  sender_id?: string | null;
  content: string;
  metadata_json?: Record<string, unknown>;
}

interface NextTurnResponse {
  meeting_id: string;
  next_speaker_type: string;
  next_speaker_id: string | null;
  status: string;
  message_id?: string | null;
  turn_index?: number | null;
  completed?: boolean;
}

function toUiMeetingStatus(status: MeetingRead["status"]): Meeting["status"] {
  if (status === "active") return "live";
  return status;
}

function toUiMeetingMode(meetingId: string): Meeting["mode"] {
  return (getMeetingUiMode(meetingId) as Meeting["mode"]) || "round_robin";
}

function toUiMeeting(raw: MeetingRead): Meeting {
  return {
    id: raw.id,
    title: raw.title,
    problem_statement: raw.problem_statement || "",
    objective: raw.objective,
    mode: toUiMeetingMode(raw.id),
    status: toUiMeetingStatus(raw.status),
    founder_id: raw.founder_id,
    founder_name: raw.founder_id,
    participants: raw.participants.map((participant) => ({
      id: participant.id,
      meeting_id: participant.meeting_id,
      agent_id: participant.agent_id,
      agent_name: participant.agent_id,
      role: "Agent",
      speaking_order: participant.speaking_order,
      is_required: participant.is_required,
    })),
    current_speaker_id: null,
    current_speaker_name: null,
    transcript_count: 0,
    summary: null,
    started_at: raw.started_at,
    ended_at: raw.ended_at,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

function toUiActionItem(item: Record<string, unknown>): MeetingSummaryActionItem {
  return {
    id: String(item.id ?? crypto.randomUUID()),
    title: String(item.title ?? item.name ?? "Action item"),
    owner: String(item.owner_type ?? "Founder"),
    priority: (item.priority as MeetingSummaryActionItem["priority"]) ?? "medium",
    due_date: typeof item.due_date === "string" ? item.due_date : undefined,
    status: (item.status as MeetingSummaryActionItem["status"]) ?? "open",
  };
}

function toUiSummary(raw: MeetingSummaryRead): MeetingSummary {
  return {
    id: raw.id,
    meeting_id: raw.meeting_id,
    overview: raw.summary,
    decision: raw.decision,
    key_points: [raw.summary],
    action_items: (raw.action_items_json ?? []).map(toUiActionItem),
    updated_at: raw.updated_at,
    created_at: raw.created_at,
    raw_content: raw.summary,
    action_items_json: raw.action_items_json,
  };
}

function extractDisplayText(content: string, metadataJson: Record<string, unknown>): string | undefined {
  const fromMetadata = metadataJson.display_text;
  if (typeof fromMetadata === "string" && fromMetadata.trim()) {
    return fromMetadata;
  }

  if (!content.trim().startsWith("{") && !content.trim().startsWith("[")) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    const displayText = parsed.display_text;
    return typeof displayText === "string" && displayText.trim() ? displayText : undefined;
  } catch {
    return undefined;
  }
}

function toUiMessage(raw: MessageRead): Message {
  const senderKind = raw.sender_type === "agent" || raw.sender_type === "founder" || raw.sender_type === "system"
    ? raw.sender_type
    : "system";
  const speakerName =
    (raw.metadata_json?.speaker_name as string | undefined) ||
    (senderKind === "founder" ? "Founder" : senderKind === "system" ? "System" : raw.sender_id || "Agent");
  const speakerRole =
    (raw.metadata_json?.speaker_role as string | undefined) ||
    (senderKind === "founder" ? "Founder" : senderKind === "system" ? "System" : "Agent");
  const sections = Array.isArray(raw.metadata_json?.sections)
    ? (raw.metadata_json.sections as Array<Record<string, unknown>>).map((section) => ({
        heading: String(section.heading ?? "Details"),
        bullets: Array.isArray(section.bullets) ? section.bullets.map((bullet) => String(bullet)) : [],
      }))
    : undefined;

  return {
    id: raw.id,
    meeting_id: raw.meeting_id,
    sender_kind: senderKind,
    sender_type: raw.sender_type,
    sender_id: raw.sender_id,
    turn_index: raw.turn_index,
    metadata_json: raw.metadata_json,
    speaker_id: raw.sender_id,
    speaker_name: speakerName,
    speaker_role: speakerRole,
    content: raw.content,
    display_text: extractDisplayText(raw.content, raw.metadata_json),
    sections,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

function toCreatePayload(input: MeetingCreateInput): MeetingCreate {
  return {
    title: input.title,
    problem_statement: input.problem_statement || null,
    objective: input.objective,
    mode: "structured",
    founder_id: FOUNDER_ID,
    participants: input.participant_agent_ids.map((agentId, index) => ({
      agent_id: agentId,
      speaking_order: index + 1,
      is_required: true,
    })),
  };
}

function toUpdatePayload(input: MeetingUpdateInput): MeetingUpdate {
  return {
    title: input.title ?? null,
    problem_statement: input.problem_statement ?? null,
    objective: input.objective ?? null,
    mode: "structured",
  };
}

function toUiNextTurn(response: NextTurnResponse) {
  return response;
}

export async function listMeetings(): Promise<Meeting[]> {
  if (shouldUseMock) return mockBackend.listMeetings();
  const { data } = await apiClient.get<MeetingRead[]>("/api/v1/meetings");
  return data.map(toUiMeeting);
}

export async function getMeeting(meetingId: string): Promise<Meeting> {
  if (shouldUseMock) return mockBackend.getMeeting(meetingId);
  const { data } = await apiClient.get<MeetingRead>(`/api/v1/meetings/${meetingId}`);
  return toUiMeeting(data);
}

export async function createMeeting(input: MeetingCreateInput): Promise<Meeting> {
  if (shouldUseMock) return mockBackend.createMeeting(input);
  const { data } = await apiClient.post<MeetingRead>("/api/v1/meetings", toCreatePayload(input));
  storeMeetingUiMode(data.id, input.mode);
  return toUiMeeting(data);
}

export async function patchMeeting(meetingId: string, input: MeetingUpdateInput): Promise<Meeting> {
  if (shouldUseMock) return mockBackend.patchMeeting(meetingId, input);
  const { data } = await apiClient.patch<MeetingRead>(`/api/v1/meetings/${meetingId}`, toUpdatePayload(input));
  return toUiMeeting(data);
}

export async function startMeeting(meetingId: string): Promise<Meeting> {
  if (shouldUseMock) return mockBackend.startMeeting(meetingId);
  const { data } = await apiClient.post<MeetingRead>(`/api/v1/meetings/${meetingId}/start`);
  return toUiMeeting(data);
}

export async function endMeeting(meetingId: string): Promise<Meeting> {
  if (shouldUseMock) return mockBackend.endMeeting(meetingId);
  const { data } = await apiClient.post<MeetingRead>(`/api/v1/meetings/${meetingId}/end`);
  return toUiMeeting(data);
}

export async function getMeetingSummary(meetingId: string): Promise<MeetingSummary> {
  if (shouldUseMock) return mockBackend.getSummary(meetingId);
  const { data } = await apiClient.get<MeetingSummaryRead>(`/api/v1/meetings/${meetingId}/summary`);
  return toUiSummary(data);
}

export async function listMeetingMessages(meetingId: string): Promise<Message[]> {
  if (shouldUseMock) return mockBackend.listMessages(meetingId);
  const { data } = await apiClient.get<MessageRead[]>(`/api/v1/meetings/${meetingId}/messages`);
  return data.map(toUiMessage);
}

export async function postMeetingMessage(meetingId: string, input: MeetingMessageCreateInput): Promise<Message> {
  if (shouldUseMock) return mockBackend.postMessage(meetingId, input);
  const { data } = await apiClient.post<MessageRead>(`/api/v1/meetings/${meetingId}/messages`, {
    sender_type: "founder",
    sender_id: FOUNDER_ID,
    content: input.content,
    metadata_json: {
      speaker_name: "Founder",
      speaker_role: "Founder",
    },
  } satisfies MessageCreate);
  return toUiMessage(data);
}

export async function nextMeetingTurn(meetingId: string): Promise<NextTurnResponse> {
  if (shouldUseMock) return mockBackend.nextTurn(meetingId) as unknown as NextTurnResponse;
  const { data } = await apiClient.post<NextTurnResponse>(`/api/v1/meetings/${meetingId}/next-turn`);
  return toUiNextTurn(data);
}

export async function autoRunMeeting(meetingId: string): Promise<NextTurnResponse[]> {
  if (shouldUseMock) return mockBackend.autoRun(meetingId) as unknown as NextTurnResponse[];
  const { data } = await apiClient.post<NextTurnResponse[]>(`/api/v1/meetings/${meetingId}/auto-run`);
  return data;
}

export async function decideMeeting(meetingId: string): Promise<MeetingSummary> {
  if (shouldUseMock) return mockBackend.decideMeeting(meetingId, "") as unknown as MeetingSummary;
  const { data } = await apiClient.post<MeetingSummaryRead>(`/api/v1/meetings/${meetingId}/decision`);
  return toUiSummary(data);
}
