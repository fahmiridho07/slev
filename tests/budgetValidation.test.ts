import {
  getAccountValidationError,
  getBalanceSnapshotValidationError,
  getGoalValidationError,
  getLimitValidationError,
  getPlanValidationError
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

test("getBalanceSnapshotValidationError checks account and amount", () => {
  assertField(getBalanceSnapshotValidationError({ accountLabel: "", amount: "1000" }), "accountLabel", "missing account");
  assertField(getBalanceSnapshotValidationError({ accountLabel: "BRI", amount: "" }), "amount", "missing amount");
});

test("getGoalValidationError checks label and target amount", () => {
  assertField(getGoalValidationError({ label: "", targetAmount: "1000" }), "label", "missing label");
  assertField(getGoalValidationError({ label: "Emergency", targetAmount: "" }), "targetAmount", "missing target");
});

test("getLimitValidationError requires a positive amount", () => {
  assertField(getLimitValidationError(""), "amount", "empty limit");
  assertField(getLimitValidationError("0"), "amount", "zero limit");
});

test("getPlanValidationError requires expected income", () => {
  assertField(getPlanValidationError({ expectedIncome: "" }), "expectedIncome", "empty income");
  assertField(getPlanValidationError({ expectedIncome: "0" }), "expectedIncome", "zero income");
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