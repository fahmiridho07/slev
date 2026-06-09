import { getCaptureValidationError, getShortcutValidationError } from "../src/features/capture/captureValidation";
import { CaptureFormValues } from "../src/features/capture/types";

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

function baseCapture(overrides: Partial<CaptureFormValues> = {}): CaptureFormValues {
  return {
    accountLabel: "Jago",
    amountText: "",
    context: "Meal",
    entryType: "expense",
    fromAccount: "BRI",
    label: "",
    note: "",
    occurredAtKey: null,
    source: "",
    toAccount: "Jago",
    ...overrides
  };
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

test("getCaptureValidationError requires an amount", () => {
  assertField(getCaptureValidationError(baseCapture(), 1), "amount", "empty amount");
});

test("getCaptureValidationError requires categories for expenses", () => {
  assertField(getCaptureValidationError(baseCapture({ amountText: "10000" }), 0), "category", "no categories");
});

test("getCaptureValidationError requires account for expenses", () => {
  assertField(
    getCaptureValidationError(baseCapture({ amountText: "10000", accountLabel: "" }), 1),
    "momentAccount",
    "missing expense account"
  );
});

test("getCaptureValidationError requires account for income", () => {
  assertField(
    getCaptureValidationError(
      baseCapture({ amountText: "10000", entryType: "income", accountLabel: "   " }),
      1
    ),
    "momentAccount",
    "missing income account"
  );
});

test("getCaptureValidationError accepts valid expense account", () => {
  const error = getCaptureValidationError(baseCapture({ amountText: "10000", accountLabel: "Jago" }), 1);
  if (error !== null) {
    throw new Error(`expected no validation error, got ${error.field}`);
  }
});

test("getCaptureValidationError accepts valid income account", () => {
  const error = getCaptureValidationError(
    baseCapture({ amountText: "10000", entryType: "income", accountLabel: "BRI" }),
    1
  );
  if (error !== null) {
    throw new Error(`expected no validation error, got ${error.field}`);
  }
});

test("getCaptureValidationError checks transfer accounts", () => {
  assertField(
    getCaptureValidationError(
      baseCapture({
        amountText: "10000",
        entryType: "transfer",
        fromAccount: "BRI",
        toAccount: "BRI"
      }),
      1
    ),
    "transferAccounts",
    "same transfer accounts"
  );
});

test("getShortcutValidationError blocks transfer shortcuts", () => {
  assertField(
    getShortcutValidationError(baseCapture({ entryType: "transfer", amountText: "10000" })),
    "shortcutTransfer",
    "transfer shortcut"
  );
});

test("getCaptureValidationError rejects future dates", () => {
  assertField(
    getCaptureValidationError(
      baseCapture({ amountText: "10000", occurredAtKey: "2099-01-01" }),
      1
    ),
    "occurredAt",
    "future date"
  );
});

test("getShortcutValidationError requires a source for income shortcuts", () => {
  assertField(
    getShortcutValidationError(baseCapture({ entryType: "income", amountText: "10000", source: "" })),
    "shortcutLabel",
    "missing income source"
  );
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
  console.log(`${passed} capture validation tests passed.`);
}