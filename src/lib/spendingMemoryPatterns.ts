import { PatternGroup, SpendingPattern, SpendingMoment } from "../features/spendingMemory.types";
import { displayContext } from "../i18n/display";
import { formatString } from "../i18n/format";
import { getRuntimeStrings } from "../i18n/runtime";

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

  const strings = getRuntimeStrings().patterns;
  if (recent.length >= 4) {
    return buildGentleFallback(recent);
  }

  if (expenses.length > 0) {
    return [
      {
        id: "quiet-start",
        group: strings.groups.repeatedLately as PatternGroup,
        title: strings.generated.quietStartTitle,
        detail: strings.generated.quietStartDetail,
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

function buildContextChangePatterns(
  thisWeek: SpendingMoment[],
  previousWeek: SpendingMoment[]
): SpendingPattern[] {
  const strings = getRuntimeStrings().patterns;
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
      group: strings.groups.standsOut as PatternGroup,
      title: formatString(strings.generated.contextMoreVisibleTitle, { context: displayContext(context) }),
      detail:
        previousCount > 0
          ? formatString(strings.generated.contextMoreVisibleDetailWithPrevious, {
              count: items.length,
              previousCount
            })
          : formatString(strings.generated.contextMoreVisibleDetailNoPrevious, { count: items.length }),
      tone: "notice",
      recapQuestion: formatString(strings.generated.contextMoreVisibleRecap, {
        context: displayContext(context)
      })
    }));
}

function buildNewRepeatPatterns(
  thisWeek: SpendingMoment[],
  previousWeek: SpendingMoment[]
): SpendingPattern[] {
  const strings = getRuntimeStrings().patterns;
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
      group: strings.groups.repeatedLately as PatternGroup,
      title: strings.generated.newRepeatTitle,
      detail: formatString(strings.generated.newRepeatDetail, {
        label: displayLabel(items[0]!),
        count: items.length
      }),
      tone: "calm",
      recapQuestion: formatString(strings.generated.newRepeatRecap, {
        label: displayLabel(items[0]!)
      })
    }));
}

function buildSmallSpendPattern(
  thisWeek: SpendingMoment[],
  previousWeek: SpendingMoment[]
): SpendingPattern[] {
  const strings = getRuntimeStrings().patterns;
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
      group: strings.groups.smallSpends as PatternGroup,
      title: strings.generated.smallSpendsTitle,
      detail: formatString(strings.generated.smallSpendsDetail, {
        count: currentSmall.length,
        total: formatRupiah(currentTotal)
      }),
      tone: "warm",
      recapQuestion: strings.generated.smallSpendsRecap
    }
  ];
}

function buildWeekendPattern(moments: SpendingMoment[]): SpendingPattern[] {
  const strings = getRuntimeStrings().patterns;
  const weekend = moments.filter(isWeekendMoment);
  const weekday = moments.filter((moment) => !isWeekendMoment(moment));
  if (weekend.length < 2 || weekday.length < 2) return [];

  const weekendAverage = sumAmount(weekend) / 2;
  const weekdayAverage = sumAmount(weekday) / 5;
  if (weekdayAverage <= 0 || weekendAverage / weekdayAverage < 1.5) return [];

  return [
    {
      id: "weekend-shape",
      group: strings.groups.weekendShape as PatternGroup,
      title: strings.generated.weekendShapeTitle,
      detail: formatString(strings.generated.weekendShapeDetail, {
        ratio: (weekendAverage / weekdayAverage).toFixed(1)
      }),
      tone: "notice",
      recapQuestion: strings.generated.weekendShapeRecap
    }
  ];
}

function buildQuietPatterns(
  thisWeek: SpendingMoment[],
  previousWeek: SpendingMoment[]
): SpendingPattern[] {
  const strings = getRuntimeStrings().patterns;
  const currentByContext = groupByContext(thisWeek);

  return Object.entries(groupByContext(previousWeek))
    .filter(([context, items]) => items.length >= 3 && (currentByContext[context]?.length ?? 0) === 0)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 1)
    .map(([context]) => ({
      id: `quiet-${context.toLowerCase()}`,
      group: strings.groups.standsOut as PatternGroup,
      title: formatString(strings.generated.contextQuieterTitle, { context: displayContext(context) }),
      detail: strings.generated.contextQuieterDetail,
      tone: "calm"
    }));
}

function buildGentleFallback(moments: SpendingMoment[]): SpendingPattern[] {
  const strings = getRuntimeStrings().patterns;
  const [context, items] = Object.entries(groupByContext(moments)).sort((a, b) => b[1].length - a[1].length)[0] ?? [];
  if (!context || !items || items.length < 3) {
    return [
      {
        id: "memory-building",
        group: strings.groups.repeatedLately as PatternGroup,
        title: strings.generated.memoryBuildingTitle,
        detail: formatString(strings.generated.memoryBuildingDetail, { count: moments.length }),
        tone: "calm"
      }
    ];
  }

  return [
    {
      id: `steady-${context.toLowerCase()}`,
      group: strings.groups.repeatedLately as PatternGroup,
      title: formatString(strings.generated.steadyRhythmTitle, { context: displayContext(context) }),
      detail: formatString(strings.generated.steadyRhythmDetail, { count: items.length }),
      tone: "calm",
      recapQuestion: formatString(strings.generated.steadyRhythmRecap, {
        context: displayContext(context)
      })
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
  return moment.label || displayContext(moment.context);
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