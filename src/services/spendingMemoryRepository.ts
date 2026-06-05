import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  EntryType,
  PatternFeedback,
  PatternFeedbackResponse,
  SpendingMoment
} from "../features/spendingMemory.types";
import { normalizeSpendingContext } from "../data/spendingMemory";

const MOMENTS_KEY = "slev_entries";
const LEGACY_MOMENTS_KEY = "slev.spendingMoments.v1";
const FEEDBACK_KEY = "slev_pattern_feedback";
const LEGACY_FEEDBACK_KEY = "slev.patternFeedback.v1";
const V2_MIGRATION_KEY = "slev_migrated_v2";
const LEGACY_TRANSACTIONS_KEY = "flowtrack.transactions.v1";

type MomentInput = {
  amount: number;
  occurredAt?: string;
  label?: string;
  context?: string;
  note?: string;
  type?: EntryType;
  source?: string;
  accountLabel?: string;
};

type LegacyTransaction = {
  id?: string;
  amount?: number;
  merchant?: string;
  category?: string;
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
};

export async function listSpendingMoments(): Promise<SpendingMoment[]> {
  await migrateSpendingMemoryV2();
  const raw = await readStorage(MOMENTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return sortMoments(parsed.map(normalizeMoment).filter((moment) => moment.amount > 0));
  } catch {
    return [];
  }
}

export async function saveSpendingMoment(input: MomentInput): Promise<SpendingMoment> {
  const now = new Date().toISOString();
  const moment = normalizeMoment({
    ...input,
    id: createId(),
    occurredAt: input.occurredAt ?? now,
    createdAt: now,
    updatedAt: now
  });

  const moments = await listSpendingMoments();
  await persistSpendingMoments([moment, ...moments]);
  return moment;
}

export async function updateSpendingMoment(
  id: string,
  input: MomentInput
): Promise<SpendingMoment[]> {
  const moments = await listSpendingMoments();
  const updated = moments.map((moment) =>
    moment.id === id
      ? normalizeMoment({
          ...moment,
          ...input,
          occurredAt: input.occurredAt ?? moment.occurredAt,
          updatedAt: new Date().toISOString()
        })
      : moment
  );

  await persistSpendingMoments(updated);
  return sortMoments(updated);
}

export async function deleteSpendingMoment(id: string): Promise<SpendingMoment[]> {
  const moments = await listSpendingMoments();
  const updated = moments.filter((moment) => moment.id !== id);
  await persistSpendingMoments(updated);
  return updated;
}

export async function clearSpendingMemory(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([MOMENTS_KEY, LEGACY_MOMENTS_KEY, FEEDBACK_KEY, LEGACY_FEEDBACK_KEY]);
    await AsyncStorage.setItem(V2_MIGRATION_KEY, "true");
  } catch {
    return;
  }
}

export async function listPatternFeedback(): Promise<PatternFeedback[]> {
  const raw = await readStorage(FEEDBACK_KEY);
  if (!raw) {
    const legacyRaw = await readStorage(LEGACY_FEEDBACK_KEY);
    if (!legacyRaw) return [];
    const migrated = parsePatternFeedbackList(legacyRaw);
    await persistPatternFeedback(migrated);
    return migrated;
  }

  return parsePatternFeedbackList(raw);
}

export async function savePatternFeedback(
  patternId: string,
  response: PatternFeedbackResponse
): Promise<PatternFeedback[]> {
  const current = await listPatternFeedback();
  const next: PatternFeedback = {
    patternId,
    response,
    createdAt: new Date().toISOString()
  };
  const updated = [next, ...current.filter((item) => item.patternId !== patternId)].slice(0, 100);
  await persistPatternFeedback(updated);
  return updated;
}

async function migrateSpendingMemoryV2(): Promise<void> {
  const alreadyMigrated = await readStorage(V2_MIGRATION_KEY);
  if (alreadyMigrated === "true") return;

  const raw = await readStorage(MOMENTS_KEY);
  const legacyMomentsRaw = raw ? null : await readStorage(LEGACY_MOMENTS_KEY);
  const existingMoments = parseMomentList(raw ?? legacyMomentsRaw);
  const legacyTransactionMoments = await migrateConfirmedTransactions();
  const mergedMoments = dedupeMomentsById([...legacyTransactionMoments, ...existingMoments]);

  if (
    legacyMomentsRaw ||
    legacyTransactionMoments.length > 0 ||
    existingMoments.some((moment) => moment.type !== "expense" && moment.type !== "income") ||
    raw !== JSON.stringify(sortMoments(mergedMoments).map(normalizeMoment))
  ) {
    await persistSpendingMoments(mergedMoments);
  }

  try {
    await AsyncStorage.setItem(V2_MIGRATION_KEY, "true");
  } catch {
    return;
  }
}

function parseMomentList(raw: string | null): SpendingMoment[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeMoment).filter((moment) => moment.amount > 0);
  } catch {
    return [];
  }
}

function parsePatternFeedbackList(raw: string): PatternFeedback[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizePatternFeedback).filter(Boolean) as PatternFeedback[];
  } catch {
    return [];
  }
}

async function migrateConfirmedTransactions(): Promise<SpendingMoment[]> {
  const raw = await readStorage(LEGACY_TRANSACTIONS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => item as LegacyTransaction)
      .filter((item) => item.status === "confirmed" && typeof item.amount === "number" && item.amount > 0)
      .map((item) =>
        normalizeMoment({
          id: `migrated-${item.id ?? createId()}`,
          amount: item.amount,
          occurredAt: item.timestamp ?? item.createdAt ?? new Date().toISOString(),
          label: cleanOptionalText(item.merchant),
          context: normalizeSpendingContext(item.category),
          type: "expense",
          createdAt: item.createdAt ?? new Date().toISOString(),
          updatedAt: item.updatedAt ?? new Date().toISOString()
        })
      );
  } catch {
    return [];
  }
}

async function persistSpendingMoments(moments: SpendingMoment[]): Promise<void> {
  try {
    await AsyncStorage.setItem(MOMENTS_KEY, JSON.stringify(sortMoments(moments).map(normalizeMoment)));
  } catch {
    return;
  }
}

async function persistPatternFeedback(feedback: PatternFeedback[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback.map(normalizePatternFeedback).filter(Boolean)));
  } catch {
    return;
  }
}

async function readStorage(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

function normalizeMoment(value: unknown): SpendingMoment {
  const source = value as Partial<SpendingMoment>;
  const now = new Date().toISOString();
  const type: EntryType = source.type === "income" ? "income" : "expense";
  return {
    id: source.id || createId(),
    amount: typeof source.amount === "number" ? Math.max(0, Math.round(source.amount)) : 0,
    occurredAt: source.occurredAt || now,
    label: type === "income" ? cleanOptionalText(source.label) : cleanOptionalText(source.label),
    context: type === "income" ? "Other" : normalizeSpendingContext(source.context),
    note: cleanOptionalText(source.note),
    type,
    source: type === "income" ? cleanOptionalText(source.source ?? source.label) : undefined,
    accountLabel: cleanOptionalText(source.accountLabel),
    createdAt: source.createdAt || now,
    updatedAt: source.updatedAt || now
  };
}

function normalizePatternFeedback(value: unknown): PatternFeedback | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Partial<PatternFeedback>;
  if (!source.patternId || !source.response) return null;
  if (!["keep", "less_often", "not_sure"].includes(source.response)) return null;

  return {
    patternId: source.patternId,
    response: source.response,
    createdAt: source.createdAt || new Date().toISOString()
  };
}

function sortMoments(moments: SpendingMoment[]): SpendingMoment[] {
  return [...moments].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

function dedupeMomentsById(moments: SpendingMoment[]): SpendingMoment[] {
  const byId = new Map<string, SpendingMoment>();
  moments.forEach((moment) => {
    byId.set(moment.id, moment);
  });
  return sortMoments(Array.from(byId.values()));
}

function cleanOptionalText(value: string | undefined): string | undefined {
  const cleaned = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!cleaned || ["Unknown", "Manual entry"].includes(cleaned)) return undefined;
  return cleaned.slice(0, 80);
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
