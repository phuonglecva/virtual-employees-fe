export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8000";
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL?.trim() || "ws://localhost:8000";
export const USE_MOCK_DATA = String(import.meta.env.VITE_USE_MOCK_DATA ?? "false") === "true";

export const APP_NAME = "Virtual Employees";
export const FOUNDER_ID = "founder-maya";
export const FOUNDER_NAME = "Maya Chen";
export const FOUNDER_LABEL = "Solo founder";

export const STORAGE_KEY = "virtual-employees.mock-store";
