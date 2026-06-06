import { shallowEqual } from "../src/state/shallowEqual";

declare const process: {
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

test("shallowEqual returns true for identical references", () => {
  const value = { a: 1, b: "two" };
  assertEqual(shallowEqual(value, value), true, "same reference");
});

test("shallowEqual compares one-level object fields", () => {
  assertEqual(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 }), true, "matching fields");
  assertEqual(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 3 }), false, "different field");
  assertEqual(shallowEqual({ a: 1 }, { a: 1, b: 2 }), false, "different key count");
});

for (const testCase of tests) {
  try {
    testCase.run();
    console.log(`ok - ${testCase.name}`);
  } catch (error) {
    console.error(`not ok - ${testCase.name}`);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

if (process.exitCode) {
  console.error("shallowEqual tests failed.");
} else {
  console.log(`${tests.length} shallowEqual tests passed.`);
}

function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}.`);
  }
}