import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MeetingParticipant } from "@/features/meetings/types";

export function ParticipantList({
  participants,
  currentSpeakerId,
}: {
  participants: MeetingParticipant[];
  currentSpeakerId?: string | null;
}) {
  return (
    <div className="space-y-2">
      {participants.map((participant) => {
        const isActive = currentSpeakerId === participant.agent_id || participant.is_current_speaker;

        return (
          <div
            key={participant.agent_id}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-3 py-3 transition-colors",
              isActive
                ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40"
                : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
            )}
          >
            <Avatar name={participant.agent_name} accent={isActive ? "blue" : "slate"} className="h-9 w-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{participant.agent_name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{participant.role}</p>
            </div>
            <Badge tone={isActive ? "blue" : "slate"}>#{participant.speaking_order}</Badge>
          </div>
        );
      })}
    </div>
  );
}
