import { TransactionDraft } from "../features/transactions.types";

export type TrendPoint = {
  key: string;
  label: string;
  amount: number;
};

export type CategoryTotal = {
  category: string;
  amount: number;
  count: number;
  share: number;
};

export type SpendingInsight = {
  id: string;
  title: string;
  detail: string;
  tone: "calm" | "notice" | "good";
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function getRecentConfirmedTransactions(transactions: TransactionDraft[]): TransactionDraft[] {
  return transactions
    .filter((transaction) => transaction.status === "confirmed")
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

export function buildDailyTrend(transactions: TransactionDraft[], days = 7): TrendPoint[] {
  const today = startOfDay(new Date());
  const points = Array.from({ length: days }, (_, index) => {
    const date = new Date(today.getTime() - (days - index - 1) * DAY_MS);
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      amount: 0
    };
  });

  const pointByKey = new Map(points.map((point) => [point.key, point]));

  transactions.forEach((transaction) => {
    const key = new Date(transaction.timestamp).toISOString().slice(0, 10);
    const point = pointByKey.get(key);
    if (point) {
      point.amount += transaction.amount;
    }
  });

  return points;
}

export function getCategoryTotals(transactions: TransactionDraft[]): CategoryTotal[] {
  const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const byCategory = transactions.reduce<Record<string, { amount: number; count: number }>>((acc, transaction) => {
    const current = acc[transaction.category] ?? { amount: 0, count: 0 };
    acc[transaction.category] = {
      amount: current.amount + transaction.amount,
      count: current.count + 1
    };
    return acc;
  }, {});

  return Object.entries(byCategory)
    .map(([category, value]) => ({
      category,
      amount: value.amount,
      count: value.count,
      share: total > 0 ? value.amount / total : 0
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function generateWeeklyInsights(transactions: TransactionDraft[]): SpendingInsight[] {
  const now = Date.now();
  const thisWeek = transactions.filter((transaction) => Date.parse(transaction.timestamp) >= now - 7 * DAY_MS);
  const previousWeek = transactions.filter((transaction) => {
    const time = Date.parse(transaction.timestamp);
    return time >= now - 14 * DAY_MS && time < now - 7 * DAY_MS;
  });

  if (thisWeek.length === 0) {
    return [
      {
        id: "empty-week",
        title: "No confirmed spending yet",
        detail: "Confirm a few transactions and Slev will start surfacing weekly patterns.",
        tone: "calm"
      }
    ];
  }

  const insights: SpendingInsight[] = [];
  const thisWeekTotal = sumAmount(thisWeek);
  const previousWeekTotal = sumAmount(previousWeek);
  const categoryTotals = getCategoryTotals(thisWeek);
  const topCategory = categoryTotals[0];

  insights.push({
    id: "weekly-total",
    title: "This week",
    detail: `You confirmed ${formatCompactRupiah(thisWeekTotal)} across ${thisWeek.length} transaction${thisWeek.length === 1 ? "" : "s"}.`,
    tone: "calm"
  });

  if (topCategory) {
    insights.push({
      id: "top-category",
      title: `${topCategory.category} leads this week`,
      detail: `${formatCompactRupiah(topCategory.amount)} went to ${topCategory.category.toLowerCase()}, about ${Math.round(topCategory.share * 100)}% of confirmed spending.`,
      tone: "notice"
    });
  }

  if (previousWeekTotal > 0) {
    const change = (thisWeekTotal - previousWeekTotal) / previousWeekTotal;
    insights.push({
      id: "week-change",
      title: change >= 0 ? "Spending increased" : "Spending eased",
      detail:
        change >= 0
          ? `This week is ${Math.round(change * 100)}% higher than the previous 7 days.`
          : `This week is ${Math.abs(Math.round(change * 100))}% lower than the previous 7 days.`,
      tone: change >= 0 ? "notice" : "good"
    });
  }

  const weekendTotal = sumAmount(thisWeek.filter(isWeekendTransaction));
  const weekdayTotal = thisWeekTotal - weekendTotal;
  if (weekendTotal > 0 && weekdayTotal > 0) {
    const weekendDailyAverage = weekendTotal / 2;
    const weekdayDailyAverage = weekdayTotal / 5;
    const ratio = weekendDailyAverage / weekdayDailyAverage;
    if (ratio >= 1.5) {
      insights.push({
        id: "weekend-heavy",
        title: "Weekend spending stands out",
        detail: `Weekend daily spending is about ${ratio.toFixed(1)}x higher than weekdays.`,
        tone: "notice"
      });
    }
  }

  const lateQrisCount = thisWeek.filter((transaction) => {
    const hour = new Date(transaction.timestamp).getHours();
    return transaction.method === "QRIS" && hour >= 20;
  }).length;
  if (lateQrisCount > 0) {
    insights.push({
      id: "late-qris",
      title: "Late QRIS pattern",
      detail: `${lateQrisCount} QRIS transaction${lateQrisCount === 1 ? "" : "s"} happened after 8 PM this week.`,
      tone: "calm"
    });
  }

  return insights.slice(0, 4);
}

export function formatCompactRupiah(amount: number): string {
  if (amount >= 1_000_000) return `Rp${(amount / 1_000_000).toFixed(1)}m`;
  if (amount >= 1_000) return `Rp${Math.round(amount / 1_000)}k`;
  return `Rp${amount}`;
}

function sumAmount(transactions: TransactionDraft[]): number {
  return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
}

function isWeekendTransaction(transaction: TransactionDraft): boolean {
  const day = new Date(transaction.timestamp).getDay();
  return day === 0 || day === 6;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
