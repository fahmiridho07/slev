import { SpendingPattern, SpendingMoment } from "../features/spendingMemory.types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function generateSpendingPatterns(moments: SpendingMoment[]): SpendingPattern[] {
  const expenses = moments.filter((moment) => moment.type !== "income");
  const thisWeek = withinDays(expenses, 7);
  const previousWeek = previousDays(expenses, 7, 14);
  const recent = withinDays(expenses, 14);
  const patterns: SpendingPattern[] = [
    ...buildContextChangePatterns(thisWeek, previousWeek),
    ...buildNewRepeatPatterns(thisWeek, previousWeek),
    ...buildSmallSpendPattern(thisWeek, previousWeek),
    ...buildWeekendPattern(thisWeek),
    ...buildQuietPatterns(thisWeek, previousWeek)
  ];

  const usefulPatterns = dedupePatterns(patterns);
  if (usefulPatterns.length > 0) {
    return usefulPatterns.slice(0, 5);
  }

  if (recent.length >= 4) {
    return buildGentleFallback(recent);
  }

  if (expenses.length > 0) {
    return [
      {
        id: "quiet-start",
        group: "Repeated lately",
        title: "A few moments are saved",
        detail: "Slev will look for changes and repeats as more memory builds up.",
        tone: "calm"
      }
    ];
  }

  return [];
}

export function formatRupiah(amount: number): string {
  return `Rp ${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0
  }).format(Math.round(amount))}`;
}

export function formatCompactRupiah(amount: number): string {
  return formatRupiah(amount);
}

function buildContextChangePatterns(
  thisWeek: SpendingMoment[],
  previousWeek: SpendingMoment[]
): SpendingPattern[] {
  const previousByContext = groupByContext(previousWeek);

  return Object.entries(groupByContext(thisWeek))
    .map(([context, items]) => {
      const previousCount = previousByContext[context]?.length ?? 0;
      return { context, items, previousCount };
    })
    .filter(({ items, previousCount }) => items.length >= 2 && items.length >= previousCount + 2)
    .sort((a, b) => b.items.length - a.items.length)
    .slice(0, 2)
    .map(({ context, items, previousCount }) => ({
      id: `more-visible-${context.toLowerCase()}`,
      group: "Stands out this week",
      title: `${context} is more visible this week`,
      detail:
        previousCount > 0
          ? `${items.length} saved moments, up from ${previousCount} last week.`
          : `${items.length} saved moments appeared this week.`,
      tone: "notice",
      recapQuestion: `Keep this ${context.toLowerCase()} rhythm?`
    }));
}

function buildNewRepeatPatterns(
  thisWeek: SpendingMoment[],
  previousWeek: SpendingMoment[]
): SpendingPattern[] {
  const previousLabels = new Set(
    previousWeek
      .map((moment) => normalizedLabel(moment))
      .filter(Boolean)
  );

  return Object.entries(groupByLabel(thisWeek))
    .filter(([label, items]) => label && items.length >= 2 && !previousLabels.has(label))
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 1)
    .map(([label, items]) => ({
      id: `new-repeat-${label}`,
      group: "Repeated lately",
      title: "A new repeat may be forming",
      detail: `${displayLabel(items[0])} appeared ${items.length} times this week.`,
      tone: "calm",
      recapQuestion: `Keep ${displayLabel(items[0])} in the rhythm?`
    }));
}

function buildSmallSpendPattern(
  thisWeek: SpendingMoment[],
  previousWeek: SpendingMoment[]
): SpendingPattern[] {
  const currentSmall = thisWeek.filter(isSmallMoment);
  const previousSmall = previousWeek.filter(isSmallMoment);
  if (currentSmall.length < 4) return [];

  const currentTotal = sumAmount(currentSmall);
  const previousTotal = sumAmount(previousSmall);
  const changedEnough = previousSmall.length === 0 || currentSmall.length >= previousSmall.length + 2 || currentTotal >= previousTotal * 1.4;
  if (!changedEnough) return [];

  return [
    {
      id: "small-spends-change",
      group: "Small spends adding up",
      title: "Small spends are more noticeable",
      detail: `${currentSmall.length} smaller moments add up to ${formatCompactRupiah(currentTotal)} this week.`,
      tone: "warm",
      recapQuestion: "Keep this small-spend rhythm?"
    }
  ];
}

function buildWeekendPattern(moments: SpendingMoment[]): SpendingPattern[] {
  const weekend = moments.filter(isWeekendMoment);
  const weekday = moments.filter((moment) => !isWeekendMoment(moment));
  if (weekend.length < 2 || weekday.length < 2) return [];

  const weekendAverage = sumAmount(weekend) / 2;
  const weekdayAverage = sumAmount(weekday) / 5;
  if (weekdayAverage <= 0 || weekendAverage / weekdayAverage < 1.5) return [];

  return [
    {
      id: "weekend-shape",
      group: "Weekend shape",
      title: "The weekend carried more of the week",
      detail: `Weekend spending ran about ${(weekendAverage / weekdayAverage).toFixed(1)}x the weekday pace.`,
      tone: "notice",
      recapQuestion: "Keep this weekend rhythm?"
    }
  ];
}

function buildQuietPatterns(
  thisWeek: SpendingMoment[],
  previousWeek: SpendingMoment[]
): SpendingPattern[] {
  const currentByContext = groupByContext(thisWeek);

  return Object.entries(groupByContext(previousWeek))
    .filter(([context, items]) => items.length >= 3 && (currentByContext[context]?.length ?? 0) === 0)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 1)
    .map(([context]) => ({
      id: `quiet-${context.toLowerCase()}`,
      group: "Stands out this week",
      title: `${context} got quieter this week`,
      detail: "That context showed up often last week and has not appeared in saved memory this week.",
      tone: "calm"
    }));
}

function buildGentleFallback(moments: SpendingMoment[]): SpendingPattern[] {
  const [context, items] = Object.entries(groupByContext(moments)).sort((a, b) => b[1].length - a[1].length)[0] ?? [];
  if (!context || !items || items.length < 3) {
    return [
      {
        id: "memory-building",
        group: "Repeated lately",
        title: "Memory is building",
        detail: `${moments.length} moments saved in the last two weeks.`,
        tone: "calm"
      }
    ];
  }

  return [
    {
      id: `steady-${context.toLowerCase()}`,
      group: "Repeated lately",
      title: `${context} is part of the recent rhythm`,
      detail: `${items.length} moments in the last two weeks.`,
      tone: "calm",
      recapQuestion: `Keep this ${context.toLowerCase()} rhythm?`
    }
  ];
}

function withinDays(moments: SpendingMoment[], days: number): SpendingMoment[] {
  const cutoff = Date.now() - days * DAY_MS;
  return moments.filter((moment) => Date.parse(moment.occurredAt) >= cutoff);
}

function previousDays(moments: SpendingMoment[], startDaysAgo: number, endDaysAgo: number): SpendingMoment[] {
  const end = Date.now() - startDaysAgo * DAY_MS;
  const start = Date.now() - endDaysAgo * DAY_MS;
  return moments.filter((moment) => {
    const time = Date.parse(moment.occurredAt);
    return time >= start && time < end;
  });
}

function groupByContext(moments: SpendingMoment[]): Record<string, SpendingMoment[]> {
  return moments.reduce<Record<string, SpendingMoment[]>>((acc, moment) => {
    acc[moment.context] = [...(acc[moment.context] ?? []), moment];
    return acc;
  }, {});
}

function groupByLabel(moments: SpendingMoment[]): Record<string, SpendingMoment[]> {
  return moments.reduce<Record<string, SpendingMoment[]>>((acc, moment) => {
    const label = normalizedLabel(moment);
    if (!label) return acc;
    acc[label] = [...(acc[label] ?? []), moment];
    return acc;
  }, {});
}

function normalizedLabel(moment: SpendingMoment): string {
  return String(moment.label || "").trim().toLowerCase();
}

function displayLabel(moment: SpendingMoment): string {
  return moment.label || moment.context;
}

function isSmallMoment(moment: SpendingMoment): boolean {
  return moment.amount > 0 && moment.amount <= 50_000;
}

function sumAmount(moments: SpendingMoment[]): number {
  return moments.reduce((sum, moment) => sum + moment.amount, 0);
}

function isWeekendMoment(moment: SpendingMoment): boolean {
  const day = new Date(moment.occurredAt).getDay();
  return day === 0 || day === 6;
}

function dedupePatterns(patterns: SpendingPattern[]): SpendingPattern[] {
  const seen = new Set<string>();
  return patterns.filter((pattern) => {
    if (seen.has(pattern.id)) return false;
    seen.add(pattern.id);
    return true;
  });
}
