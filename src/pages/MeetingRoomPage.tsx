import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, ChevronLeft, PanelRightOpen, PanelRightClose, RefreshCcw } from "lucide-react";
import {
  useMeeting,
  useMeetingMessages,
  useMeetingSummary,
  useAutoRunMeeting,
  useEndMeeting,
  useNextMeetingTurn,
  useSendMeetingMessage,
  useStartMeeting,
} from "@/features/meetings/hooks";
import { useAgents } from "@/features/agents/hooks";
import { useMeetingSocket } from "@/features/websocket/useMeetingSocket";
import { useAppStore } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MeetingTranscript } from "@/components/chat/MeetingTranscript";
import { MeetingComposer } from "@/components/chat/MeetingComposer";
import { MeetingEventBanner } from "@/components/meetings/MeetingEventBanner";
import { MeetingSidebar } from "@/components/meetings/MeetingSidebar";
import { SummaryPanel } from "@/components/summary/SummaryPanel";
import { DecisionCard } from "@/components/summary/DecisionCard";
import { cn } from "@/lib/utils";
import { MeetingStatusBadge } from "@/components/meetings/MeetingStatusBadge";

export function MeetingRoomPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const meetingQuery = useMeeting(meetingId);
  const summaryQuery = useMeetingSummary(meetingId);
  const messagesQuery = useMeetingMessages(meetingId);
  const agentsQuery = useAgents();
  const startMutation = useStartMeeting();
  const nextMutation = useNextMeetingTurn();
  const autoRunMutation = useAutoRunMeeting();
  const endMutation = useEndMeeting();
  const sendMessageMutation = useSendMeetingMessage();
  const [composerText, setComposerText] = useState("");
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const rightPanelCollapsed = useAppStore((state) => state.rightPanelCollapsed);
  const toggleRightPanel = useAppStore((state) => state.toggleRightPanel);
  const meetingBanner = useAppStore((state) => state.meetingBanner);
  const setMeetingBanner = useAppStore((state) => state.setMeetingBanner);
  const pushToast = useAppStore((state) => state.pushToast);
  const { status: socketStatus, reconnect } = useMeetingSocket(meetingId);

  const meeting = meetingQuery.data;
  const agentMap = useMemo(() => new Map((agentsQuery.data ?? []).map((agent) => [agent.id, agent])), [agentsQuery.data]);
  const enrichedMeeting = useMemo(() => {
    if (!meeting) return null;
    return {
      ...meeting,
      participants: meeting.participants.map((participant) => {
        const agent = agentMap.get(participant.agent_id);
        return {
          ...participant,
          agent_name: agent?.name || participant.agent_name || participant.agent_id,
          role: agent?.role || participant.role || "Agent",
        };
      }),
      current_speaker_name:
        meeting.current_speaker_name ||
        (meeting.current_speaker_id ? agentMap.get(meeting.current_speaker_id)?.name : null) ||
        null,
    };
  }, [agentMap, meeting]);
  const messages = messagesQuery.data ?? [];
  const enrichedMessages = useMemo(
    () =>
      messages.map((message) => {
        const agent = message.sender_id ? agentMap.get(message.sender_id) : null;
        const displayName =
          message.sender_kind === "founder"
            ? "Founder"
            : message.sender_kind === "system"
              ? "System"
              : agent?.name || message.speaker_name || message.sender_id || "Agent";

        return {
          ...message,
          speaker_name: displayName,
          speaker_role:
            message.sender_kind === "founder"
              ? "Founder"
              : message.sender_kind === "system"
                ? "System"
                : agent?.role || message.speaker_role || "Agent",
        };
      }),
    [agentMap, messages],
  );
  const summary = summaryQuery.data ?? meeting?.summary ?? null;
  const hasResponseAfterFounder = useMemo(() => {
    let lastFounderIndex = -1;
    messages.forEach((message, index) => {
      if (message.sender_kind === "founder") {
        lastFounderIndex = index;
      }
    });

    if (lastFounderIndex < 0) return false;
    return messages.slice(lastFounderIndex + 1).some((message) => message.sender_kind !== "founder");
  }, [messages]);

  useEffect(() => {
    if (meeting?.problem_statement) {
      setComposerText((current) => current || meeting.problem_statement);
    }
  }, [meeting?.problem_statement]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (waitingForResponse && hasResponseAfterFounder) {
      setWaitingForResponse(false);
    }
  }, [hasResponseAfterFounder, waitingForResponse]);

  useEffect(() => {
    if (socketStatus === "disconnected") {
      setMeetingBanner({
        tone: "warning",
        title: "WebSocket disconnected",
        description: "Live updates paused. You can reconnect from the room.",
      });
    }
  }, [setMeetingBanner, socketStatus]);

  useEffect(() => {
    if (socketStatus === "connected" && meetingBanner?.title === "WebSocket disconnected") {
      setMeetingBanner(null);
    }
  }, [meetingBanner?.title, setMeetingBanner, socketStatus]);

  const currentSpeakerLabel = useMemo(() => enrichedMeeting?.current_speaker_name || "Founder", [enrichedMeeting?.current_speaker_name]);

  if (!meetingId) {
    return <MissingMeetingState message="Missing meeting ID in the URL." />;
  }

  if (meetingQuery.isError) {
    return <MissingMeetingState message="Unable to load this meeting." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Meeting room</p>
            <h1 className="text-2xl font-semibold tracking-tight">{meeting?.title || "Loading meeting..."}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={socketStatus === "connected" ? "success" : socketStatus === "connecting" ? "warning" : "slate"}>
            {socketStatus}
          </Badge>
          <MeetingStatusBadge status={meeting?.status || "draft"} />
        </div>
      </div>

      {meetingBanner ? <MeetingEventBanner banner={meetingBanner} /> : null}

      {socketStatus !== "connected" ? (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2 text-sm text-amber-950 dark:text-amber-100">
              <AlertTriangle className="h-4 w-4" />
              <span>Live websocket updates are paused.</span>
            </div>
            <Button variant="outline" size="sm" onClick={reconnect}>
              <RefreshCcw className="h-4 w-4" />
              Reconnect
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {meetingQuery.isLoading || agentsQuery.isLoading ? (
        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
          <Skeleton className="h-[680px]" />
          <Skeleton className="h-[680px]" />
          <Skeleton className="h-[680px]" />
        </div>
      ) : enrichedMeeting ? (
        <div className={cn("grid gap-4", rightPanelCollapsed ? "xl:grid-cols-[280px_minmax(0,1fr)]" : "xl:grid-cols-[280px_minmax(0,1fr)_360px]")}>
          <div className="xl:sticky xl:top-24 xl:self-start">
            <MeetingSidebar
              meeting={enrichedMeeting}
              currentSpeakerName={currentSpeakerLabel}
              onStart={async () => {
                await startMutation.mutateAsync(enrichedMeeting.id);
                pushToast({ title: "Meeting started", description: "The room is live.", tone: "success" });
              }}
              onNextTurn={async () => {
                await nextMutation.mutateAsync(enrichedMeeting.id);
                pushToast({ title: "Next turn requested", description: "Waiting for the next agent response.", tone: "default" });
              }}
              onAutoRun={async () => {
                await autoRunMutation.mutateAsync(enrichedMeeting.id);
                pushToast({ title: "Auto-run started", description: "Agents will speak in sequence.", tone: "default" });
              }}
              onEnd={async () => {
                await endMutation.mutateAsync(enrichedMeeting.id);
                pushToast({ title: "Meeting ended", description: "Live summary and decision were refreshed.", tone: "success" });
              }}
              actionsDisabled={startMutation.isPending || nextMutation.isPending || autoRunMutation.isPending || endMutation.isPending}
            />
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="items-start">
                <div>
                  <CardTitle>Transcript</CardTitle>
                  <CardDescription>{enrichedMeeting.objective}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setMeetingBanner(null)}>
                  Clear banner
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="blue">Current speaker: {currentSpeakerLabel}</Badge>
                  <Badge tone={enrichedMeeting.status === "live" ? "success" : enrichedMeeting.status === "ended" ? "slate" : "warning"}>
                    {enrichedMeeting.status}
                  </Badge>
                  <Badge tone="slate">{messages.length} messages</Badge>
                </div>
                <div ref={transcriptRef} className="max-h-[540px] space-y-3 overflow-y-auto pr-1">
                  {/*
                    Show a lightweight typing bubble while waiting for the next agent reply.
                  */}
                  <MeetingTranscript
                    messages={enrichedMessages}
                    isLoading={messagesQuery.isLoading}
                    waitingBubble={waitingForResponse ? { speakerName: currentSpeakerLabel === "Founder" ? "Agent" : currentSpeakerLabel, speakerRole: "Typing response" } : null}
                  />
                </div>
                <MeetingComposer
                  value={composerText}
                  onChange={setComposerText}
                  disabled={enrichedMeeting.status !== "live" || sendMessageMutation.isPending}
                  onSubmit={async () => {
                    const draft = composerText.trim();
                    if (!draft) return;

                    setComposerText("");
                    setWaitingForResponse(true);

                    try {
                      await sendMessageMutation.mutateAsync({
                        meetingId: enrichedMeeting.id,
                        input: { content: draft },
                      });
                      pushToast({
                        title: "Founder message sent",
                        description: "The opening statement is in the transcript.",
                        tone: "success",
                      });
                    } catch {
                      setWaitingForResponse(false);
                      setComposerText(draft);
                      pushToast({
                        title: "Send failed",
                        description: "We could not send the message. Please try again.",
                        tone: "destructive",
                      });
                    }
                  }}
                  placeholder={
                    enrichedMeeting.status === "draft"
                      ? "Start the meeting before sending the opening statement."
                      : "Type the founder's opening problem statement..."
                  }
                />
              </CardContent>
            </Card>
          </div>

          {!rightPanelCollapsed ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={toggleRightPanel}>
                  <PanelRightClose className="h-4 w-4" />
                  Collapse
                </Button>
              </div>
              <DecisionCard summary={summary} />
              <SummaryPanel summary={summary} />
            </div>
          ) : (
            <div className="hidden xl:flex xl:items-start xl:justify-end">
              <Button variant="ghost" size="sm" onClick={toggleRightPanel} className="sticky top-24">
                <PanelRightOpen className="h-4 w-4" />
                Expand panel
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function MissingMeetingState({ message }: { message: string }) {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Meeting unavailable</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => window.location.assign("/")}>Back to dashboard</Button>
      </CardContent>
    </Card>
  );
}
