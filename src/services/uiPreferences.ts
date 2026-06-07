import { readRaw, writeRaw } from "./storage";

const MEMORY_LIST_HINT_KEY = "slev_ui_memory_list_hint_seen";

export async function hasSeenMemoryListHint(): Promise<boolean> {
  return (await readRaw(MEMORY_LIST_HINT_KEY)) === "1";
}

export async function markMemoryListHintSeen(): Promise<void> {
  await writeRaw(MEMORY_LIST_HINT_KEY, "1");
}