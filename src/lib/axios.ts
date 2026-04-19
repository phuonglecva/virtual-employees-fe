import axios from "axios";
import { API_BASE_URL } from "./constants";

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
