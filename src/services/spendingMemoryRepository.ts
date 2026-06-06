import {
  EntryType,
  PatternFeedback,
  PatternFeedbackResponse,
  SpendingMoment
} from "../features/spendingMemory.types";
import { normalizeSpendingContext } from "../data/spendingMemory";
import { isKeyCorrupt, readJson, readRaw, removeKeys, WriteResult, writeJson, writeRaw } from "./storage";

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
  const result = await readJson<unknown>(MOMENTS_KEY);
  if (result.status !== "ok" || !Array.isArray(result.value)) return [];
  return sortMoments(result.value.map(normalizeMoment).filter((moment) => moment.amount > 0));
}

export async function saveSpendingMoment(input: MomentInput): Promise<WriteResult<SpendingMoment>> {
  const now = new Date().toISOString();
  const moment = normalizeMoment({
    ...input,
    id: createId(),
    occurredAt: input.occurredAt ?? now,
    createdAt: now,
    updatedAt: now
  });

  const moments = await listSpendingMoments();
  const persisted = await persistSpendingMoments([moment, ...moments]);
  return { data: moment, persisted };
}

export async function updateSpendingMoment(
  id: string,
  input: MomentInput
): Promise<WriteResult<SpendingMoment[]>> {
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

  const persisted = await persistSpendingMoments(updated);
  return { data: sortMoments(updated), persisted };
}

export async function deleteSpendingMoment(id: string): Promise<WriteResult<SpendingMoment[]>> {
  const moments = await listSpendingMoments();
  const updated = moments.filter((moment) => moment.id !== id);
  const persisted = await persistSpendingMoments(updated);
  return { data: updated, persisted };
}

export async function clearSpendingMemory(): Promise<boolean> {
  const removed = await removeKeys([MOMENTS_KEY, LEGACY_MOMENTS_KEY, FEEDBACK_KEY, LEGACY_FEEDBACK_KEY]);
  await writeRaw(V2_MIGRATION_KEY, "true");
  return removed;
}

export async function listPatternFeedback(): Promise<PatternFeedback[]> {
  const result = await readJson<unknown>(FEEDBACK_KEY);
  if (result.status === "corrupt") return [];

  if (result.status === "empty") {
    const legacyResult = await readJson<unknown>(LEGACY_FEEDBACK_KEY);
    if (legacyResult.status !== "ok") return [];
    const migrated = parsePatternFeedbackList(legacyResult.value);
    if (!isKeyCorrupt(FEEDBACK_KEY)) {
      await persistPatternFeedback(migrated);
    }
    return migrated;
  }

  return parsePatternFeedbackList(result.value);
}

export async function savePatternFeedback(
  patternId: string,
  response: PatternFeedbackResponse
): Promise<WriteResult<PatternFeedback[]>> {
  const current = await listPatternFeedback();
  const next: PatternFeedback = {
    patternId,
    response,
    createdAt: new Date().toISOString()
  };
  const updated = [next, ...current.filter((item) => item.patternId !== patternId)].slice(0, 100);
  const persisted = await persistPatternFeedback(updated);
  return { data: updated, persisted };
}

export function isMomentsStorageCorrupt(): boolean {
  return isKeyCorrupt(MOMENTS_KEY);
}

export function isPatternFeedbackStorageCorrupt(): boolean {
  return isKeyCorrupt(FEEDBACK_KEY);
}

export async function runSpendingMemoryV2Migration(): Promise<void> {
  const alreadyMigrated = await readRaw(V2_MIGRATION_KEY);
  if (alreadyMigrated === "true") return;

  const momentsResult = await readJson<unknown>(MOMENTS_KEY);
  const raw = momentsResult.status === "ok" ? await readRaw(MOMENTS_KEY) : null;
  const legacyMomentsRaw = raw ? null : await readRaw(LEGACY_MOMENTS_KEY);
  const existingMoments = parseMomentList(raw ?? legacyMomentsRaw);
  const legacyTransactionMoments = await migrateConfirmedTransactions();
  const mergedMoments = dedupeMomentsById([...legacyTransactionMoments, ...existingMoments]);

  if (
    !isKeyCorrupt(MOMENTS_KEY) &&
    (legacyMomentsRaw ||
      legacyTransactionMoments.length > 0 ||
      existingMoments.some((moment) => moment.type !== "expense" && moment.type !== "income") ||
      raw !== JSON.stringify(sortMoments(mergedMoments).map(normalizeMoment)))
  ) {
    await persistSpendingMoments(mergedMoments);
  }

  await writeRaw(V2_MIGRATION_KEY, "true");
}

function parseMomentList(raw: unknown | string | null): SpendingMoment[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeMoment).filter((moment) => moment.amount > 0);
  } catch {
    return [];
  }
}

function parsePatternFeedbackList(raw: unknown): PatternFeedback[] {
  if (!raw) return [];

  try {
    const parsed = Array.isArray(raw) ? raw : JSON.parse(String(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizePatternFeedback).filter(Boolean) as PatternFeedback[];
  } catch {
    return [];
  }
}

async function migrateConfirmedTransactions(): Promise<SpendingMoment[]> {
  const result = await readJson<unknown>(LEGACY_TRANSACTIONS_KEY);
  if (result.status !== "ok" || !Array.isArray(result.value)) return [];

  return result.value
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
}

async function persistSpendingMoments(moments: SpendingMoment[]): Promise<boolean> {
  return writeJson(MOMENTS_KEY, sortMoments(moments).map(normalizeMoment));
}

async function persistPatternFeedback(feedback: PatternFeedback[]): Promise<boolean> {
  return writeJson(FEEDBACK_KEY, feedback.map(normalizePatternFeedback).filter(Boolean));
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