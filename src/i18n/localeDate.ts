import { getRuntimeLocale } from "./runtime";

function dateLocale() {
  return getRuntimeLocale() === "id" ? "id-ID" : "en-US";
}

export function formatLocaleDate(value: Date | string, options: Intl.DateTimeFormatOptions): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString(dateLocale(), options);
}

export function formatLocaleShortDate(value: Date | string): string {
  return formatLocaleDate(value, { day: "numeric", month: "short" });
}

export function formatLocaleMonthShort(value: Date | string): string {
  return formatLocaleDate(value, { month: "short" });
}

export function formatLocaleMonthYear(value: Date | string): string {
  return formatLocaleDate(value, { month: "short", year: "numeric" });
}

export function formatLocaleWeekdayDate(key: string): string {
  return formatLocaleDate(`${key}T00:00:00`, {
    weekday: "long",
    day: "numeric",
    month: "short"
  });
}

export function formatLocaleTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleTimeString(dateLocale(), {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function formatRelativeTimeFromNow(value: Date | string, referenceDate = new Date()): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffSeconds = Math.round((date.getTime() - referenceDate.getTime()) / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const isId = getRuntimeLocale() === "id";

  if (absSeconds < 45) {
    return isId ? "baru saja" : "just now";
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) {
    if (isId) {
      return diffMinutes < 0
        ? `${Math.abs(diffMinutes)} menit yang lalu`
        : `dalam ${diffMinutes} menit`;
    }
    return diffMinutes < 0
      ? `${Math.abs(diffMinutes)} minutes ago`
      : `in ${diffMinutes} minutes`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    if (isId) {
      return diffHours < 0
        ? `${Math.abs(diffHours)} jam yang lalu`
        : `dalam ${diffHours} jam`;
    }
    return diffHours < 0
      ? `${Math.abs(diffHours)} hours ago`
      : `in ${diffHours} hours`;
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) <= 7) {
    if (diffDays === -1) return isId ? "kemarin" : "yesterday";
    if (diffDays === 1) return isId ? "besok" : "tomorrow";
    if (isId) {
      return diffDays < 0
        ? `${Math.abs(diffDays)} hari yang lalu`
        : `dalam ${diffDays} hari`;
    }
    return diffDays < 0
      ? `${Math.abs(diffDays)} days ago`
      : `in ${diffDays} days`;
  }

  return formatLocaleDate(value, { day: "numeric", month: "short", year: "numeric" });
}