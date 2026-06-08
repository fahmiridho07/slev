import type { Locale } from "../i18n";
import { SettingsTabKey } from "../features/app.types";
import type { ColorScheme } from "../theme/types";
import { readRaw, writeRaw } from "./storage";

const COLOR_SCHEME_KEY = "slev_ui_color_scheme";
const LOCALE_KEY = "slev_ui_locale";
const NAV_STATE_KEY = "slev_ui_nav_state";
const MEMORY_LIST_HINT_KEY = "slev_ui_memory_list_hint_seen";
const REDUCE_MOTION_KEY = "slev_ui_reduce_motion";
const PAYDAY_DAY_KEY = "slev_finance_payday_day";
const SPEND_BUFFER_KEY = "slev_finance_spend_buffer";

export type ReduceMotionPreference = "off" | "on" | "system";

export type StoredNavState = {
  activeTab: string;
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

const SETTINGS_TABS = new Set<SettingsTabKey>(["accounts", "bills", "categories", "appearance", "data"]);

export function parseSettingsTab(value: unknown): SettingsTabKey {
  if (value === "balance") {
    return "accounts";
  }
  return typeof value === "string" && SETTINGS_TABS.has(value as SettingsTabKey)
    ? (value as SettingsTabKey)
    : "accounts";
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
      settingsTab: parseSettingsTab(parsed.settingsTab)
    };
  } catch {
    return null;
  }
}

export async function setNavStatePreference(state: StoredNavState): Promise<void> {
  await writeRaw(NAV_STATE_KEY, JSON.stringify(state));
}

export async function getPaydayDayPreference(): Promise<number | null> {
  const stored = await readRaw(PAYDAY_DAY_KEY);
  if (stored === null) return null;
  const parsed = Number.parseInt(stored, 10);
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 31 ? parsed : null;
}

export async function setPaydayDayPreference(day: number | null): Promise<void> {
  if (day === null) {
    await writeRaw(PAYDAY_DAY_KEY, "");
    return;
  }
  const clamped = Math.min(Math.max(Math.round(day), 1), 31);
  await writeRaw(PAYDAY_DAY_KEY, String(clamped));
}

export async function getSpendBufferPreference(): Promise<number> {
  const stored = await readRaw(SPEND_BUFFER_KEY);
  if (stored === null) return 0;
  const parsed = Number.parseInt(stored, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export async function setSpendBufferPreference(amount: number): Promise<void> {
  const normalized = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  await writeRaw(SPEND_BUFFER_KEY, normalized > 0 ? String(normalized) : "");
}