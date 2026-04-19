import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  autoRunMeeting,
  createMeeting,
  decideMeeting,
  endMeeting,
  getMeeting,
  getMeetingSummary,
  listMeetingMessages,
  listMeetings,
  nextMeetingTurn,
  patchMeeting,
  postMeetingMessage,
  startMeeting,
} from "./api";
import type {
  Meeting,
  MeetingCreateInput,
  MeetingMessageCreateInput,
  MeetingSummary,
  Message,
  MeetingUpdateInput,
} from "./types";

export const meetingKeys = {
  all: ["meetings"] as const,
  lists: () => [...meetingKeys.all, "list"] as const,
  list: () => [...meetingKeys.lists()] as const,
  details: () => [...meetingKeys.all, "detail"] as const,
  detail: (meetingId: string) => [...meetingKeys.details(), meetingId] as const,
  messages: (meetingId: string) => [...meetingKeys.detail(meetingId), "messages"] as const,
  summary: (meetingId: string) => [...meetingKeys.detail(meetingId), "summary"] as const,
};

export function useMeetings() {
  return useQuery({
    queryKey: meetingKeys.list(),
    queryFn: listMeetings,
  });
}

export function useMeeting(meetingId?: string) {
  return useQuery({
    queryKey: meetingId ? meetingKeys.detail(meetingId) : meetingKeys.detail("missing"),
    queryFn: () => getMeeting(meetingId!),
    enabled: Boolean(meetingId),
  });
}

export function useMeetingMessages(meetingId?: string) {
  return useQuery({
    queryKey: meetingId ? meetingKeys.messages(meetingId) : meetingKeys.messages("missing"),
    queryFn: () => listMeetingMessages(meetingId!),
    enabled: Boolean(meetingId),
  });
}

export function useMeetingSummary(meetingId?: string) {
  return useQuery({
    queryKey: meetingId ? meetingKeys.summary(meetingId) : meetingKeys.summary("missing"),
    queryFn: () => getMeetingSummary(meetingId!),
    enabled: Boolean(meetingId),
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MeetingCreateInput) => createMeeting(input),
    onSuccess: (meeting) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      queryClient.setQueryData(meetingKeys.detail(meeting.id), meeting);
    },
  });
}

export function usePatchMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, input }: { meetingId: string; input: MeetingUpdateInput }) =>
      patchMeeting(meetingId, input),
    onSuccess: (meeting) => {
      queryClient.setQueryData(meetingKeys.detail(meeting.id), meeting);
      queryClient.invalidateQueries({ queryKey: meetingKeys.list() });
    },
  });
}

export function useStartMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meetingId: string) => startMeeting(meetingId),
    onSuccess: (meeting) => {
      queryClient.setQueryData(meetingKeys.detail(meeting.id), meeting);
      queryClient.invalidateQueries({ queryKey: meetingKeys.list() });
    },
  });
}

export function useEndMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meetingId: string) => endMeeting(meetingId),
    onSuccess: async (meeting) => {
      queryClient.setQueryData(meetingKeys.detail(meeting.id), meeting);
      queryClient.invalidateQueries({ queryKey: meetingKeys.list() });
      try {
        const summary = await queryClient.fetchQuery({
          queryKey: meetingKeys.summary(meeting.id),
          queryFn: () => getMeetingSummary(meeting.id),
        });
        queryClient.setQueryData<Meeting>(meetingKeys.detail(meeting.id), (current) =>
          current ? { ...current, summary } : current,
        );
      } catch {
        queryClient.invalidateQueries({ queryKey: meetingKeys.summary(meeting.id) });
      }
    },
  });
}

export function useSendMeetingMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, input }: { meetingId: string; input: MeetingMessageCreateInput }) =>
      postMeetingMessage(meetingId, input),
    onMutate: async ({ meetingId, input }) => {
      await queryClient.cancelQueries({ queryKey: meetingKeys.messages(meetingId) });

      const previousMessages = queryClient.getQueryData<Message[]>(meetingKeys.messages(meetingId));
      const tempId = `pending-${crypto.randomUUID()}`;
      const optimisticMessage: Message = {
        id: tempId,
        meeting_id: meetingId,
        sender_kind: "founder",
        speaker_id: null,
        speaker_name: "Founder",
        speaker_role: "Founder",
        content: input.content,
        display_text: input.content,
        is_pending: true,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(meetingKeys.messages(meetingId), (current = []) => [...current, optimisticMessage]);

      return { previousMessages, tempId, meetingId };
    },
    onError: (_error, variables, context) => {
      if (!context) return;
      queryClient.setQueryData<Message[]>(meetingKeys.messages(context.meetingId), context.previousMessages ?? []);
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(variables.meetingId) });
    },
    onSuccess: (message, variables, context) => {
      if (context) {
        queryClient.setQueryData<Message[]>(
          meetingKeys.messages(context.meetingId),
          (current = []) =>
            current.map((item) =>
              item.id === context.tempId
                ? {
                    ...message,
                    is_pending: false,
                  }
                : item,
            ),
        );
      } else {
        queryClient.setQueryData<Message[]>(
          meetingKeys.messages(message.meeting_id),
          (current = []) => [...current, message],
        );
      }

      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(message.meeting_id) });
    },
  });
}

export function useNextMeetingTurn() {
  return useMutation({
    mutationFn: (meetingId: string) => nextMeetingTurn(meetingId),
  });
}

export function useAutoRunMeeting() {
  return useMutation({
    mutationFn: (meetingId: string) => autoRunMeeting(meetingId),
  });
}

export function useDecideMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meetingId: string) => decideMeeting(meetingId),
    onSuccess: (summary, meetingId) => {
      queryClient.setQueryData<Meeting>(meetingKeys.detail(meetingId), (current) =>
        current ? { ...current, summary } : current,
      );
      queryClient.setQueryData<MeetingSummary>(meetingKeys.summary(meetingId), summary);
    },
  });
}

export function useCreateMeetingDraft(initial?: Partial<Meeting>) {
  return useMutation({
    mutationFn: (input: MeetingCreateInput) => createMeeting(input),
    onSuccess: () => {},
  });
}
