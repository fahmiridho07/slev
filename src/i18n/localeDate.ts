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