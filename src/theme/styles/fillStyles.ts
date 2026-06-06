import { TextStyle, ViewStyle } from "react-native";
import { clampPercent, getPercentWidthStyle } from "../../lib/analysis";
import { AccountReconciliationRow, AllocationPlan } from "../../lib/financeEngine";
import { colors } from "../colors";
import { styles } from "./app";

export function getAllocationFillStyle(row: AllocationPlan["rows"][number]): Pick<ViewStyle, "backgroundColor" | "width"> {
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
  return row.difference > 0 ? styles.incomeText : styles.expenseText;
}

export function getProgressFillStyle(progress: number): Pick<ViewStyle, "backgroundColor" | "width"> {
  const clampedProgress = clampPercent(progress);
  const backgroundColor = progress > 1 ? "#d98272" : progress >= 0.8 ? "#d6a94a" : colors.green;
  return {
    backgroundColor,
    width: `${Math.round(clampedProgress * 100)}%` as ViewStyle["width"]
  };
}