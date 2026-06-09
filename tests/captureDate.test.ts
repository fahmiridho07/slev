process.env.TZ = "Asia/Jakarta";

import {
  buildCaptureQuickDateOptions,
  buildOccurredAtIso,
  dateKeyFromOffset,
  formatCaptureDateLabel,
  getTodayDateKey,
  isFutureDateKey
} from "../src/features/capture/captureDate";

declare const process: {
  env: Record<string, string | undefined>;
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

function test(name: string, run: () => void) {
  tests.push({ name, run });
}

function assertEqual<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

const referenceDate = new Date("2026-06-09T15:30:00.000+07:00");

test("buildOccurredAtIso returns undefined for today", () => {
  assertEqual(buildOccurredAtIso(null, referenceDate), undefined, "null date");
  assertEqual(buildOccurredAtIso(getTodayDateKey(referenceDate), referenceDate), undefined, "today key");
});

test("buildOccurredAtIso keeps local clock time on backdated days", () => {
  const yesterdayKey = dateKeyFromOffset(-1, referenceDate);
  const iso = buildOccurredAtIso(yesterdayKey, referenceDate);
  if (!iso) {
    throw new Error("expected iso for yesterday");
  }
  const parsed = new Date(iso);
  assertEqual(parsed.getFullYear(), 2026, "year");
  assertEqual(parsed.getMonth(), 5, "month");
  assertEqual(parsed.getDate(), 8, "day");
  assertEqual(parsed.getHours(), 15, "hour");
});

test("isFutureDateKey rejects tomorrow", () => {
  const tomorrowKey = dateKeyFromOffset(1, referenceDate);
  assertEqual(isFutureDateKey(tomorrowKey, referenceDate), true, "tomorrow is future");
  assertEqual(isFutureDateKey(getTodayDateKey(referenceDate), referenceDate), false, "today is allowed");
});

test("formatCaptureDateLabel returns null for today and yesterday label for yesterday", () => {
  assertEqual(formatCaptureDateLabel(null, referenceDate), null, "today null");
  const yesterdayKey = dateKeyFromOffset(-1, referenceDate);
  const label = formatCaptureDateLabel(yesterdayKey, referenceDate);
  if (!label || !/kemarin|yesterday/i.test(label)) {
    throw new Error(`expected yesterday label, got ${label ?? "null"}`);
  }
});

test("buildCaptureQuickDateOptions includes today and three lookback chips", () => {
  const options = buildCaptureQuickDateOptions(referenceDate);
  assertEqual(options.length, 4, "quick option count");
  assertEqual(options[0]?.key, null, "first option is today");
  assertEqual(options[1]?.key, dateKeyFromOffset(-1, referenceDate), "second option is yesterday");
});

let passed = 0;

for (const { name, run } of tests) {
  try {
    run();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    break;
  }
}

if (process.exitCode !== 1) {
  console.log(`${passed} capture date tests passed.`);
}