import { seedAgents, seedMeetings, seedMessages } from "./seedData";
import type { Agent, AgentTestRequest, AgentTestResponse } from "../agents/types";
import type {
  Meeting,
  MeetingCreateInput,
  MeetingMessageCreateInput,
  MeetingParticipant,
  MeetingSummary,
  Message,
} from "../meetings/types";
import type { MeetingWebSocketEvent } from "../websocket/socketTypes";
import { FOUNDER_NAME, STORAGE_KEY } from "@/lib/constants";

type Listener = (event: MeetingWebSocketEvent) => void;

interface MockStoreSnapshot {
  agents: Agent[];
  meetings: Meeting[];
  messages: Record<string, Message[]>;
}

const listeners = new Map<string, Set<Listener>>();

let snapshot = hydrate();

function hydrate(): MockStoreSnapshot {
  if (typeof window === "undefined") {
    return {
      agents: structuredClone(seedAgents),
      meetings: structuredClone(seedMeetings),
      messages: structuredClone(seedMessages),
    };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      agents: structuredClone(seedAgents),
      meetings: structuredClone(seedMeetings),
      messages: structuredClone(seedMessages),
    };
  }

  try {
    const parsed = JSON.parse(raw) as MockStoreSnapshot;
    return {
      agents: parsed.agents?.length ? parsed.agents : structuredClone(seedAgents),
      meetings: parsed.meetings?.length ? parsed.meetings : structuredClone(seedMeetings),
      messages:
        parsed.messages && typeof parsed.messages === "object" ? parsed.messages : structuredClone(seedMessages),
    };
  } catch {
    return {
      agents: structuredClone(seedAgents),
      meetings: structuredClone(seedMeetings),
      messages: structuredClone(seedMessages),
    };
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function delay<T>(value: T, ms = 220) {
  return new Promise<T>((resolve) => {
    globalThis.setTimeout(() => resolve(value), ms);
  });
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function now() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function getMeetingIndex(meetingId: string) {
  return snapshot.meetings.findIndex((meeting) => meeting.id === meetingId);
}

function getAgentById(agentId: string) {
  return snapshot.agents.find((agent) => agent.id === agentId);
}

function getMessages(meetingId: string) {
  return snapshot.messages[meetingId] ?? [];
}

function setMessages(meetingId: string, messages: Message[]) {
  snapshot.messages[meetingId] = messages;
}

function updateMeeting(meetingId: string, updater: (meeting: Meeting) => Meeting) {
  const index = getMeetingIndex(meetingId);
  if (index < 0) throw new Error(`Meeting ${meetingId} not found`);
  const current = snapshot.meetings[index];
  if (!current) throw new Error(`Meeting ${meetingId} not found`);
  snapshot.meetings[index] = updater(current);
}

function emit(meetingId: string, event: MeetingWebSocketEvent) {
  const set = listeners.get(meetingId);
  if (!set) return;
  set.forEach((listener) => listener(event));
}

function composeSummary(meeting: Meeting, messages: Message[]): MeetingSummary {
  const agentMessages = messages.filter((message) => message.sender_kind === "agent");
  const keyPoints = [
    `Participants contributed ${agentMessages.length} agent turn${agentMessages.length === 1 ? "" : "s"}.`,
    `The meeting focused on ${meeting.objective.toLowerCase()}.`,
    "The founder can now turn the transcript into a concrete execution step.",
  ];

  return {
    overview: `The team reached alignment on ${meeting.title.toLowerCase()}.`,
    decision:
      meeting.mode === "decision_mode"
        ? "Proceed with the consensus recommendation and schedule a follow-up check-in."
        : "Capture the next action and keep the discussion moving in turn order.",
    rationale:
      "The discussion balanced strategy, execution risk, and financial impact without dragging into unnecessary detail.",
    key_points: keyPoints,
    action_items: [
      {
        id: createId("ai"),
        title: "Turn the chosen option into an execution brief",
        owner: FOUNDER_NAME,
        priority: "high",
        status: "open",
        due_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 10),
      },
      {
        id: createId("ai"),
        title: "Share the outcome with the team",
        owner: "Operations",
        priority: "medium",
        status: "open",
        due_date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().slice(0, 10),
      },
    ],
    updated_at: now(),
  };
}

function updateTranscriptCount(meetingId: string) {
  const count = getMessages(meetingId).length;
  updateMeeting(meetingId, (meeting) => ({ ...meeting, transcript_count: count, updated_at: now() }));
}

function runAgentTurn(meetingId: string) {
  const meeting = snapshot.meetings.find((item) => item.id === meetingId);
  if (!meeting) throw new Error("Meeting not found");

  const agentParticipants = meeting.participants;
  if (!agentParticipants.length) return;

  const currentCount = getMessages(meetingId).filter((message) => message.sender_kind === "agent").length;
  const nextParticipant = agentParticipants[currentCount % agentParticipants.length];
  if (!nextParticipant) return;
  const agent = getAgentById(nextParticipant.agent_id);
  if (!agent) return;

  updateMeeting(meetingId, (item) => ({
    ...item,
    current_speaker_id: agent.id,
    current_speaker_name: agent.name,
    updated_at: now(),
  }));

  emit(meetingId, {
    type: "turn_started",
    meeting_id: meetingId,
    timestamp: now(),
    payload: {
      speaker_id: agent.id,
      speaker_name: agent.name,
      speaker_role: agent.role,
    },
  });

  const message: Message = {
    id: createId("msg"),
    meeting_id: meetingId,
    sender_kind: "agent",
    speaker_id: agent.id,
    speaker_name: agent.name,
    speaker_role: agent.role,
    content: `I suggest we focus on a pragmatic path from here. ${agent.speaking_style} The main risk is ${agent.role.toLowerCase()} getting blocked by unclear ownership, so I would resolve that immediately.`,
    sections: [
      {
        heading: "Next step",
        bullets: [
          "Capture one decision that removes ambiguity.",
          "Assign a single owner for the follow-through.",
        ],
      },
    ],
    created_at: now(),
  };

  const messages = [...getMessages(meetingId), message];
  setMessages(meetingId, messages);
  updateTranscriptCount(meetingId);

  emit(meetingId, {
    type: "new_message",
    meeting_id: meetingId,
    timestamp: now(),
    payload: { message: clone(message) },
  });

  emit(meetingId, {
    type: "turn_completed",
    meeting_id: meetingId,
    timestamp: now(),
    payload: { completed_speaker_id: agent.id },
  });
}

function generateMeetingSummary(meetingId: string) {
  const meeting = snapshot.meetings.find((item) => item.id === meetingId);
  if (!meeting) throw new Error("Meeting not found");

  const summary = composeSummary(meeting, getMessages(meetingId));
  updateMeeting(meetingId, (item) => ({
    ...item,
    summary,
    updated_at: now(),
  }));

  emit(meetingId, {
    type: "meeting_summary_ready",
    meeting_id: meetingId,
    timestamp: now(),
    payload: { summary: clone(summary) },
  });

  emit(meetingId, {
    type: "action_items_ready",
    meeting_id: meetingId,
    timestamp: now(),
    payload: { action_items: clone(summary.action_items) },
  });
}

function maybeAutoCompleteMeeting(meetingId: string) {
  const meeting = snapshot.meetings.find((item) => item.id === meetingId);
  if (!meeting) return;
  if (meeting.status !== "live") return;
  if (getMessages(meetingId).filter((message) => message.sender_kind === "agent").length >= Math.max(2, meeting.participants.length)) {
    generateMeetingSummary(meetingId);
  }
}

export const mockBackend = {
  async listAgents(): Promise<Agent[]> {
    return delay(clone(snapshot.agents));
  },

  async getAgent(agentId: string): Promise<Agent> {
    const agent = snapshot.agents.find((item) => item.id === agentId);
    if (!agent) throw new Error("Agent not found");
    return delay(clone(agent));
  },

  async createAgent(input: Partial<Agent>): Promise<Agent> {
    const agent: Agent = {
      id: createId("agent"),
      name: input.name || "New Agent",
      role: input.role || "Advisor",
      description: input.description || input.short_bio || "Newly created agent profile.",
      instruction_prompt: input.instruction_prompt || input.instruction_profile || "Be helpful.",
      model_name: input.model_name || "gpt-4.1-mini",
      temperature: input.temperature ?? 0.2,
      max_tokens: input.max_tokens ?? 512,
      is_active: input.is_active ?? true,
      short_bio: input.short_bio || "Newly created agent profile.",
      instruction_profile: input.instruction_profile || "Be helpful.",
      speaking_style: input.speaking_style || "Concise.",
      color: input.color || "blue",
      status: input.status || "idle",
      avatar_seed: input.avatar_seed || input.name || "Agent",
      created_at: now(),
      updated_at: now(),
    };
    snapshot.agents = [agent, ...snapshot.agents];
    persist();
    return delay(clone(agent));
  },

  async patchAgent(agentId: string, updates: Partial<Agent>): Promise<Agent> {
    const existing = snapshot.agents.find((item) => item.id === agentId);
    if (!existing) throw new Error("Agent not found");
    const next = { ...existing, ...updates, updated_at: now() };
    snapshot.agents = snapshot.agents.map((item) => (item.id === agentId ? next : item));
    persist();
    return delay(clone(next));
  },

  async testAgent(agentId: string, input: AgentTestRequest): Promise<AgentTestResponse> {
    const agent = snapshot.agents.find((item) => item.id === agentId);
    if (!agent) throw new Error("Agent not found");
    const response = `${agent.name} would respond to "${input.prompt}" by proposing a compact, practical next step.`;
    return delay({
      agent_id: agent.id,
      raw_content: response,
      parsed_json: { confidence: 0.84 },
      response,
      confidence: 0.84,
    });
  },

  async listMeetings(): Promise<Meeting[]> {
    return delay(clone(snapshot.meetings));
  },

  async getMeeting(meetingId: string): Promise<Meeting> {
    const meeting = snapshot.meetings.find((item) => item.id === meetingId);
    if (!meeting) throw new Error("Meeting not found");
    return delay(clone(meeting));
  },

  async createMeeting(input: MeetingCreateInput): Promise<Meeting> {
    const participants: MeetingParticipant[] = input.participant_agent_ids
      .map((agentId, index) => {
        const agent = getAgentById(agentId);
        if (!agent) return null;
        return {
          agent_id: agent.id,
          agent_name: agent.name,
          role: agent.role,
          speaking_order: index + 1,
        };
      })
      .filter(Boolean) as MeetingParticipant[];

    const meeting: Meeting = {
      id: createId("meeting"),
      title: input.title,
      problem_statement: input.problem_statement,
      objective: input.objective,
      mode: input.mode,
      status: "draft",
      founder_id: "founder-maya",
      founder_name: FOUNDER_NAME,
      participants,
      current_speaker_id: null,
      current_speaker_name: null,
      transcript_count: 0,
      summary: null,
      started_at: null,
      ended_at: null,
      created_at: now(),
      updated_at: now(),
    };

    snapshot.meetings = [meeting, ...snapshot.meetings];
    setMessages(meeting.id, []);
    persist();
    return delay(clone(meeting));
  },

  async patchMeeting(meetingId: string, updates: Partial<Meeting>): Promise<Meeting> {
    let result: Meeting | null = null;
    updateMeeting(meetingId, (meeting) => {
      result = { ...meeting, ...updates, updated_at: now() };
      return result!;
    });
    persist();
    return delay(clone(result!));
  },

  async startMeeting(meetingId: string): Promise<Meeting> {
    let result: Meeting | null = null;
    updateMeeting(meetingId, (meeting) => {
      result = {
        ...meeting,
        status: "live",
        started_at: meeting.started_at || now(),
        updated_at: now(),
      };
      return result!;
    });
    persist();

    emit(meetingId, {
      type: "meeting_started",
      meeting_id: meetingId,
      timestamp: now(),
      payload: { status: "live" },
    });

    return delay(clone(result!));
  },

  async endMeeting(meetingId: string): Promise<Meeting> {
    updateMeeting(meetingId, (meeting) => {
      return {
        ...meeting,
        status: "ended",
        ended_at: now(),
        updated_at: now(),
      };
    });
    let result = snapshot.meetings.find((item) => item.id === meetingId);
    if (!result) throw new Error("Meeting not found");
    if (!result.summary) {
      generateMeetingSummary(meetingId);
      result = snapshot.meetings.find((item) => item.id === meetingId) ?? result;
    }
    persist();
    return delay(clone(result!));
  },

  async getSummary(meetingId: string): Promise<MeetingSummary> {
    const meeting = snapshot.meetings.find((item) => item.id === meetingId);
    if (!meeting) throw new Error("Meeting not found");
    const summary = meeting.summary || composeSummary(meeting, getMessages(meetingId));
    return delay(clone(summary));
  },

  async listMessages(meetingId: string): Promise<Message[]> {
    return delay(clone(getMessages(meetingId)));
  },

  async postMessage(meetingId: string, input: MeetingMessageCreateInput): Promise<Message> {
    const message: Message = {
      id: createId("msg"),
      meeting_id: meetingId,
      sender_kind: "founder",
      speaker_id: null,
      speaker_name: FOUNDER_NAME,
      speaker_role: "Founder",
      content: input.content,
      created_at: now(),
    };
    const messages = [...getMessages(meetingId), message];
    setMessages(meetingId, messages);
    updateTranscriptCount(meetingId);
    persist();

    emit(meetingId, {
      type: "new_message",
      meeting_id: meetingId,
      timestamp: now(),
      payload: { message: clone(message) },
    });

    return delay(clone(message));
  },

  async nextTurn(meetingId: string): Promise<void> {
    runAgentTurn(meetingId);
    maybeAutoCompleteMeeting(meetingId);
    persist();
    return delay(undefined, 180);
  },

  async autoRun(meetingId: string): Promise<void> {
    const meeting = snapshot.meetings.find((item) => item.id === meetingId);
    if (!meeting) throw new Error("Meeting not found");

    const turnsNeeded = Math.max(2, meeting.participants.length);
    for (let index = 0; index < turnsNeeded; index += 1) {
      globalThis.setTimeout(() => {
        try {
          runAgentTurn(meetingId);
          maybeAutoCompleteMeeting(meetingId);
          persist();
        } catch (error) {
          emit(meetingId, {
            type: "error",
            meeting_id: meetingId,
            timestamp: now(),
            payload: {
              message: error instanceof Error ? error.message : "Auto-run failed",
            },
          });
        }
      }, 350 * (index + 1));
    }

    return delay(undefined, 160);
  },

  async decideMeeting(meetingId: string, decision: string): Promise<MeetingSummary> {
    const existingMeeting = snapshot.meetings.find((item) => item.id === meetingId);
    if (!existingMeeting) throw new Error("Meeting not found");
    const summary = existingMeeting.summary || composeSummary(existingMeeting, getMessages(meetingId));
    const updated: MeetingSummary = {
      ...summary,
      decision,
      updated_at: now(),
    };
    updateMeeting(meetingId, (item) => ({ ...item, summary: updated, updated_at: now() }));
    persist();

    emit(meetingId, {
      type: "meeting_summary_ready",
      meeting_id: meetingId,
      timestamp: now(),
      payload: { summary: clone(updated) },
    });
    return delay(clone(updated));
  },

  subscribeMeeting(meetingId: string, listener: Listener) {
    const set = listeners.get(meetingId) ?? new Set<Listener>();
    set.add(listener);
    listeners.set(meetingId, set);
    return () => {
      const current = listeners.get(meetingId);
      current?.delete(listener);
      if (current && current.size === 0) {
        listeners.delete(meetingId);
      }
    };
  },

  reset() {
    snapshot = {
      agents: clone(seedAgents),
      meetings: clone(seedMeetings),
      messages: clone(seedMessages),
    };
    persist();
  },
};
