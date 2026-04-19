import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WebSocketConnectionStatus } from "@/features/websocket/socketTypes";

export interface AppToast {
  id: string;
  title: string;
  description?: string;
  tone?: "default" | "success" | "warning" | "destructive";
}

export interface MeetingBanner {
  tone?: "default" | "success" | "warning" | "destructive";
  title: string;
  description?: string;
}

interface AppState {
  theme: "light" | "dark";
  socketStatus: WebSocketConnectionStatus;
  currentSpeakerId: string | null;
  currentSpeakerName: string | null;
  meetingBanner: MeetingBanner | null;
  rightPanelCollapsed: boolean;
  toasts: AppToast[];
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setSocketStatus: (status: WebSocketConnectionStatus) => void;
  setCurrentSpeaker: (speaker: { id: string | null; name: string | null }) => void;
  setMeetingBanner: (banner: MeetingBanner | null) => void;
  toggleRightPanel: () => void;
  pushToast: (toast: Omit<AppToast, "id">) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: "light",
      socketStatus: "disconnected",
      currentSpeakerId: null,
      currentSpeakerName: null,
      meetingBanner: null,
      rightPanelCollapsed: false,
      toasts: [],
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" }),
      setSocketStatus: (status) => set({ socketStatus: status }),
      setCurrentSpeaker: ({ id, name }) => set({ currentSpeakerId: id, currentSpeakerName: name }),
      setMeetingBanner: (banner) => set({ meetingBanner: banner }),
      toggleRightPanel: () => set({ rightPanelCollapsed: !get().rightPanelCollapsed }),
      pushToast: (toast) => {
        const id = createId();
        set({ toasts: [{ id, ...toast }, ...get().toasts].slice(0, 4) });
        return id;
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name: "virtual-employees.app-state",
      partialize: (state) => ({ theme: state.theme, rightPanelCollapsed: state.rightPanelCollapsed }),
    },
  ),
);
