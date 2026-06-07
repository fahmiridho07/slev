import { BudgetTabKey, PatternTabKey, SettingsTabKey } from "../features/app.types";
import { AppTabKey } from "./appNavigation";

export type DeepLinkTarget =
  | { tab: "home"; openCapture?: boolean }
  | { tab: "overview" }
  | { tab: "budget"; budgetTab?: BudgetTabKey }
  | { tab: "patterns"; patternTab?: PatternTabKey }
  | { tab: "settings"; settingsTab?: SettingsTabKey };

const BUDGET_TABS = new Set<BudgetTabKey>(["plan", "balance", "goals"]);
const PATTERN_TABS = new Set<PatternTabKey>(["overview", "breakdown", "accounts"]);
const SETTINGS_TABS = new Set<SettingsTabKey>(["bills", "categories", "appearance", "data"]);

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
    return { tab: "overview" };
  }
  if (root === "settings") {
    const sub = parts[1]?.toLowerCase() as SettingsTabKey | undefined;
    if (sub && SETTINGS_TABS.has(sub)) {
      return { tab: "settings", settingsTab: sub };
    }
    return { tab: "settings" };
  }
  if (root === "patterns" || root === "analysis") {
    const sub = parts[1]?.toLowerCase() as PatternTabKey | undefined;
    if (sub && PATTERN_TABS.has(sub)) {
      return { tab: "patterns", patternTab: sub };
    }
    return { tab: "patterns" };
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
  return (
    value === "home"
    || value === "overview"
    || value === "budget"
    || value === "patterns"
    || value === "settings"
  );
}

export function normalizeStoredTabKey(value: string): AppTabKey | null {
  if (value === "memory") {
    return "overview";
  }
  return isAppTabKey(value) ? value : null;
}