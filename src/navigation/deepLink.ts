import { SettingsTabKey } from "../features/app.types";
import { AppTabKey } from "./appNavigation";

export type DeepLinkTarget =
  | { tab: "home"; openCapture?: boolean }
  | { tab: "money" }
  | { tab: "settings"; settingsTab?: SettingsTabKey };

const SETTINGS_TABS = new Set<SettingsTabKey>(["accounts", "bills", "categories", "appearance", "data"]);

function parseSettingsTab(sub: string | undefined): SettingsTabKey | undefined {
  if (sub === "balance") {
    return "accounts";
  }
  if (sub && SETTINGS_TABS.has(sub as SettingsTabKey)) {
    return sub as SettingsTabKey;
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
  if (root === "overview" || root === "memory" || root === "patterns" || root === "analysis" || root === "money") {
    return { tab: "money" };
  }
  if (root === "budget") {
    return { tab: "settings", settingsTab: "accounts" };
  }
  if (root === "settings") {
    const settingsTab = parseSettingsTab(parts[1]?.toLowerCase());
    return settingsTab ? { tab: "settings", settingsTab } : { tab: "settings" };
  }

  return null;
}

export function isAppTabKey(value: string): value is AppTabKey {
  return value === "home" || value === "money" || value === "settings";
}

export function normalizeStoredTabKey(value: string): AppTabKey | null {
  if (value === "memory" || value === "overview" || value === "patterns") {
    return "money";
  }
  if (value === "budget") {
    return "money";
  }
  return isAppTabKey(value) ? value : null;
}