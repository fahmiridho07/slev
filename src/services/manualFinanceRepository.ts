import { normalizeSpendingContext } from "../data/spendingMemory";
import {
  EntryType,
  ManualTemplate,
  SpendingContext
} from "../features/spendingMemory.types";
import {
  cleanOptionalText,
  createId,
  readNumber,
  readString,
  toRecord
} from "./storageRecordUtils";
import { readJson, removeKeys, WriteResult, writeJson } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

const MANUAL_TEMPLATES_KEY = STORAGE_KEYS.manualTemplates;

type ManualTemplateInput = {
  accountLabel?: string;
  amount?: number;
  context: SpendingContext;
  label?: string;
  note?: string;
  source?: string;
  type: EntryType;
};

export async function listManualTemplates(): Promise<ManualTemplate[]> {
  const result = await readJson<unknown>(MANUAL_TEMPLATES_KEY);
  if (result.status !== "ok" || !Array.isArray(result.value)) return [];
  return result.value.map(normalizeManualTemplate).filter(isManualTemplate);
}

export async function saveManualTemplate(input: ManualTemplateInput): Promise<WriteResult<ManualTemplate[]>> {
  const current = await listManualTemplates();
  const now = new Date().toISOString();
  const template = normalizeManualTemplate({
    ...input,
    id: createId(),
    occurredAt: now,
    createdAt: now,
    updatedAt: now
  });
  if (!template) return { data: current, persisted: true };

  const updated = [template, ...current].slice(0, 12);
  const persisted = await writeJson(MANUAL_TEMPLATES_KEY, updated);
  return { data: updated, persisted };
}

export async function deleteManualTemplate(id: string): Promise<WriteResult<ManualTemplate[]>> {
  const current = await listManualTemplates();
  const updated = current.filter((template) => template.id !== id);
  const persisted = await writeJson(MANUAL_TEMPLATES_KEY, updated);
  return { data: updated, persisted };
}

export async function rewriteAccountLabelInManualTemplates(
  oldLabel: string,
  newLabel: string
): Promise<boolean> {
  if (oldLabel === newLabel) return true;

  const current = await listManualTemplates();
  let changed = false;
  const updated = current.map((template) => {
    if (template.accountLabel !== oldLabel) return template;
    changed = true;
    return {
      ...template,
      accountLabel: newLabel,
      updatedAt: new Date().toISOString()
    };
  });
  if (!changed) return true;

  return writeJson(MANUAL_TEMPLATES_KEY, updated);
}

export async function clearManualFinance(): Promise<boolean> {
  return removeKeys([MANUAL_TEMPLATES_KEY]);
}

function normalizeManualTemplate(value: unknown): ManualTemplate | null {
  const record = toRecord(value);
  if (!record) return null;
  const type: EntryType = readString(record, "type") === "income" ? "income" : "expense";
  const label = cleanOptionalText(readString(record, "label") ?? readString(record, "title"));
  const source = cleanOptionalText(readString(record, "source") ?? (type === "income" ? label : undefined));
  const amount = normalizeAmount(readNumber(record, "amount") ?? 0);
  if (amount <= 0 && !label && !source) return null;
  const now = new Date().toISOString();

  return {
    id: readString(record, "id") ?? createId(),
    amount,
    occurredAt: readString(record, "occurredAt") ?? now,
    label: type === "expense" ? label : undefined,
    context: type === "income" ? "Other" : normalizeSpendingContext(readString(record, "context")),
    note: cleanOptionalText(readString(record, "note")),
    type,
    accountLabel: cleanOptionalText(readString(record, "accountLabel")),
    source: type === "income" ? source : undefined,
    createdAt: readString(record, "createdAt") ?? now,
    updatedAt: readString(record, "updatedAt") ?? now
  };
}

function isManualTemplate(value: ManualTemplate | null): value is ManualTemplate {
  return value !== null;
}

function normalizeAmount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}