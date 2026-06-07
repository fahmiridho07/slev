import { BudgetTabKey } from "../features/app.types";
import { AppTabKey } from "./appNavigation";

export type DeepLinkTarget =
  | { tab: "home" }
  | { tab: "memory" }
  | { tab: "budget"; budgetTab?: BudgetTabKey }
  | { tab: "patterns" }
  | { tab: "settings" };

const BUDGET_TABS = new Set<BudgetTabKey>(["plan", "balance", "goals"]);

export function parseDeepLink(url: string): DeepLinkTarget | null {
  const normalized = url.replace(/^[^:]+:\/\//, "").replace(/\/$/, "");
  const parts = normalized.split("/").filter(Boolean);
  const root = parts[0]?.toLowerCase();

  if (root === "home") return { tab: "home" };
  if (root === "memory") return { tab: "memory" };
  if (root === "settings") return { tab: "settings" };
  if (root === "patterns" || root === "analysis") return { tab: "patterns" };
  if (root === "budget") {
    const sub = parts[1]?.toLowerCase() as BudgetTabKey | undefined;
    if (sub && BUDGET_TABS.has(sub)) {
      return { tab: "budget", budgetTab: sub };
    }
    return { tab: "budget", budgetTab: "plan" };
  }

  return null;
}

export function isAppTabKey(value: string): value is AppTabKey {
  return value === "home" || value === "memory" || value === "budget" || value === "patterns" || value === "settings";
}