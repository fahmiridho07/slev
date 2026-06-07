import { SpendingContext } from "../features/spendingMemory.types";
import { getRuntimeStrings } from "./runtime";

export function displayContext(context: SpendingContext): string {
  const labels = getRuntimeStrings().capture.contextLabels;
  if (context in labels) {
    return labels[context as keyof typeof labels];
  }
  return context;
}