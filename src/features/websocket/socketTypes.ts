import type { Message, MeetingSummary, MeetingSummaryActionItem } from "../meetings/types";

export type WebSocketConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export type MeetingWebSocketEvent =
  | {
      type: "meeting_started";
      meeting_id: string;
      timestamp: string;
      payload?: { status: string };
    }
  | {
      type: "turn_started";
      meeting_id: string;
      timestamp: string;
      payload: {
        speaker_id: string;
        speaker_name: string;
        speaker_role: string;
      };
    }
  | {
      type: "new_message";
      meeting_id: string;
      timestamp: string;
      payload: {
        message: Message;
      };
    }
  | {
      type: "turn_completed";
      meeting_id: string;
      timestamp: string;
      payload?: { completed_speaker_id?: string };
    }
  | {
      type: "meeting_summary_ready";
      meeting_id: string;
      timestamp: string;
      payload: {
        summary: MeetingSummary;
      };
    }
  | {
      type: "action_items_ready";
      meeting_id: string;
      timestamp: string;
      payload: {
        action_items: MeetingSummaryActionItem[];
      };
    }
  | {
      type: "error";
      meeting_id: string;
      timestamp: string;
      payload: {
        message: string;
      };
    };

export interface MeetingSocketAdapter {
  close: () => void;
}
