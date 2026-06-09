import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { MonthPeriodPicker } from "../../components";
import { formatString } from "../../i18n";
import { getMonthMoments, sumExpenseMoments, sumMoments } from "../../lib/analysis";
import { formatSignedCompactRupiah } from "../../lib/formatMoney";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { buildMonthExpenseComparison, getMonthReferenceDate } from "../../lib/spendingPeriod";
import { SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";

const FLAT_DELTA_THRESHOLD = 0.005;

type MonthSummaryCardProps = {
  canGoBack: boolean;
  canGoForward: boolean;
  labelDate: Date;
  moments: SpendingMoment[];
  monthOffset: number;
  onNext: () => void;
  onPrevious: () => void;
};

export function MonthSummaryCard({
  canGoBack,
  canGoForward,
  labelDate,
  moments,
  monthOffset,
  onNext,
  onPrevious
}: MonthSummaryCardProps) {
  const { colors, strings, styles } = useTheme();
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

  const netValueStyle =
    net > 0
      ? styles.monthCashflowNetPositive
      : net < 0
        ? styles.monthCashflowNetNegative
        : styles.monthCashflowNetNeutral;

  return (
    <View style={styles.monthCashflowCard}>
      <MonthPeriodPicker
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        embedded
        labelDate={labelDate}
        onNext={onNext}
        onPrevious={onPrevious}
      />

      <View style={styles.monthCashflowDivider} />

      <Text style={styles.monthCashflowNetLabel}>{cashflowStrings.netThisMonth}</Text>
      <Text style={[styles.monthCashflowNetValue, netValueStyle]}>
        {formatSignedCompactRupiah(net)}
      </Text>

      {deltaLabel ? (
        <Text
          style={[
            styles.monthCashflowDelta,
            deltaTone === "up" ? styles.monthDeltaTextUp : styles.monthDeltaTextDown
          ]}
        >
          {deltaLabel}
        </Text>
      ) : null}

      <View style={styles.monthCashflowTiles}>
        <View style={[styles.monthCashflowTile, styles.monthCashflowTileIncome]}>
          <View style={styles.pulseTopRow}>
            <View style={[styles.pulseIconBadge, styles.pulseIconIncome]}>
              <Ionicons color={colors.greenDark} name="arrow-down-circle-outline" size={15} />
            </View>
            <Text style={styles.monthCashflowTileLabel}>{cashflowStrings.income}</Text>
          </View>
          <Text numberOfLines={1} style={styles.monthCashflowTileValue}>
            {formatRupiah(income)}
          </Text>
        </View>

        <View style={[styles.monthCashflowTile, styles.monthCashflowTileExpense]}>
          <View style={styles.pulseTopRow}>
            <View style={[styles.pulseIconBadge, styles.pulseIconSpending]}>
              <Ionicons color={colors.coral} name="arrow-up-circle-outline" size={15} />
            </View>
            <Text style={styles.monthCashflowTileLabel}>{cashflowStrings.expense}</Text>
          </View>
          <Text numberOfLines={1} style={styles.monthCashflowTileValue}>
            {formatRupiah(expense)}
          </Text>
        </View>
      </View>
    </View>
  );
}