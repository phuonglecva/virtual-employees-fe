const MODE_KEY_PREFIX = "virtual-employees.meeting-ui-mode";

export function storeMeetingUiMode(meetingId: string, mode: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${MODE_KEY_PREFIX}:${meetingId}`, mode);
}

export function getMeetingUiMode(meetingId: string) {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(`${MODE_KEY_PREFIX}:${meetingId}`);
}
