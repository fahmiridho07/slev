import type { Locale } from "../i18n";
import { BudgetTabKey, PatternTabKey, SettingsTabKey } from "../features/app.types";
import type { ColorScheme } from "../theme/types";
import { readRaw, writeRaw } from "./storage";

const COLOR_SCHEME_KEY = "slev_ui_color_scheme";
const LOCALE_KEY = "slev_ui_locale";
const NAV_STATE_KEY = "slev_ui_nav_state";
const MEMORY_LIST_HINT_KEY = "slev_ui_memory_list_hint_seen";
const CAPTURE_PANEL_KEY = "slev_ui_capture_panel";
const REDUCE_MOTION_KEY = "slev_ui_reduce_motion";

export type CapturePanelPreference = "compact" | "expanded";
export type ReduceMotionPreference = "off" | "on" | "system";

export type StoredNavState = {
  activeTab: string;
  budgetTab: BudgetTabKey;
  patternTab: PatternTabKey;
  settingsTab: SettingsTabKey;
};

export type ListActionsHintKey =
  | "balance_accounts"
  | "goals"
  | "memory"
  | "recurring_bills"
  | "settings_categories";

const LIST_ACTIONS_HINT_KEYS: Record<ListActionsHintKey, string> = {
  memory: MEMORY_LIST_HINT_KEY,
  balance_accounts: "slev_ui_balance_list_hint_seen",
  goals: "slev_ui_goals_list_hint_seen",
  recurring_bills: "slev_ui_bills_list_hint_seen",
  settings_categories: "slev_ui_settings_categories_hint_seen"
};

const BUDGET_TABS = new Set<BudgetTabKey>(["plan", "balance", "goals"]);
const PATTERN_TABS = new Set<PatternTabKey>(["overview", "breakdown", "accounts"]);
const SETTINGS_TABS = new Set<SettingsTabKey>(["bills", "categories", "appearance", "data"]);

function parseBudgetTab(value: unknown): BudgetTabKey {
  return typeof value === "string" && BUDGET_TABS.has(value as BudgetTabKey) ? (value as BudgetTabKey) : "plan";
}

function parsePatternTab(value: unknown): PatternTabKey {
  return typeof value === "string" && PATTERN_TABS.has(value as PatternTabKey)
    ? (value as PatternTabKey)
    : "overview";
}

function parseSettingsTab(value: unknown): SettingsTabKey {
  return typeof value === "string" && SETTINGS_TABS.has(value as SettingsTabKey)
    ? (value as SettingsTabKey)
    : "bills";
}

export async function hasSeenListActionsHint(key: ListActionsHintKey): Promise<boolean> {
  return (await readRaw(LIST_ACTIONS_HINT_KEYS[key])) === "1";
}

export async function markListActionsHintSeen(key: ListActionsHintKey): Promise<void> {
  await writeRaw(LIST_ACTIONS_HINT_KEYS[key], "1");
}

/** @deprecated Use hasSeenListActionsHint("memory") */
export async function hasSeenMemoryListHint(): Promise<boolean> {
  return hasSeenListActionsHint("memory");
}

/** @deprecated Use markListActionsHintSeen("memory") */
export async function markMemoryListHintSeen(): Promise<void> {
  await markListActionsHintSeen("memory");
}

export async function getColorSchemePreference(): Promise<ColorScheme> {
  const stored = await readRaw(COLOR_SCHEME_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

export async function setColorSchemePreference(scheme: ColorScheme): Promise<void> {
  await writeRaw(COLOR_SCHEME_KEY, scheme);
}

export function detectDeviceLocale(): Locale {
  try {
    const tag = Intl.DateTimeFormat().resolvedOptions().locale ?? "";
    return tag.toLowerCase().startsWith("id") ? "id" : "en";
  } catch {
    return "en";
  }
}

export async function getLocalePreference(): Promise<Locale> {
  const stored = await readRaw(LOCALE_KEY);
  if (stored === "id" || stored === "en") {
    return stored;
  }
  return detectDeviceLocale();
}

export async function setLocalePreference(locale: Locale): Promise<void> {
  await writeRaw(LOCALE_KEY, locale);
}

export async function getCapturePanelPreference(): Promise<CapturePanelPreference> {
  const stored = await readRaw(CAPTURE_PANEL_KEY);
  return stored === "compact" ? "compact" : "expanded";
}

export async function setCapturePanelPreference(preference: CapturePanelPreference): Promise<void> {
  await writeRaw(CAPTURE_PANEL_KEY, preference);
}

export async function getReduceMotionPreference(): Promise<ReduceMotionPreference> {
  const stored = await readRaw(REDUCE_MOTION_KEY);
  if (stored === "on" || stored === "off") {
    return stored;
  }
  return "system";
}

export async function setReduceMotionPreference(preference: ReduceMotionPreference): Promise<void> {
  await writeRaw(REDUCE_MOTION_KEY, preference);
}

export async function getNavStatePreference(): Promise<StoredNavState | null> {
  const stored = await readRaw(NAV_STATE_KEY);
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<StoredNavState>;
    if (typeof parsed.activeTab !== "string") {
      return null;
    }

    return {
      activeTab: parsed.activeTab,
      budgetTab: parseBudgetTab(parsed.budgetTab),
      patternTab: parsePatternTab(parsed.patternTab),
      settingsTab: parseSettingsTab(parsed.settingsTab)
    };
  } catch {
    return null;
  }
}

export async function setNavStatePreference(state: StoredNavState): Promise<void> {
  await writeRaw(NAV_STATE_KEY, JSON.stringify(state));
}