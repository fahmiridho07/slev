import type { AppStrings } from "../i18n/types";
import { SpendingMoment } from "../features/spendingMemory.types";
import { RESERVED_BILL_CONTEXT } from "./safeToSpend";
import { safeTime } from "./dateRanges";

const WINDOW_DAYS = 30;
const MIN_SAMPLES = 2;

export type PurchaseCategoryMatch = {
  category: string;
  categoryLabel: string;
  medianAmount: number;
  multiple: number;
};

export function getPurchaseCategoryMatch({
  amount,
  moments,
  referenceDate = new Date(),
  strings
}: {
  amount: number;
  moments: SpendingMoment[];
  referenceDate?: Date;
  strings: AppStrings;
}): PurchaseCategoryMatch | null {
  if (amount <= 0) {
    return null;
  }

  const windowEnd = startOfDay(referenceDate).getTime();
  const windowStart = new Date(windowEnd);
  windowStart.setDate(windowStart.getDate() - WINDOW_DAYS);
  const startTime = windowStart.getTime();

  const byContext = new Map<string, number[]>();
  for (const moment of moments) {
    if (
      moment.type !== "expense" ||
      moment.context === RESERVED_BILL_CONTEXT ||
      safeTime(moment.occurredAt) < startTime ||
      safeTime(moment.occurredAt) >= windowEnd
    ) {
      continue;
    }

    const bucket = byContext.get(moment.context) ?? [];
    bucket.push(moment.amount);
    byContext.set(moment.context, bucket);
  }

  let best: PurchaseCategoryMatch | null = null;
  let bestScore = -1;

  for (const [context, amounts] of byContext.entries()) {
    if (amounts.length < MIN_SAMPLES) {
      continue;
    }

    const medianAmount = median(amounts);
    if (medianAmount <= 0) {
      continue;
    }

    const multiple = amount / medianAmount;
    if (multiple < 0.4 || multiple > 8) {
      continue;
    }

    const multipleFit = 1 - Math.min(1, Math.abs(multiple - Math.round(multiple)) / 2);
    const score = amounts.length * 10 + multipleFit;

    if (score <= bestScore) {
      continue;
    }

    bestScore = score;
    best = {
      category: context,
      categoryLabel: getCategoryDisplayLabel(context, strings),
      medianAmount,
      multiple
    };
  }

  return best;
}

function getCategoryDisplayLabel(context: string, strings: AppStrings): string {
  const labels = strings.capture.contextLabels;
  if (context in labels) {
    return labels[context as keyof typeof labels];
  }
  return context;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }
  return sorted[middle];
}