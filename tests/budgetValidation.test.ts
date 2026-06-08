import {
  getAccountValidationError,
  getBalanceAnchorValidationError
} from "../src/features/budget/budgetValidation";

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

function assertField(actual: { field: string; message: string } | null, field: string, label: string) {
  if (!actual) {
    throw new Error(`${label}: expected validation error for ${field}`);
  }
  if (actual.field !== field) {
    throw new Error(`${label}: expected field ${field}, got ${actual.field}`);
  }
  if (!actual.message.trim()) {
    throw new Error(`${label}: expected non-empty message`);
  }
}

test("getAccountValidationError requires a label", () => {
  assertField(getAccountValidationError(""), "label", "empty label");
  assertField(getAccountValidationError("   "), "label", "whitespace label");
});

test("getBalanceAnchorValidationError requires a positive amount", () => {
  assertField(getBalanceAnchorValidationError(""), "amount", "missing amount");
  assertField(getBalanceAnchorValidationError("0"), "amount", "zero amount");
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
  console.log(`${passed} budget validation tests passed.`);
}