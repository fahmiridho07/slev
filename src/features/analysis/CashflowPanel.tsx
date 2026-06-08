import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { EmptyState } from "../../components";
import { formatString } from "../../i18n";
import { buildCashflowWeeks, CashflowWeeksMode, getPercentWidthStyle, getTrackerEmptyReason } from "../../lib/analysis";
import { getTrackerEmptyCopy } from "../../lib/trackerCopy";
import { formatSignedCompactRupiah } from "../../lib/formatMoney";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";

export function CashflowPanel({
  moments,
  mode = "month",
  referenceDate,
  showEmpty = true
}: {
  moments: SpendingMoment[];
  mode?: CashflowWeeksMode;
  referenceDate?: Date;
  showEmpty?: boolean;
}) {
  const { componentStyles, strings, styles } = useTheme();
  const cashflowStrings = strings.patterns.cashflow;
  const resolvedReferenceDate = referenceDate ?? new Date();
  const emptyReason = useMemo(
    () =>
      mode === "month"
        ? getTrackerEmptyReason(moments, resolvedReferenceDate, "cashflow")
        : null,
    [mode, moments, resolvedReferenceDate]
  );
  const weeks = useMemo(
    () => buildCashflowWeeks(moments, { mode, referenceDate }),
    [mode, moments, referenceDate]
  );
  const maxWeeklyAmount = useMemo(
    () => Math.max(1, ...weeks.flatMap((week) => [week.income, week.expense])),
    [weeks]
  );

  if (emptyReason) {
    return showEmpty ? (
      <EmptyState text={getTrackerEmptyCopy(emptyReason, "cashflow", strings.patterns.tracker)} />
    ) : null;
  }

  if (weeks.every((week) => week.income === 0 && week.expense === 0)) {
    return showEmpty ? <EmptyState text={cashflowStrings.empty} /> : null;
  }

  return (
    <View style={styles.listPanel}>
      {weeks.map((week, index) => (
        <View key={week.key} style={[styles.cashflowRow, index === weeks.length - 1 && styles.cashflowRowRecent]}>
          <View style={styles.analyticsRowHeader}>
            <Text style={componentStyles.analyticsTitle}>{week.label}</Text>
            <Text style={[styles.analyticsAmount, week.net >= 0 ? componentStyles.incomeText : styles.expenseText]}>
              {formatString(cashflowStrings.net, { amount: formatSignedCompactRupiah(week.net) })}
            </Text>
          </View>
          <View style={styles.cashflowBars}>
            <View style={styles.cashflowBarLine}>
              <Text style={styles.cashflowLabel}>{strings.common.income}</Text>
              <View style={styles.cashflowTrack}>
                <View style={[styles.incomeFill, getPercentWidthStyle(week.income / maxWeeklyAmount)]} />
              </View>
              <Text style={styles.cashflowAmount}>{formatRupiah(week.income)}</Text>
            </View>
            <View style={styles.cashflowBarLine}>
              <Text style={styles.cashflowLabel}>{strings.common.expense}</Text>
              <View style={styles.cashflowTrack}>
                <View style={[styles.expenseFill, getPercentWidthStyle(week.expense / maxWeeklyAmount)]} />
              </View>
              <Text style={styles.cashflowAmount}>{formatRupiah(week.expense)}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}