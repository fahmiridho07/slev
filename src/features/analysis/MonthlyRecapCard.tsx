import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { formatString } from "../../i18n";
import { formatLocaleMonthYear } from "../../i18n/localeDate";
import { getMonthKey, getMonthMoments, sumExpenseMoments, sumMoments } from "../../lib/analysis";
import { buildMonthlyBreakdown } from "../../lib/financeEngine";
import { formatSignedCompactRupiah } from "../../lib/formatMoney";
import { getSavingsRate } from "../../lib/monthInsights";
import { getMonthReferenceDate } from "../../lib/spendingPeriod";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import {
  getDismissedMonthRecapKey,
  setDismissedMonthRecapKey
} from "../../services/uiPreferences";
import { SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";

/** The recap of last month stays visible through this day of the new month. */
const RECAP_VISIBLE_THROUGH_DAY = 10;

type MonthlyRecapCardProps = {
  moments: SpendingMoment[];
};

export function MonthlyRecapCard({ moments }: MonthlyRecapCardProps) {
  const { componentStyles, strings, styles } = useTheme();
  const recapStrings = strings.patterns.monthRecap;
  const [dismissedKey, setDismissedKey] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void getDismissedMonthRecapKey().then((stored) => {
      if (!cancelled) {
        setDismissedKey(stored);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const previousMonthDate = useMemo(() => getMonthReferenceDate(-1), []);
  const previousMonthKey = getMonthKey(previousMonthDate);
  const previousMoments = useMemo(
    () => getMonthMoments(moments, previousMonthDate),
    [moments, previousMonthDate]
  );
  const income = useMemo(
    () => sumMoments(previousMoments.filter((moment) => moment.type === "income")),
    [previousMoments]
  );
  const expense = useMemo(() => sumExpenseMoments(previousMoments), [previousMoments]);
  const topCategories = useMemo(
    () => buildMonthlyBreakdown(previousMoments, "expense", previousMonthDate).slice(0, 3),
    [previousMonthDate, previousMoments]
  );

  const withinWindow = new Date().getDate() <= RECAP_VISIBLE_THROUGH_DAY;
  const hasData = income > 0 || expense > 0;

  if (!withinWindow || !hasData || dismissedKey === undefined || dismissedKey === previousMonthKey) {
    return null;
  }

  const net = income - expense;
  const savingsRate = getSavingsRate(income, expense);
  const netStyle =
    net > 0
      ? styles.monthCashflowNetPositive
      : net < 0
        ? styles.monthCashflowNetNegative
        : styles.monthCashflowNetNeutral;

  const dismiss = () => {
    setDismissedKey(previousMonthKey);
    void setDismissedMonthRecapKey(previousMonthKey);
  };

  return (
    <View style={styles.capturePanel}>
      <Text style={styles.kicker}>
        {formatString(recapStrings.title, { month: formatLocaleMonthYear(previousMonthDate) })}
      </Text>
      <Text style={styles.settingCopy}>{recapStrings.subtitle}</Text>

      <Text style={[styles.monthCashflowNetValue, netStyle]}>{formatSignedCompactRupiah(net)}</Text>

      {savingsRate !== null ? (
        <Text
          style={[
            styles.monthCashflowDelta,
            savingsRate >= 0 ? styles.monthDeltaTextDown : styles.monthDeltaTextUp
          ]}
        >
          {savingsRate >= 0
            ? formatString(recapStrings.keptRate, { percent: Math.round(savingsRate * 100) })
            : formatString(recapStrings.keptRateNegative, {
                percent: Math.round(-savingsRate * 100)
              })}
        </Text>
      ) : null}

      <View style={styles.monthCashflowTiles}>
        <View style={[styles.monthCashflowTile, styles.monthCashflowTileIncome]}>
          <Text style={styles.monthCashflowTileLabel}>{strings.patterns.cashflow.income}</Text>
          <Text numberOfLines={1} style={styles.monthCashflowTileValue}>
            {formatRupiah(income)}
          </Text>
        </View>
        <View style={[styles.monthCashflowTile, styles.monthCashflowTileExpense]}>
          <Text style={styles.monthCashflowTileLabel}>{strings.patterns.cashflow.expense}</Text>
          <Text numberOfLines={1} style={styles.monthCashflowTileValue}>
            {formatRupiah(expense)}
          </Text>
        </View>
      </View>

      {topCategories.length > 0 ? (
        <View style={styles.trendMoversBlock}>
          <Text style={styles.groupTitle}>{recapStrings.topTitle}</Text>
          {topCategories.map((row) => (
            <View key={row.key} style={styles.trendMoversRow}>
              <Text numberOfLines={1} style={styles.trendMoversLabel}>
                {row.label}
              </Text>
              <Text style={styles.analyticsAmount}>{formatRupiah(row.amount)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Pressable
        accessibilityLabel={recapStrings.dismissA11y}
        accessibilityRole="button"
        onPress={dismiss}
        style={styles.secondaryButton}
      >
        <Text style={componentStyles.secondaryButtonText}>{recapStrings.dismiss}</Text>
      </Pressable>
    </View>
  );
}
