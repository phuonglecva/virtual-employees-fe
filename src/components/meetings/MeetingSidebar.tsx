import { Bot, Play, SkipForward, Square, WandSparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MeetingStatusBadge } from "./MeetingStatusBadge";
import { ParticipantList } from "./ParticipantList";
import type { Meeting } from "@/features/meetings/types";

export function MeetingSidebar({
  meeting,
  currentSpeakerName,
  onStart,
  onNextTurn,
  onAutoRun,
  onEnd,
  actionsDisabled,
}: {
  meeting: Meeting;
  currentSpeakerName?: string | null;
  onStart: () => void;
  onNextTurn: () => void;
  onAutoRun: () => void;
  onEnd: () => void;
  actionsDisabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{meeting.title}</CardTitle>
            <CardDescription>{meeting.objective}</CardDescription>
          </div>
          <MeetingStatusBadge status={meeting.status} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">{meeting.problem_statement}</p>
            <div className="flex items-center justify-between gap-3">
              <span>Mode</span>
              <Badge tone="blue">{meeting.mode}</Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Current speaker</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{currentSpeakerName || "Founder"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Participants</CardTitle>
            <CardDescription>Speaking order and live focus</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ParticipantList participants={meeting.participants} currentSpeakerId={meeting.current_speaker_id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Drive the orchestration flow</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {meeting.status === "draft" ? (
            <Button className="w-full" onClick={onStart} disabled={actionsDisabled}>
              <Play className="h-4 w-4" />
              Start meeting
            </Button>
          ) : null}
          <Button variant="outline" className="w-full" onClick={onNextTurn} disabled={actionsDisabled || meeting.status !== "live"}>
            <SkipForward className="h-4 w-4" />
            Next turn
          </Button>
          <Button variant="outline" className="w-full" onClick={onAutoRun} disabled={actionsDisabled || meeting.status !== "live"}>
            <WandSparkles className="h-4 w-4" />
            Auto run
          </Button>
          <Separator />
          <Button variant="destructive" className="w-full" onClick={onEnd} disabled={actionsDisabled || meeting.status === "ended"}>
            <Square className="h-4 w-4" />
            End meeting
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
