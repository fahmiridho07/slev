import AsyncStorage from "@react-native-async-storage/async-storage";

export type StorageDriver = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
};

export type ReadJsonResult<T = unknown> =
  | { status: "empty" }
  | { status: "ok"; value: T }
  | { status: "corrupt"; raw: string };

const defaultDriver: StorageDriver = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
  multiRemove: (keys) => AsyncStorage.multiRemove(keys)
};

let activeDriver: StorageDriver = defaultDriver;
const corruptKeys = new Set<string>();

export function setStorageDriver(driver: StorageDriver): void {
  activeDriver = driver;
}

export function resetStorageDriver(): void {
  activeDriver = defaultDriver;
  corruptKeys.clear();
}

export function isKeyCorrupt(key: string): boolean {
  return corruptKeys.has(key);
}

export function clearCorruptFlag(key: string): void {
  corruptKeys.delete(key);
}

export async function readRaw(key: string): Promise<string | null> {
  try {
    return await activeDriver.getItem(key);
  } catch {
    return null;
  }
}

export async function writeRaw(key: string, value: string): Promise<boolean> {
  if (corruptKeys.has(key)) {
    return false;
  }

  try {
    await activeDriver.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export async function removeKeys(keys: string[]): Promise<boolean> {
  try {
    await activeDriver.multiRemove(keys);
    keys.forEach((key) => corruptKeys.delete(key));
    return true;
  } catch {
    return false;
  }
}

export async function readJson<T = unknown>(key: string): Promise<ReadJsonResult<T>> {
  const raw = await readRaw(key);
  if (raw === null) {
    corruptKeys.delete(key);
    return { status: "empty" };
  }

  try {
    const value = JSON.parse(raw) as T;
    corruptKeys.delete(key);
    return { status: "ok", value };
  } catch {
    corruptKeys.add(key);
    await backupCorruptBlob(key, raw);
    return { status: "corrupt", raw };
  }
}

export async function writeJson(key: string, value: unknown): Promise<boolean> {
  if (corruptKeys.has(key)) {
    return false;
  }

  return writeRaw(key, JSON.stringify(value));
}

async function backupCorruptBlob(key: string, raw: string): Promise<void> {
  const backupKey = `slev_corrupt_backup__${key}__${Date.now()}`;
  try {
    await activeDriver.setItem(backupKey, raw);
  } catch {
    return;
  }
}