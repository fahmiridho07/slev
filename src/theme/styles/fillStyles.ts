import { TextStyle, ViewStyle } from "react-native";
import { clampPercent, getPercentWidthStyle } from "../../lib/analysis";
import { AccountReconciliationRow, AllocationPlan } from "../../lib/financeEngine";
import { lightColors } from "../palettes";
import type { ColorTokens } from "../types";
import { styles } from "./app";
import { componentStyles } from "./components";

export function getAllocationFillStyle(
  row: AllocationPlan["rows"][number],
  colors: ColorTokens = lightColors
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

export function getReconciliationAmountStyle(row: AccountReconciliationRow): Pick<TextStyle, "color"> | undefined {
  if (row.difference === null || Math.abs(row.difference) <= 1000) return undefined;
  return row.difference > 0 ? componentStyles.incomeText : styles.expenseText;
}

export function getProgressFillStyle(
  progress: number,
  colors: ColorTokens = lightColors
): Pick<ViewStyle, "backgroundColor" | "width"> {
  const clampedProgress = clampPercent(progress);
  const backgroundColor = progress > 1 ? colors.coral : progress >= 0.8 ? colors.amber : colors.green;
  return {
    backgroundColor,
    width: `${Math.round(clampedProgress * 100)}%` as ViewStyle["width"]
  };
}