import { SpendingMoment } from "../features/spendingMemory.types";

export function safeTime(value: string): number {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

export function sumMoments(moments: SpendingMoment[]): number {
  return moments.reduce((sum, moment) => sum + moment.amount, 0);
}

export function getMonthRange(date: Date, monthOffset: number): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);
  const end = new Date(date.getFullYear(), date.getMonth() + monthOffset + 1, 1);
  return { start, end };
}

export function isWithinRange(value: string, start: Date, end: Date): boolean {
  const time = safeTime(value);
  return time >= start.getTime() && time < end.getTime();
}

export function isBetweenTimes(value: string, startTime: number, endTime: number): boolean {
  const time = safeTime(value);
  return time > startTime && time <= endTime;
}