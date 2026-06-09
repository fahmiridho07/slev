import { dateKey, formatDate } from "../../lib/analysis";
import { formatString } from "../../i18n/format";
import { getRuntimeStrings } from "../../i18n/runtime";

export type CaptureQuickDateOption = {
  key: string | null;
  label: string;
};

export function getTodayDateKey(referenceDate = new Date()): string {
  return dateKey(referenceDate);
}

export function dateKeyFromOffset(dayOffset: number, referenceDate = new Date()): string {
  const date = new Date(referenceDate);
  date.setDate(referenceDate.getDate() + dayOffset);
  return dateKey(date);
}

export function buildCaptureQuickDateOptions(referenceDate = new Date()): CaptureQuickDateOption[] {
  const strings = getRuntimeStrings().capture.dateQuick;
  return [
    { key: null, label: strings.today },
    { key: dateKeyFromOffset(-1, referenceDate), label: strings.yesterday },
    { key: dateKeyFromOffset(-2, referenceDate), label: formatString(strings.daysAgo, { count: "2" }) },
    { key: dateKeyFromOffset(-3, referenceDate), label: formatString(strings.daysAgo, { count: "3" }) }
  ];
}

export function buildOccurredAtIso(
  occurredAtKey: string | null,
  referenceDate = new Date()
): string | undefined {
  const todayKey = getTodayDateKey(referenceDate);
  if (!occurredAtKey || occurredAtKey === todayKey) {
    return undefined;
  }

  const [year, month, day] = occurredAtKey.split("-").map(Number);
  const occurredAt = new Date(
    year,
    month - 1,
    day,
    referenceDate.getHours(),
    referenceDate.getMinutes(),
    referenceDate.getSeconds(),
    referenceDate.getMilliseconds()
  );
  return occurredAt.toISOString();
}

export function isFutureDateKey(key: string, referenceDate = new Date()): boolean {
  return key > getTodayDateKey(referenceDate);
}

export function formatCaptureDateLabel(
  occurredAtKey: string | null,
  referenceDate = new Date()
): string | null {
  if (!occurredAtKey || occurredAtKey === getTodayDateKey(referenceDate)) {
    return null;
  }

  const yesterdayKey = dateKeyFromOffset(-1, referenceDate);
  if (occurredAtKey === yesterdayKey) {
    return getRuntimeStrings().capture.dateQuick.yesterday;
  }

  return formatDate(occurredAtKey);
}