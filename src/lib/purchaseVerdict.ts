import { formatString } from "../i18n";
import type { AppStrings } from "../i18n/types";
import type { PurchaseCategoryMatch } from "./purchaseContext";
import { formatRupiah } from "./spendingMemoryPatterns";
import type { PurchaseInsight, SimulatePurchaseResult, SafeToSpendResult } from "./safeToSpend";

export type PurchaseVerdictCopy = {
  contextNote?: string;
  detail: string;
  footnote?: string;
  headline: string;
};

export type PurchasePresentation = {
  tone: "caution" | "danger" | "neutral" | "safe" | "warn";
};

export function getPurchaseVerdictCopy({
  categoryMatch,
  horizon,
  safe,
  simulation,
  strings
}: {
  categoryMatch?: PurchaseCategoryMatch | null;
  horizon: "month_end" | "payday";
  safe: SafeToSpendResult;
  simulation: SimulatePurchaseResult;
  strings: AppStrings;
}): PurchaseVerdictCopy {
  const copy = strings.home.safeToSpend.purchaseVerdict;
  const horizonLabel = horizon === "payday" ? copy.horizonPayday : copy.horizonMonthEnd;
  const paceLabel = simulation.usesHistoryReference ? copy.paceLabelTypical : copy.paceLabelSafe;
  const reference = formatRupiah(simulation.referenceDaily);
  const newDaily = formatRupiah(simulation.newSafeDaily);
  const shortfall = formatRupiah(simulation.shortfall);
  const footnote = !simulation.usesHistoryReference
    ? copy.historyFallback
    : !safe.confident
      ? copy.historyUncertain
      : undefined;

  let result: PurchaseVerdictCopy;

  switch (simulation.insight) {
    case "comfortable":
      result = {
        headline: copy.comfortableHeadline,
        detail: formatString(copy.comfortableDetail, {
          amount: newDaily,
          paceLabel,
          reference
        })
      };
      break;
    case "affordable":
      result = {
        headline: copy.affordableHeadline,
        detail: formatString(copy.affordableDetail, {
          amount: newDaily,
          horizon: horizonLabel
        })
      };
      break;
    case "tight_multi_day":
      result = {
        headline: copy.tightMultiHeadline,
        detail: formatString(copy.tightMultiDetail, {
          days: simulation.daysAtTypicalPace,
          paceLabel,
          reference,
          total: safe.daysLeft
        })
      };
      break;
    case "tight_one_day":
      result = {
        headline: copy.tightOneHeadline,
        detail: formatString(copy.tightOneDetail, {
          amount: newDaily,
          paceLabel,
          reference
        })
      };
      break;
    case "below_daily_need":
      result = {
        headline: copy.belowDailyHeadline,
        detail: formatString(copy.belowDailyDetail, { paceLabel, reference })
      };
      break;
    case "dips_reserve":
      result = {
        headline: copy.dipsReserveHeadline,
        detail: formatString(copy.dipsReserveDetail, { amount: shortfall })
      };
      break;
    default:
      result = {
        headline: copy.unaffordableHeadline,
        detail: formatString(copy.unaffordableDetail, { amount: shortfall })
      };
      break;
  }

  if (footnote) {
    result.footnote = footnote;
  }

  if (categoryMatch) {
    const median = formatRupiah(categoryMatch.medianAmount);
    const multipleLabel = formatPurchaseMultiple(categoryMatch.multiple);
    result.contextNote =
      Math.abs(categoryMatch.multiple - 1) < 0.2
        ? formatString(copy.categoryContextSingle, {
            amount: median,
            category: categoryMatch.categoryLabel
          })
        : formatString(copy.categoryContext, {
            amount: median,
            category: categoryMatch.categoryLabel,
            multiple: multipleLabel
          });
  }

  return result;
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

function formatPurchaseMultiple(multiple: number): string {
  const rounded = Math.round(multiple * 10) / 10;
  if (Math.abs(rounded - Math.round(rounded)) < 0.05) {
    return String(Math.round(rounded));
  }
  return rounded.toFixed(1);
}