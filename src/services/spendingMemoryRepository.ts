import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PatternFeedback,
  PatternFeedbackResponse,
  SpendingMoment
} from "../features/spendingMemory.types";
import { normalizeSpendingContext } from "../data/spendingMemory";

const MOMENTS_KEY = "slev.spendingMoments.v1";
const FEEDBACK_KEY = "slev.patternFeedback.v1";
const MIGRATION_KEY = "slev.migrated.flowtrackTransactions.v1";
const LEGACY_TRANSACTIONS_KEY = "flowtrack.transactions.v1";

type MomentInput = {
  amount: number;
  occurredAt?: string;
  label?: string;
  context?: string;
  note?: string;
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
  const migrated = await AsyncStorage.getItem(MIGRATION_KEY);
  const raw = await AsyncStorage.getItem(MOMENTS_KEY);

  if (!raw && migrated !== "true") {
    const migratedMoments = await migrateConfirmedTransactions();
    await AsyncStorage.setItem(MIGRATION_KEY, "true");
    if (migratedMoments.length > 0) {
      await persistSpendingMoments(migratedMoments);
      return sortMoments(migratedMoments);
    }
  }

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
  await AsyncStorage.multiRemove([MOMENTS_KEY, FEEDBACK_KEY]);
  await AsyncStorage.setItem(MIGRATION_KEY, "true");
}

export async function listPatternFeedback(): Promise<PatternFeedback[]> {
  const raw = await AsyncStorage.getItem(FEEDBACK_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizePatternFeedback).filter(Boolean) as PatternFeedback[];
  } catch {
    return [];
  }
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
  await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(updated));
  return updated;
}

async function migrateConfirmedTransactions(): Promise<SpendingMoment[]> {
  const raw = await AsyncStorage.getItem(LEGACY_TRANSACTIONS_KEY);
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
          createdAt: item.createdAt ?? new Date().toISOString(),
          updatedAt: item.updatedAt ?? new Date().toISOString()
        })
      );
  } catch {
    return [];
  }
}

async function persistSpendingMoments(moments: SpendingMoment[]): Promise<void> {
  await AsyncStorage.setItem(MOMENTS_KEY, JSON.stringify(sortMoments(moments).map(normalizeMoment)));
}

function normalizeMoment(value: unknown): SpendingMoment {
  const source = value as Partial<SpendingMoment>;
  const now = new Date().toISOString();
  return {
    id: source.id || createId(),
    amount: typeof source.amount === "number" ? Math.max(0, Math.round(source.amount)) : 0,
    occurredAt: source.occurredAt || now,
    label: cleanOptionalText(source.label),
    context: normalizeSpendingContext(source.context),
    note: cleanOptionalText(source.note),
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

function cleanOptionalText(value: string | undefined): string | undefined {
  const cleaned = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!cleaned || ["Unknown", "Manual entry"].includes(cleaned)) return undefined;
  return cleaned.slice(0, 80);
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
