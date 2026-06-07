import {
  applyItemOrder,
  keysFromItems,
  reorderItemsByKey
} from "../src/lib/applyItemOrder";

declare const process: {
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

test("applyItemOrder respects saved keys and appends new items", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const ordered = applyItemOrder(items, ["c", "a"], (item) => item.id);
  assertEqual(
    ordered.map((item) => item.id).join(","),
    "c,a,b",
    "ordered ids"
  );
});

test("reorderItemsByKey moves one item before another", () => {
  const items = ["Meal", "Coffee", "Transport"];
  const next = reorderItemsByKey(items, "Transport", "Meal", (item) => item);
  assertEqual(next.join(","), "Transport,Meal,Coffee", "reordered labels");
});

test("keysFromItems returns stable keys", () => {
  assertEqual(
    keysFromItems([{ label: "Jago" }, { label: "BRI" }], (item) => item.label).join(","),
    "Jago,BRI",
    "keys"
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
  console.log(`${passed} apply item order tests passed.`);
}

function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}.`);
  }
}