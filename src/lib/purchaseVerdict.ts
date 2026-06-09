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

export type PurchaseVerdictTone = "caution" | "comfortable" | "danger" | "neutral" | "safe" | "warn";

export type PurchaseVerdictUi = {
  icon: "alert-circle" | "checkmark-circle" | "close-circle" | "information-circle-outline" | "warning";
  statusLabel: string;
  tone: PurchaseVerdictTone;
};

export type PurchasePresentation = {
  tone: PurchaseVerdictTone;
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
    case "already_stretched":
      result = {
        headline: copy.alreadyStretchedHeadline,
        detail: formatString(copy.alreadyStretchedDetail, {
          amount: newDaily,
          paceLabel,
          reference
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

export function resolvePurchaseVerdictTone(insight: PurchaseInsight | null): PurchaseVerdictTone {
  if (insight == null) {
    return "neutral";
  }
  if (insight === "comfortable") {
    return "comfortable";
  }
  if (insight === "affordable") {
    return "safe";
  }
  if (insight === "already_stretched" || insight === "tight_multi_day" || insight === "tight_one_day") {
    return "warn";
  }
  if (insight === "dips_reserve") {
    return "caution";
  }
  return "danger";
}

export function resolvePurchaseVerdictUi({
  insight,
  strings
}: {
  insight: PurchaseInsight | null;
  strings: AppStrings;
}): PurchaseVerdictUi {
  const copy = strings.home.safeToSpend.purchaseVerdict;
  const tone = resolvePurchaseVerdictTone(insight);

  if (tone === "neutral") {
    return {
      tone,
      statusLabel: copy.statusHint,
      icon: "information-circle-outline"
    };
  }
  if (tone === "comfortable") {
    return { tone, statusLabel: copy.statusComfortable, icon: "checkmark-circle" };
  }
  if (tone === "safe") {
    return { tone, statusLabel: copy.statusOk, icon: "checkmark-circle" };
  }
  if (tone === "warn") {
    return {
      tone,
      statusLabel: insight === "already_stretched" ? copy.statusAlreadyStretched : copy.statusTight,
      icon: "alert-circle"
    };
  }
  if (tone === "caution") {
    return { tone, statusLabel: copy.statusRisky, icon: "warning" };
  }
  return { tone, statusLabel: copy.statusNo, icon: "close-circle" };
}

export function getPurchasePresentation(insight: PurchaseInsight): PurchasePresentation {
  return { tone: resolvePurchaseVerdictTone(insight) };
}

function formatPurchaseMultiple(multiple: number): string {
  const rounded = Math.round(multiple * 10) / 10;
  if (Math.abs(rounded - Math.round(rounded)) < 0.05) {
    return String(Math.round(rounded));
  }
  return rounded.toFixed(1);
}