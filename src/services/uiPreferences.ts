import { readRaw, writeRaw } from "./storage";

const MEMORY_LIST_HINT_KEY = "slev_ui_memory_list_hint_seen";

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