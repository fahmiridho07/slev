import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { formatString } from "../../i18n";
import { getMonthMoments, sumExpenseMoments, sumMoments } from "../../lib/analysis";
import { formatSignedCompactRupiah } from "../../lib/formatMoney";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { buildMonthExpenseComparison, getMonthReferenceDate } from "../../lib/spendingPeriod";
import { SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";

const FLAT_DELTA_THRESHOLD = 0.005;

type MonthSummaryCardProps = {
  moments: SpendingMoment[];
  monthOffset: number;
};

export function MonthSummaryCard({ moments, monthOffset }: MonthSummaryCardProps) {
  const { strings, styles } = useTheme();
  const cashflowStrings = strings.patterns.cashflow;
  const breakdownStrings = strings.patterns.breakdown;
  const referenceDate = useMemo(() => getMonthReferenceDate(monthOffset), [monthOffset]);
  const monthMoments = useMemo(() => getMonthMoments(moments, referenceDate), [moments, referenceDate]);
  const income = useMemo(
    () => sumMoments(monthMoments.filter((moment) => moment.type === "income")),
    [monthMoments]
  );
  const expense = useMemo(() => sumExpenseMoments(monthMoments), [monthMoments]);
  const net = income - expense;
  const expenseComparison = useMemo(
    () => buildMonthExpenseComparison(moments, monthOffset),
    [moments, monthOffset]
  );

  const deltaLabel = useMemo(() => {
    if (expenseComparison.previousExpense <= 0) {
      return null;
    }

    const percent = expenseComparison.deltaPercent;
    if (percent === null) {
      return null;
    }

    if (Math.abs(percent) < FLAT_DELTA_THRESHOLD) {
      return breakdownStrings.vsLastMonthFlat;
    }

    const roundedPercent = Math.round(Math.abs(percent) * 100);
    return percent > 0
      ? formatString(breakdownStrings.vsLastMonthUp, { percent: roundedPercent })
      : formatString(breakdownStrings.vsLastMonthDown, { percent: roundedPercent });
  }, [breakdownStrings, expenseComparison.deltaPercent, expenseComparison.previousExpense]);

  const deltaTone =
    expenseComparison.deltaPercent && expenseComparison.deltaPercent > 0 ? "up" : "down";

  return (
    <View style={styles.capturePanel}>
      <View style={styles.monthSummaryGrid}>
        <View style={styles.monthSummaryCell}>
          <Text style={styles.monthSummaryLabel}>{cashflowStrings.income}</Text>
          <Text style={styles.monthSummaryValue}>{formatRupiah(income)}</Text>
        </View>
        <View style={styles.monthSummaryCell}>
          <Text style={styles.monthSummaryLabel}>{cashflowStrings.expense}</Text>
          <Text style={styles.monthSummaryValue}>{formatRupiah(expense)}</Text>
        </View>
        <View style={styles.monthSummaryCell}>
          <Text style={styles.monthSummaryLabel}>{cashflowStrings.netLabel}</Text>
          <Text style={[styles.monthSummaryValue, net < 0 && styles.monthSummaryValueNegative]}>
            {formatSignedCompactRupiah(net)}
          </Text>
        </View>
      </View>

      {deltaLabel ? (
        <View style={styles.monthDeltaBadge}>
          <Text
            style={[
              styles.monthDeltaText,
              deltaTone === "up" ? styles.monthDeltaTextUp : styles.monthDeltaTextDown
            ]}
          >
            {deltaLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}