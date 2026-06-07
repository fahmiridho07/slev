import { TextStyle, ViewStyle } from "react-native";
import { clampPercent, getPercentWidthStyle } from "../../lib/analysis";
import { AccountReconciliationRow, AllocationPlan } from "../../lib/financeEngine";
import type { ColorTokens } from "../types";

export function getAllocationFillStyle(
  row: AllocationPlan["rows"][number],
  colors: ColorTokens
): Pick<ViewStyle, "backgroundColor" | "width"> {
  const isSpendingRow = row.key === "fixed" || row.key === "flexible";
  const backgroundColor = isSpendingRow
    ? row.progress > 1
      ? colors.coral
      : row.progress >= 0.8
        ? colors.amber
        : colors.blue
    : colors.green;

  return {
    backgroundColor,
    width: getPercentWidthStyle(row.progress).width
  };
}

export function getReconciliationAmountStyle(
  row: AccountReconciliationRow,
  colors: ColorTokens
): Pick<TextStyle, "color"> | undefined {
  if (row.difference === null || Math.abs(row.difference) <= 1000) return undefined;
  return { color: row.difference > 0 ? colors.blue : colors.coral };
}

export function getProgressFillStyle(
  progress: number,
  colors: ColorTokens
): Pick<ViewStyle, "backgroundColor" | "width"> {
  const clampedProgress = clampPercent(progress);
  const backgroundColor = progress > 1 ? colors.coral : progress >= 0.8 ? colors.amber : colors.green;
  return {
    backgroundColor,
    width: `${Math.round(clampedProgress * 100)}%` as ViewStyle["width"]
  };
}