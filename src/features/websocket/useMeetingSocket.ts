import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { WS_BASE_URL, USE_MOCK_DATA } from "@/lib/constants";
import { useAppStore } from "@/app/store";
import { meetingKeys } from "../meetings/hooks";
import type { Meeting, MeetingSummary } from "../meetings/types";
import type { MeetingWebSocketEvent, WebSocketConnectionStatus } from "./socketTypes";
import { mockBackend } from "../mock/mockBackend";

type SocketAdapter = {
  close: () => void;
};

function applyEvent(
  queryClient: ReturnType<typeof useQueryClient>,
  event: MeetingWebSocketEvent,
  setBanner: ReturnType<typeof useAppStore.getState>["setMeetingBanner"],
  setCurrentSpeaker: ReturnType<typeof useAppStore.getState>["setCurrentSpeaker"],
  pushToast: ReturnType<typeof useAppStore.getState>["pushToast"],
) {
  switch (event.type) {
    case "meeting_started":
      setBanner({ tone: "success", title: "Meeting started", description: "The room is now live." });
      queryClient.setQueryData<Meeting>(meetingKeys.detail(event.meeting_id), (current) =>
        current ? { ...current, status: "live" } : current,
      );
      break;
    case "turn_started":
      setCurrentSpeaker({ id: event.payload.speaker_id, name: event.payload.speaker_name });
      setBanner({
        tone: "default",
        title: `${event.payload.speaker_name} is speaking`,
        description: event.payload.speaker_role,
      });
      queryClient.setQueryData<Meeting>(meetingKeys.detail(event.meeting_id), (current) =>
        current
          ? {
              ...current,
              current_speaker_id: event.payload.speaker_id,
              current_speaker_name: event.payload.speaker_name,
            }
          : current,
      );
      break;
    case "new_message":
      queryClient.setQueryData(meetingKeys.messages(event.meeting_id), (current: any[] = []) => {
        if (current.some((message) => message.id === event.payload.message.id)) {
          return current.map((message) =>
            message.id === event.payload.message.id ? { ...event.payload.message, is_pending: false } : message,
          );
        }

        const pendingIndex = current.findIndex(
          (message) =>
            message.is_pending &&
            message.sender_kind === event.payload.message.sender_kind &&
            message.content === event.payload.message.content,
        );
        if (pendingIndex >= 0) {
          return current.map((message, index) =>
            index === pendingIndex ? { ...event.payload.message, is_pending: false } : message,
          );
        }

        return [...current, { ...event.payload.message, is_pending: false }];
      });
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(event.meeting_id) });
      break;
    case "turn_completed":
      setBanner({ tone: "success", title: "Turn completed", description: "The transcript has been updated." });
      setCurrentSpeaker({ id: null, name: null });
      break;
    case "meeting_summary_ready":
      queryClient.setQueryData<MeetingSummary>(meetingKeys.summary(event.meeting_id), event.payload.summary);
      queryClient.setQueryData<Meeting>(meetingKeys.detail(event.meeting_id), (current) =>
        current ? { ...current, summary: event.payload.summary } : current,
      );
      setBanner({ tone: "success", title: "Summary ready", description: "The decision panel has been refreshed." });
      break;
    case "action_items_ready":
      queryClient.setQueryData<MeetingSummary>(meetingKeys.summary(event.meeting_id), (current) =>
        current ? { ...current, action_items: event.payload.action_items } : current,
      );
      queryClient.setQueryData<Meeting>(meetingKeys.detail(event.meeting_id), (current) =>
        current
          ? {
              ...current,
              summary: current.summary
                ? { ...current.summary, action_items: event.payload.action_items }
                : current.summary,
            }
          : current,
      );
      setBanner({ tone: "success", title: "Action items ready", description: "The follow-up list is up to date." });
      break;
    case "error":
      setBanner({ tone: "destructive", title: "Meeting error", description: event.payload.message });
      pushToast({
        title: "WebSocket error",
        description: event.payload.message,
        tone: "destructive",
      });
      break;
    default:
      break;
  }
}

function createMockSocket(meetingId: string, onEvent: (event: MeetingWebSocketEvent) => void): SocketAdapter {
  const unsubscribe = mockBackend.subscribeMeeting(meetingId, onEvent);
  return {
    close: unsubscribe,
  };
}

export function useMeetingSocket(meetingId?: string) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<WebSocketConnectionStatus>("disconnected");
  const [lastEvent, setLastEvent] = useState<MeetingWebSocketEvent | null>(null);
  const [reconnectKey, setReconnectKey] = useState(0);
  const socketRef = useRef<WebSocket | SocketAdapter | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const disposedRef = useRef(false);
  const connectionOpenRef = useRef(false);
  const handledAttemptRef = useRef(0);
  const setSocketStatus = useAppStore((state) => state.setSocketStatus);
  const setMeetingBanner = useAppStore((state) => state.setMeetingBanner);
  const setCurrentSpeaker = useAppStore((state) => state.setCurrentSpeaker);
  const pushToast = useAppStore((state) => state.pushToast);

  const reconnect = useMemo(() => () => setReconnectKey((value) => value + 1), []);

  useEffect(() => {
    if (!meetingId) return;

    disposedRef.current = false;
    connectionOpenRef.current = false;
    handledAttemptRef.current = 0;
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    setStatus("connecting");
    setSocketStatus("connecting");

    const handleEvent = (event: MeetingWebSocketEvent) => {
      setLastEvent(event);
      applyEvent(queryClient, event, setMeetingBanner, setCurrentSpeaker, pushToast);
    };

    const scheduleRetry = (attempt: number) => {
      if (disposedRef.current) return;
      if (handledAttemptRef.current === attempt) return;
      handledAttemptRef.current = attempt;

      if (attempt < 2) {
        setStatus("connecting");
        setSocketStatus("connecting");
        retryTimerRef.current = window.setTimeout(() => {
          retryTimerRef.current = null;
          if (!disposedRef.current) {
            connect(attempt + 1);
          }
        }, 900);
        return;
      }

      setStatus("error");
      setSocketStatus("error");
      pushToast({
        title: "Connection error",
        description: "The meeting websocket could not connect.",
        tone: "destructive",
      });
    };

    const connect = (attempt: number) => {
      if (disposedRef.current) return;

      if (USE_MOCK_DATA || !WS_BASE_URL) {
        const adapter = createMockSocket(meetingId, handleEvent);
        socketRef.current = adapter;
        connectionOpenRef.current = true;
        setStatus("connected");
        setSocketStatus("connected");
        return;
      }

      const socket = new WebSocket(`${WS_BASE_URL.replace(/\/$/, "")}/api/v1/ws/meetings/${meetingId}`);
      socketRef.current = socket;
      connectionOpenRef.current = false;

      socket.onopen = () => {
        if (disposedRef.current) return;
        connectionOpenRef.current = true;
        handledAttemptRef.current = 0;
        setStatus("connected");
        setSocketStatus("connected");
      };

      socket.onerror = () => {
        if (disposedRef.current || connectionOpenRef.current) return;
        scheduleRetry(attempt);
      };

      socket.onclose = () => {
        if (disposedRef.current) return;
        if (connectionOpenRef.current) {
          setStatus("disconnected");
          setSocketStatus("disconnected");
          return;
        }
        scheduleRetry(attempt);
      };

      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data) as MeetingWebSocketEvent;
          handleEvent(event);
        } catch {
          const event: MeetingWebSocketEvent = {
            type: "error",
            meeting_id: meetingId,
            timestamp: new Date().toISOString(),
            payload: { message: "Received malformed websocket payload" },
          };
          handleEvent(event);
        }
      };
    };

    connect(1);

    return () => {
      disposedRef.current = true;
      connectionOpenRef.current = false;
      handledAttemptRef.current = 0;
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setStatus("disconnected");
      setSocketStatus("disconnected");
    };
  }, [meetingId, queryClient, reconnectKey, pushToast, setCurrentSpeaker, setMeetingBanner, setSocketStatus]);

  return {
    status,
    lastEvent,
    reconnect,
    isConnected: status === "connected",
  };
}
