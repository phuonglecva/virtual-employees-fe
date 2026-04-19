import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { AgentsPage } from "@/pages/AgentsPage";
import { CreateMeetingPage } from "@/pages/CreateMeetingPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { MeetingHistoryPage } from "@/pages/MeetingHistoryPage";
import { MeetingRoomPage } from "@/pages/MeetingRoomPage";

export function AppRouter() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/meetings/new" element={<CreateMeetingPage />} />
        <Route path="/meetings/:meetingId" element={<MeetingRoomPage />} />
        <Route path="/meetings" element={<MeetingHistoryPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
