import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function MeetingComposer({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-950">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || !event.ctrlKey || event.shiftKey || event.altKey || disabled) return;
          event.preventDefault();
          onSubmit();
        }}
        placeholder={placeholder || "Write the opening problem statement or founder follow-up..."}
        className="min-h-32 resize-none"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">Ctrl + Enter to send. Founder's message will become the next transcript entry.</p>
        <Button onClick={onSubmit} disabled={disabled || !value.trim()}>
          <SendHorizonal className="h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
