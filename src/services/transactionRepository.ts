import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  FinanceSource,
  ParsedTransaction,
  SourceAppId,
  SyncSettings,
  TransactionCategory,
  TransactionDraft,
  TransactionSyncStatus,
  TransactionStatus
} from "../features/transactions.types";

const TRANSACTIONS_KEY = "flowtrack.transactions.v1";
const SOURCES_KEY = "flowtrack.sources.v1";
const CATEGORIES_KEY = "flowtrack.categories.v1";
const SYNC_SETTINGS_KEY = "flowtrack.syncSettings.v1";

export async function listTransactions(): Promise<TransactionDraft[]> {
  const raw = await AsyncStorage.getItem(TRANSACTIONS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeTransaction)
      .filter((transaction) => transaction.amount > 0)
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  } catch {
    return [];
  }
}

export async function saveParsedTransaction(transaction: ParsedTransaction): Promise<TransactionDraft> {
  const now = new Date().toISOString();
  const draft: TransactionDraft = {
    ...transaction,
    id: createId(),
    status: "draft",
    syncStatus: "pending",
    createdAt: now,
    updatedAt: now
  };

  const transactions = await listTransactions();
  await persistTransactions([draft, ...transactions]);

  return draft;
}

export async function updateTransactionStatus(
  id: string,
  status: TransactionStatus,
  syncStatus?: TransactionSyncStatus
): Promise<TransactionDraft[]> {
  const transactions = await listTransactions();
  const updated = transactions.map((transaction) =>
    transaction.id === id
      ? {
          ...transaction,
          status,
          syncStatus: syncStatus ?? transaction.syncStatus,
          syncError: status === "confirmed" ? undefined : transaction.syncError,
          updatedAt: new Date().toISOString()
        }
      : transaction
  );

  await persistTransactions(updated);
  return updated;
}

export async function updateTransactionSyncState(
  id: string,
  syncState: {
    syncStatus: TransactionSyncStatus;
    syncError?: string;
    syncedAt?: string;
  }
): Promise<TransactionDraft[]> {
  const transactions = await listTransactions();
  const updated = transactions.map((transaction) =>
    transaction.id === id
      ? {
          ...transaction,
          ...syncState,
          updatedAt: new Date().toISOString()
        }
      : transaction
  );

  await persistTransactions(updated);
  return updated;
}

export async function updateTransactionCategory(
  id: string,
  category: TransactionCategory
): Promise<TransactionDraft[]> {
  const transactions = await listTransactions();
  const updated = transactions.map((transaction) =>
    transaction.id === id
      ? {
          ...transaction,
          category,
          updatedAt: new Date().toISOString()
        }
      : transaction
  );

  await persistTransactions(updated);
  return updated;
}

export async function clearTransactions(): Promise<void> {
  await AsyncStorage.removeItem(TRANSACTIONS_KEY);
}

export async function loadCategories(defaults: TransactionCategory[]): Promise<TransactionCategory[]> {
  const raw = await AsyncStorage.getItem(CATEGORIES_KEY);
  if (!raw) return defaults;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return defaults;

    return mergeCategories(defaults, parsed);
  } catch {
    return defaults;
  }
}

export async function saveCategories(categories: TransactionCategory[]): Promise<void> {
  await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export async function loadSources(defaults: FinanceSource[]): Promise<FinanceSource[]> {
  const raw = await AsyncStorage.getItem(SOURCES_KEY);
  if (!raw) return defaults;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return defaults;

    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      const legacyBankSources = ["bca-mobile", "mybca", "livin-mandiri"];
      const hadLegacyBankSource = parsed.some((sourceId) => legacyBankSources.includes(sourceId));

      return defaults.map((source) => ({
        ...source,
        enabled: parsed.includes(source.id) || (hadLegacyBankSource && source.id === "brimo")
      }));
    }

    if (Array.isArray(parsed)) {
      return mergeSources(defaults, parsed.map(sanitizeSource).filter(Boolean) as FinanceSource[]);
    }

    return defaults;
  } catch {
    return defaults;
  }
}

export async function saveSources(sources: FinanceSource[]): Promise<void> {
  await AsyncStorage.setItem(SOURCES_KEY, JSON.stringify(sources));
}

export async function loadEnabledSources(defaults: SourceAppId[] | FinanceSource[]): Promise<SourceAppId[]> {
  const normalizedDefaults = normalizeSourceDefaults(defaults);
  const sources = await loadSources(normalizedDefaults);

  return sources.filter((source) => source.enabled).map((source) => source.id);
}

export async function saveEnabledSources(sources: SourceAppId[]): Promise<void> {
  const currentSources = await loadSources([]);
  const merged = mergeSources(
    currentSources,
    sources.map((sourceId) => ({
      id: sourceId,
      label: sourceId,
      keywords: [sourceId],
      enabled: true,
      builtIn: false
    }))
  ).map((source) => ({
    ...source,
    enabled: sources.includes(source.id)
  }));

  await saveSources(merged);
}

export async function loadSyncSettings(): Promise<SyncSettings> {
  const raw = await AsyncStorage.getItem(SYNC_SETTINGS_KEY);
  if (!raw) {
    return { endpointUrl: "", sheetUrl: "" };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SyncSettings>;
    return {
      endpointUrl: parsed.endpointUrl ?? "",
      sheetUrl: parsed.sheetUrl ?? ""
    };
  } catch {
    return { endpointUrl: "", sheetUrl: "" };
  }
}

export async function saveSyncSettings(settings: SyncSettings): Promise<void> {
  await AsyncStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(settings));
}

async function persistTransactions(transactions: TransactionDraft[]): Promise<void> {
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeTransaction(value: unknown): TransactionDraft {
  const transaction = value as Partial<TransactionDraft>;
  const now = new Date().toISOString();

  return {
    amount: typeof transaction.amount === "number" ? transaction.amount : 0,
    category: transaction.category || "Other",
    confidence: typeof transaction.confidence === "number" ? transaction.confidence : 0,
    createdAt: transaction.createdAt || now,
    id: transaction.id || createId(),
    merchant: transaction.merchant || "Unknown",
    method: transaction.method || "Unknown",
    source: transaction.source || "unknown",
    sourceLabel: transaction.sourceLabel || "Unknown",
    status: transaction.status || "draft",
    syncedAt: transaction.syncedAt,
    syncError: transaction.syncError,
    syncStatus:
      transaction.syncStatus ??
      (transaction.status === "confirmed" ? "not_configured" : "pending"),
    timestamp: transaction.timestamp || now,
    transactionType: transaction.transactionType || "unknown",
    updatedAt: transaction.updatedAt || now
  };
}

function mergeSources(defaults: FinanceSource[], stored: FinanceSource[]): FinanceSource[] {
  const storedById = new Map(stored.map((source) => [source.id, source]));
  const mergedDefaults = defaults.map((source) => ({
    ...source,
    enabled: storedById.get(source.id)?.enabled ?? source.enabled
  }));
  const customSources = stored.filter((source) => !defaults.some((defaultSource) => defaultSource.id === source.id));

  return [...mergedDefaults, ...customSources];
}

function mergeCategories(defaults: TransactionCategory[], stored: TransactionCategory[]): TransactionCategory[] {
  return Array.from(
    new Set(
      [...defaults, ...stored]
        .filter((category) => typeof category === "string")
        .map((category) => category.trim())
        .filter(Boolean)
    )
  );
}

function normalizeSourceDefaults(defaults: SourceAppId[] | FinanceSource[]): FinanceSource[] {
  return defaults.map((source) => {
    if (typeof source !== "string") return source;

    return {
      id: source,
      label: source,
      keywords: [source],
      enabled: true,
      builtIn: true
    };
  });
}

function sanitizeSource(source: unknown): FinanceSource | null {
  if (!source || typeof source !== "object") return null;

  const value = source as Partial<FinanceSource>;
  if (!value.id && !value.label) return null;

  const id = String(value.id || value.label).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const label = String(value.label || value.id).trim();
  const keywords = Array.isArray(value.keywords)
    ? value.keywords.filter((keyword) => typeof keyword === "string" && keyword.trim())
    : [];

  return {
    id,
    label,
    keywords: Array.from(new Set([id, label.toLowerCase(), ...keywords])),
    enabled: value.enabled !== false,
    builtIn: value.builtIn === true
  };
}
