import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_SPENDING_CONTEXTS, normalizeSpendingContext } from "../data/spendingMemory";
import { BudgetLimit, BudgetPeriod, SpendingContext } from "../features/spendingMemory.types";

const BUDGET_LIMITS_KEY = "slev_budget_limits";

type BudgetLimitInput = {
  category: SpendingContext;
  limitAmount: number;
  period: BudgetPeriod;
};

export async function listBudgetLimits(): Promise<BudgetLimit[]> {
  const raw = await readStorage(BUDGET_LIMITS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeBudgetLimit).filter(Boolean) as BudgetLimit[];
  } catch {
    return [];
  }
}

export async function saveBudgetLimit(input: BudgetLimitInput): Promise<BudgetLimit[]> {
  const current = await listBudgetLimits();
  const limit = normalizeBudgetLimit(input);
  if (!limit) return current;

  const updated = [
    limit,
    ...current.filter((item) => item.category !== limit.category)
  ].sort((a, b) => {
    const indexDiff = getContextIndex(a.category) - getContextIndex(b.category);
    return indexDiff !== 0 ? indexDiff : a.category.localeCompare(b.category);
  });

  await persistBudgetLimits(updated);
  return updated;
}

export async function deleteBudgetLimit(category: SpendingContext): Promise<BudgetLimit[]> {
  const current = await listBudgetLimits();
  const updated = current.filter((item) => item.category !== category);
  await persistBudgetLimits(updated);
  return updated;
}

export async function clearBudgetLimits(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BUDGET_LIMITS_KEY);
  } catch {
    return;
  }
}

async function persistBudgetLimits(limits: BudgetLimit[]): Promise<void> {
  try {
    await AsyncStorage.setItem(BUDGET_LIMITS_KEY, JSON.stringify(limits.map(normalizeBudgetLimit).filter(Boolean)));
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
