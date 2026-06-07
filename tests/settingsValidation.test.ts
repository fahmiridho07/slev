import { getImportJsonValidationError } from "../src/features/settings/dataValidation";
import { getBillValidationError, getCategoryValidationError } from "../src/features/settings/settingsValidation";
import { getMemoryEditValidationError } from "../src/features/memory/memoryValidation";

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

test("getCategoryValidationError requires a label", () => {
  assertField(getCategoryValidationError(""), "label", "empty category");
});

test("getBillValidationError checks bill fields", () => {
  assertField(getBillValidationError({ label: "", amount: "1000", dayOfMonth: "1" }), "label", "missing bill label");
  assertField(getBillValidationError({ label: "Rent", amount: "", dayOfMonth: "1" }), "amount", "missing bill amount");
  assertField(getBillValidationError({ label: "Rent", amount: "1000", dayOfMonth: "32" }), "dayOfMonth", "invalid bill day");
});

test("getImportJsonValidationError rejects invalid JSON", () => {
  assertField(getImportJsonValidationError(""), "importJson", "empty import");
  assertField(getImportJsonValidationError("{not-json"), "importJson", "invalid import json");
});

test("getMemoryEditValidationError requires an amount", () => {
  assertField(getMemoryEditValidationError(""), "amount", "empty memory amount");
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
  console.log(`${passed} settings validation tests passed.`);
}