import { MessageBubble } from "./MessageBubble";
import type { Message } from "@/features/meetings/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MeetingTranscript({
  messages,
  isLoading,
  waitingBubble,
}: {
  messages: Message[];
  isLoading?: boolean;
  waitingBubble?: {
    speakerName?: string;
    speakerRole?: string;
  } | null;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-slate-950/50">
        <p className="text-sm font-medium">No messages yet</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Send the opening problem statement to begin the discussion.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message, index) => (
        <MessageBubble key={message.id} message={message} animationDelayMs={index * 40} />
      ))}
      {waitingBubble ? <WaitingBubble speakerName={waitingBubble.speakerName} speakerRole={waitingBubble.speakerRole} /> : null}
    </div>
  );
}

function WaitingBubble({ speakerName = "Agent", speakerRole = "Thinking" }: { speakerName?: string; speakerRole?: string }) {
  return (
    <Card className="chat-bubble-in border border-dashed border-slate-200 bg-white/70 p-4 shadow-none motion-reduce:animate-none dark:border-slate-800 dark:bg-slate-950/70">
      <div className="flex items-start gap-3">
        <Avatar name={speakerName} accent="slate" className="h-10 w-10" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{speakerName}</p>
            <Badge tone="slate">{speakerRole}</Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">typing</span>
          </div>
          <div className="mt-3 flex h-6 items-center gap-1.5">
            <span className="chat-typing-dot h-2 w-2 rounded-full bg-slate-400/70" />
            <span className="chat-typing-dot h-2 w-2 rounded-full bg-slate-400/70" />
            <span className="chat-typing-dot h-2 w-2 rounded-full bg-slate-400/70" />
          </div>
        </div>
      </div>
    </Card>
  );
}
