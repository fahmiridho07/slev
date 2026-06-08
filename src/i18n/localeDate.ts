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
  const formatter = new Intl.RelativeTimeFormat(dateLocale(), { numeric: "auto" });
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 60) {
    return formatter.format(diffSeconds, "second");
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return formatter.format(diffDays, "day");
  }

  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) {
    return formatter.format(diffMonths, "month");
  }

  const diffYears = Math.round(diffDays / 365);
  return formatter.format(diffYears, "year");
}