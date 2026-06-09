import { formatString } from "../i18n";
import type { AppStrings } from "../i18n/types";
import { formatRupiah } from "./spendingMemoryPatterns";
import type { PurchaseInsight, SimulatePurchaseResult, SafeToSpendResult } from "./safeToSpend";

export type PurchaseVerdictCopy = {
  detail: string;
  headline: string;
};

export type PurchasePresentation = {
  tone: "caution" | "danger" | "neutral" | "safe" | "warn";
};

export function getPurchaseVerdictCopy({
  horizon,
  safe,
  simulation,
  strings
}: {
  horizon: "month_end" | "payday";
  safe: SafeToSpendResult;
  simulation: SimulatePurchaseResult;
  strings: AppStrings;
}): PurchaseVerdictCopy {
  const copy = strings.home.safeToSpend.purchaseVerdict;
  const horizonLabel = horizon === "payday" ? copy.horizonPayday : copy.horizonMonthEnd;
  const typical = formatRupiah(safe.typicalDaily);
  const newDaily = formatRupiah(simulation.newSafeDaily);
  const shortfall = formatRupiah(simulation.shortfall);

  switch (simulation.insight) {
    case "comfortable":
      return {
        headline: copy.comfortableHeadline,
        detail: formatString(copy.comfortableDetail, {
          amount: newDaily,
          typical
        })
      };
    case "affordable":
      return {
        headline: copy.affordableHeadline,
        detail: formatString(copy.affordableDetail, {
          amount: newDaily,
          horizon: horizonLabel
        })
      };
    case "tight_multi_day":
      return {
        headline: copy.tightMultiHeadline,
        detail: formatString(copy.tightMultiDetail, {
          days: simulation.daysAtTypicalPace,
          total: safe.daysLeft,
          typical
        })
      };
    case "tight_one_day":
      return {
        headline: copy.tightOneHeadline,
        detail: formatString(copy.tightOneDetail, {
          amount: newDaily,
          typical
        })
      };
    case "below_daily_need":
      return {
        headline: copy.belowDailyHeadline,
        detail: formatString(copy.belowDailyDetail, { typical })
      };
    case "dips_reserve":
      return {
        headline: copy.dipsReserveHeadline,
        detail: formatString(copy.dipsReserveDetail, { amount: shortfall })
      };
    default:
      return {
        headline: copy.unaffordableHeadline,
        detail: formatString(copy.unaffordableDetail, { amount: shortfall })
      };
  }
}

export function getPurchasePresentation(insight: PurchaseInsight): PurchasePresentation {
  if (insight === "comfortable" || insight === "affordable") {
    return { tone: "safe" };
  }
  if (insight === "tight_multi_day" || insight === "tight_one_day") {
    return { tone: "warn" };
  }
  if (insight === "dips_reserve") {
    return { tone: "caution" };
  }
  return { tone: "danger" };
}