import { parseDeepLink } from "../src/navigation/deepLink";

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

function assertEqual<T>(actual: T, expected: T, label: string) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, got ${actualJson}`);
  }
}

test("parseDeepLink opens home capture focus", () => {
  assertEqual(parseDeepLink("slev://home/capture"), { tab: "home", openCapture: true }, "home capture");
  assertEqual(parseDeepLink("slev://home"), { tab: "home" }, "home root");
});

test("parseDeepLink routes settings sub-tabs", () => {
  assertEqual(parseDeepLink("slev://settings/appearance"), { tab: "settings", settingsTab: "appearance" }, "appearance");
  assertEqual(parseDeepLink("slev://settings"), { tab: "settings" }, "settings root");
});

test("parseDeepLink routes budget and analysis aliases", () => {
  assertEqual(parseDeepLink("slev://budget/balance"), { tab: "budget", budgetTab: "balance" }, "budget balance");
  assertEqual(parseDeepLink("slev://analysis/breakdown"), { tab: "patterns", patternTab: "breakdown" }, "analysis breakdown");
  assertEqual(parseDeepLink("slev://patterns"), { tab: "patterns" }, "patterns root");
});

test("parseDeepLink returns null for unknown routes", () => {
  assertEqual(parseDeepLink("slev://unknown"), null, "unknown route");
  assertEqual(parseDeepLink(""), null, "empty url");
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
  console.log(`${passed} deep link tests passed.`);
}