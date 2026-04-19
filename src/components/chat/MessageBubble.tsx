import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateTime, cn } from "@/lib/utils";
import type { Message } from "@/features/meetings/types";

export function MessageBubble({ message, animationDelayMs = 0 }: { message: Message; animationDelayMs?: number }) {
  const displayText = message.display_text || message.content;
  const isPending = Boolean(message.is_pending);
  const styles =
    message.sender_kind === "founder"
      ? "border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/30"
      : message.sender_kind === "system"
        ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950";

  return (
    <Card
      className={cn(
        "chat-bubble-in border p-4 shadow-none motion-reduce:animate-none",
        isPending && "animate-pulse",
        styles,
      )}
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <div className="flex items-start gap-3">
        <Avatar name={message.speaker_name} accent={message.sender_kind === "founder" ? "blue" : "slate"} className="h-10 w-10" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{message.speaker_name}</p>
            <Badge tone={message.sender_kind === "founder" ? "blue" : message.sender_kind === "agent" ? "slate" : "default"}>
              {message.speaker_role}
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isPending ? "Sending..." : formatDateTime(message.created_at)}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">{displayText}</p>

          {message.sections?.length ? (
            <div className="mt-4 space-y-3">
              {message.sections.map((section) => (
                <div
                  key={section.heading}
                  className="chat-section-in rounded-2xl bg-white/70 p-3 motion-reduce:animate-none dark:bg-slate-900/60"
                  style={{ animationDelay: `${animationDelayMs + 120}ms` }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{section.heading}</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
