import { BudgetTabKey, PatternTabKey, SettingsTabKey } from "../features/app.types";
import { AppTabKey } from "./appNavigation";

export type DeepLinkTarget =
  | { tab: "home"; openCapture?: boolean }
  | { tab: "money"; patternTab?: PatternTabKey }
  | { tab: "budget"; budgetTab?: BudgetTabKey }
  | { tab: "settings"; settingsTab?: SettingsTabKey };

const BUDGET_TABS = new Set<BudgetTabKey>(["plan", "balance", "goals"]);
const PATTERN_TABS = new Set<PatternTabKey>(["breakdown", "accounts"]);
const LEGACY_PATTERN_TABS = new Set(["overview", "recap"]);
const SETTINGS_TABS = new Set<SettingsTabKey>(["bills", "categories", "appearance", "data"]);

function parseMoneyPatternTab(sub: string | undefined): PatternTabKey | undefined {
  if (sub && PATTERN_TABS.has(sub as PatternTabKey)) {
    return sub as PatternTabKey;
  }
  if (sub && LEGACY_PATTERN_TABS.has(sub)) {
    return "breakdown";
  }
  return undefined;
}

export function parseDeepLink(url: string): DeepLinkTarget | null {
  const normalized = url.replace(/^[^:]+:\/\//, "").replace(/\/$/, "");
  const parts = normalized.split("/").filter(Boolean);
  const root = parts[0]?.toLowerCase();

  if (root === "home") {
    if (parts[1]?.toLowerCase() === "capture") {
      return { tab: "home", openCapture: true };
    }
    return { tab: "home" };
  }
  if (root === "overview" || root === "memory") {
    return { tab: "money" };
  }
  if (root === "settings") {
    const sub = parts[1]?.toLowerCase() as SettingsTabKey | undefined;
    if (sub && SETTINGS_TABS.has(sub)) {
      return { tab: "settings", settingsTab: sub };
    }
    return { tab: "settings" };
  }
  if (root === "patterns" || root === "analysis" || root === "money") {
    const sub = parts[1]?.toLowerCase();
    const patternTab = parseMoneyPatternTab(sub);
    return patternTab ? { tab: "money", patternTab } : { tab: "money" };
  }
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
  return value === "home" || value === "money" || value === "budget" || value === "settings";
}

export function normalizeStoredTabKey(value: string): AppTabKey | null {
  if (value === "memory" || value === "overview" || value === "patterns") {
    return "money";
  }
  return isAppTabKey(value) ? value : null;
}