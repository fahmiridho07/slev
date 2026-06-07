import { shouldCaptureSwipeGesture } from "../src/lib/swipeGesture";

declare const process: {
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

function assertCapture(dx: number, dy: number, isOpen: boolean, expected: boolean, label: string) {
  const actual = shouldCaptureSwipeGesture(dx, dy, isOpen);
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

test("shouldCaptureSwipeGesture ignores vertical scroll intent", () => {
  assertCapture(2, 18, false, false, "vertical scroll");
  assertCapture(-4, 12, false, false, "slight diagonal scroll");
});

test("shouldCaptureSwipeGesture opens on deliberate left swipe", () => {
  assertCapture(-24, 2, false, true, "left swipe");
  assertCapture(-14, 0, false, false, "short left swipe");
});

test("shouldCaptureSwipeGesture keeps horizontal control when open", () => {
  assertCapture(16, 2, true, true, "swipe right to close");
  assertCapture(-16, 2, true, true, "swipe left while open");
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
  console.log(`${passed} swipe gesture tests passed.`);
}