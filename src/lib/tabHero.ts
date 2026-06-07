import type { AppStrings } from "../i18n/types";
import { formatLocaleMonthYear } from "../i18n/localeDate";
import { formatSignedCompactRupiah } from "./formatMoney";
import { formatCompactRupiah } from "./spendingMemoryPatterns";
import { sumSavingsGoals } from "./savingsGoalsTotals";
import type { BudgetTabKey, PatternTabKey } from "../features/app.types";
import type { SavingsGoal } from "../features/spendingMemory.types";
import type { MonthlySummary } from "../features/app.types";
import { formatString } from "../i18n";
import { isCurrentMonthOffset } from "./spendingPeriod";

type HeroConfig = {
  actionLabel?: string;
  hint: string;
  kicker: string;
  onAction?: () => void;
  value?: string;
  valueTone: "balance" | "danger" | "default" | "income";
  variant: "info" | "mint" | "surface";
};

export function buildBudgetTabHero(input: {
  activeTab: BudgetTabKey;
  allocationFlexibleRemaining: number;
  hasMonthlyPlan: boolean;
  latestBalanceTotal: number;
  monthlyFlexibleExpense: number;
  onOpenPlan: () => void;
  savingsGoals: SavingsGoal[];
  strings: AppStrings;
}): HeroConfig {
  const { strings } = input;
  if (input.activeTab === "balance") {
    return {
      hint: strings.budget.hero.balanceHint,
      kicker: strings.budget.hero.balanceKicker,
      value: formatCompactRupiah(input.latestBalanceTotal),
      valueTone: "balance",
      variant: "info"
    };
  }
  if (input.activeTab === "goals") {
    if (input.savingsGoals.length > 0) {
      const totals = sumSavingsGoals(input.savingsGoals);
      return {
        hint: formatString(strings.budget.hero.goalsHint, { count: input.savingsGoals.length }),
        kicker: strings.budget.hero.goalsKicker,
        value: `${formatCompactRupiah(totals.saved)} / ${formatCompactRupiah(totals.target)}`,
        valueTone: "income",
        variant: "surface"
      };
    }
    return {
      hint: strings.budget.hero.goalsEmptyHint,
      kicker: strings.budget.hero.goalsEmptyKicker,
      valueTone: "default",
      variant: "surface"
    };
  }
  if (input.hasMonthlyPlan) {
    return {
      hint: formatString(strings.budget.hero.flexibleSpent, {
        amount: formatCompactRupiah(input.monthlyFlexibleExpense)
      }),
      kicker: strings.budget.hero.flexibleRemaining,
      value: formatSignedCompactRupiah(input.allocationFlexibleRemaining),
      valueTone: input.allocationFlexibleRemaining < 0 ? "danger" : "income",
      variant: "mint"
    };
  }
  return {
    actionLabel: strings.budget.hero.noPlanAction,
    hint: strings.budget.hero.noPlanHint,
    kicker: strings.budget.hero.noPlanKicker,
    onAction: input.onOpenPlan,
    valueTone: "default",
    variant: "mint"
  };
}

export function buildPatternsTabHero(input: {
  activeTab: PatternTabKey;
  breakdownMonthOffset?: number;
  breakdownReferenceDate?: Date;
  breakdownSummary?: MonthlySummary;
  latestBalanceTotal: number;
  monthlySummary: MonthlySummary;
  netWorthTrendLength: number;
  strings: AppStrings;
}): HeroConfig {
  const { strings } = input;
  if (input.activeTab === "breakdown") {
    const summary = input.breakdownSummary ?? input.monthlySummary;
    const monthOffset = input.breakdownMonthOffset ?? 0;
    const monthLabel = input.breakdownReferenceDate
      ? formatLocaleMonthYear(input.breakdownReferenceDate)
      : "";
    const isCurrentMonth = isCurrentMonthOffset(monthOffset);

    return {
      hint: isCurrentMonth
        ? formatString(strings.patterns.hero.breakdownHint, {
            amount: formatCompactRupiah(summary.income)
          })
        : formatString(strings.patterns.hero.breakdownHintMonth, {
            amount: formatCompactRupiah(summary.income),
            month: monthLabel
          }),
      kicker: isCurrentMonth
        ? strings.patterns.hero.breakdownKicker
        : formatString(strings.patterns.hero.breakdownKickerMonth, { month: monthLabel }),
      value: formatCompactRupiah(summary.expense),
      valueTone: "danger",
      variant: "info"
    };
  }
  if (input.activeTab === "accounts") {
    return {
      hint:
        input.netWorthTrendLength >= 2
          ? strings.patterns.hero.accountsHintWithTrend
          : strings.patterns.hero.accountsHintNoTrend,
      kicker: strings.patterns.hero.accountsKicker,
      value: formatCompactRupiah(input.latestBalanceTotal),
      valueTone: "balance",
      variant: "info"
    };
  }
  const summary = input.breakdownSummary ?? input.monthlySummary;
  return {
    hint: formatString(strings.patterns.hero.breakdownHint, {
      amount: formatCompactRupiah(summary.income)
    }),
    kicker: strings.patterns.hero.breakdownKicker,
    value: formatCompactRupiah(summary.expense),
    valueTone: "danger",
    variant: "info"
  };
}