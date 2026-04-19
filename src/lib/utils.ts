import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value?: string | number | Date | null) {
  if (!value) {
    return "Just now";
  }

  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatRelativeTime(value?: string | number | Date | null) {
  if (!value) {
    return "just now";
  }

  const date = value instanceof Date ? value : new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
