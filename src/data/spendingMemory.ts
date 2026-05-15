import { SpendingContext } from "../features/spendingMemory.types";

export const SPENDING_CONTEXTS: SpendingContext[] = [
  "Meal",
  "Coffee",
  "Transport",
  "Groceries",
  "Bills",
  "Treat",
  "Home",
  "Other"
];

export const CONTEXT_HINTS: Record<SpendingContext, string> = {
  Meal: "Food, snacks, lunch",
  Coffee: "Coffee or tea runs",
  Transport: "Ride, fuel, parking",
  Groceries: "Daily supplies",
  Bills: "Recurring payments",
  Treat: "Small nice things",
  Home: "Household needs",
  Other: "Anything else"
};

export function normalizeSpendingContext(value: string | undefined): SpendingContext {
  const normalized = String(value ?? "").trim().toLowerCase();
  const match = SPENDING_CONTEXTS.find((context) => context.toLowerCase() === normalized);
  if (match) return match;

  if (["food", "dining", "restaurant"].includes(normalized)) return "Meal";
  if (["shopping", "entertainment"].includes(normalized)) return "Treat";

  return "Other";
}
