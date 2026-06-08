import { readJson, removeKeys, WriteResult, writeJson } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export type BalanceAnchor = {
  amount: number;
  setAt: string;
};

export async function getBalanceAnchor(): Promise<BalanceAnchor | null> {
  const result = await readJson<unknown>(STORAGE_KEYS.balanceAnchor);
  if (result.status !== "ok" || !result.value || typeof result.value !== "object") {
    return null;
  }

  const value = result.value as Record<string, unknown>;
  const amount = typeof value.amount === "number" ? Math.round(value.amount) : null;
  const setAt = typeof value.setAt === "string" ? value.setAt : null;
  if (amount === null || !setAt || amount <= 0) {
    return null;
  }

  return { amount, setAt };
}

export async function saveBalanceAnchor(amount: number): Promise<WriteResult<BalanceAnchor>> {
  const anchor: BalanceAnchor = {
    amount: Math.round(amount),
    setAt: new Date().toISOString()
  };
  const persisted = await writeJson(STORAGE_KEYS.balanceAnchor, anchor);
  return { data: anchor, persisted };
}

export async function clearBalanceAnchor(): Promise<boolean> {
  return removeKeys([STORAGE_KEYS.balanceAnchor]);
}