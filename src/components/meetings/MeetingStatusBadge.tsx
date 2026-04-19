import { Badge } from "@/components/ui/badge";
import type { MeetingStatus } from "@/features/meetings/types";

export function MeetingStatusBadge({ status }: { status: MeetingStatus }) {
  const tone = status === "live" || status === "active" ? "success" : status === "draft" ? "warning" : "slate";
  return <Badge tone={tone}>{status}</Badge>;
}
