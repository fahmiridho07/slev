import { DEFAULT_SPENDING_CONTEXTS, normalizeSpendingContext } from "../data/spendingMemory";
import { BudgetLimit, BudgetPeriod, SpendingContext } from "../features/spendingMemory.types";
import { isKeyCorrupt, readJson, removeKeys, WriteResult, writeJson } from "./storage";

const BUDGET_LIMITS_KEY = "slev_budget_limits";

type BudgetLimitInput = {
  category: SpendingContext;
  limitAmount: number;
  period: BudgetPeriod;
};

export async function listBudgetLimits(): Promise<BudgetLimit[]> {
  const result = await readJson<unknown>(BUDGET_LIMITS_KEY);
  if (result.status !== "ok" || !Array.isArray(result.value)) return [];
  return result.value.map(normalizeBudgetLimit).filter(Boolean) as BudgetLimit[];
}

export async function saveBudgetLimit(input: BudgetLimitInput): Promise<WriteResult<BudgetLimit[]>> {
  const current = await listBudgetLimits();
  const limit = normalizeBudgetLimit(input);
  if (!limit) return { data: current, persisted: true };

  const updated = [
    limit,
    ...current.filter((item) => item.category !== limit.category)
  ].sort((a, b) => {
    const indexDiff = getContextIndex(a.category) - getContextIndex(b.category);
    return indexDiff !== 0 ? indexDiff : a.category.localeCompare(b.category);
  });

  const persisted = await persistBudgetLimits(updated);
  return { data: updated, persisted };
}

export async function deleteBudgetLimit(category: SpendingContext): Promise<WriteResult<BudgetLimit[]>> {
  const current = await listBudgetLimits();
  const updated = current.filter((item) => item.category !== category);
  const persisted = await persistBudgetLimits(updated);
  return { data: updated, persisted };
}

export async function clearBudgetLimits(): Promise<boolean> {
  return removeKeys([BUDGET_LIMITS_KEY]);
}

export function isBudgetLimitsStorageCorrupt(): boolean {
  return isKeyCorrupt(BUDGET_LIMITS_KEY);
}

async function persistBudgetLimits(limits: BudgetLimit[]): Promise<boolean> {
  return writeJson(BUDGET_LIMITS_KEY, limits.map(normalizeBudgetLimit).filter(Boolean));
}

function normalizeBudgetLimit(value: unknown): BudgetLimit | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Partial<BudgetLimit>;
  const category = normalizeSpendingContext(source.category);
  if (!category) return null;
  const period: BudgetPeriod = source.period === "monthly" ? "monthly" : "weekly";
  const limitAmount = typeof source.limitAmount === "number" ? Math.round(source.limitAmount) : 0;
  if (limitAmount <= 0) return null;

  return {
    category,
    limitAmount,
    period
  };
}

function getContextIndex(value: string): number {
  const index = DEFAULT_SPENDING_CONTEXTS.indexOf(value as SpendingContext);
  return index >= 0 ? index : DEFAULT_SPENDING_CONTEXTS.length;
}