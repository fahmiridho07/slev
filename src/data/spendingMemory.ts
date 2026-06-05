import { SpendingContext } from "../features/spendingMemory.types";

export const DEFAULT_SPENDING_CONTEXTS: SpendingContext[] = [
  "Meal",
  "Coffee",
  "Transport",
  "Groceries",
  "Bills",
  "Treat",
  "Home",
  "Other"
];

export const SPENDING_CONTEXTS = DEFAULT_SPENDING_CONTEXTS;

export const CONTEXT_HINTS: Record<string, string> = {
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
  const match = DEFAULT_SPENDING_CONTEXTS.find((context) => context.toLowerCase() === normalized);
  if (match) return match;

  if (["food", "dining", "restaurant"].includes(normalized)) return "Meal";
  if (["shopping", "entertainment"].includes(normalized)) return "Treat";
  if (["utility", "utilities", "subscription", "subscriptions"].includes(normalized)) return "Bills";
  if (["wallet", "misc", "miscellaneous"].includes(normalized)) return "Other";

  const cleaned = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "Other";
  return cleaned
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
    .slice(0, 32);
}
