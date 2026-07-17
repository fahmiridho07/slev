import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { formatString } from "../../i18n";
import { displayContext } from "../../i18n/display";
import { formatLocaleMonthShort } from "../../i18n/localeDate";
import { formatSignedCompactRupiah } from "../../lib/formatMoney";
import {
  buildCashflowTrend,
  buildCategoryMonthDeltas,
  getTopCategoryIncreases
} from "../../lib/monthInsights";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";

const TREND_MONTHS = 6;

type SpendingTrendCardProps = {
  moments: SpendingMoment[];
  monthOffset: number;
};

function getBarWidthStyle(share: number): { width: `${number}%` } {
  if (share <= 0) {
    return { width: "0%" };
  }
  return { width: `${Math.max(2, Math.round(share * 100))}%` };
}

export function SpendingTrendCard({ moments, monthOffset }: SpendingTrendCardProps) {
  const { colors, strings, styles } = useTheme();
  const trendStrings = strings.patterns.trends;
  const breakdownStrings = strings.patterns.breakdown;
  const [expanded, setExpanded] = useState(false);

  const trend = useMemo(() => buildCashflowTrend(moments, TREND_MONTHS), [moments]);
  const movers = useMemo(
    () => getTopCategoryIncreases(buildCategoryMonthDeltas(moments, monthOffset)),
    [moments, monthOffset]
  );

  const activeMonths = useMemo(
    () => trend.filter((point) => point.income > 0 || point.expense > 0).length,
    [trend]
  );

  if (activeMonths < 2) {
    return null;
  }

  const maxFlow = Math.max(1, ...trend.map((point) => Math.max(point.income, point.expense)));

  return (
    <View style={styles.cardStack}>
      <Pressable
        accessibilityLabel={trendStrings.cashflowTrendTitle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.accordionCard}
      >
        <Text style={styles.settingTitle}>{trendStrings.cashflowTrendTitle}</Text>
        <Ionicons color={colors.muted} name={expanded ? "chevron-up" : "chevron-down"} size={18} />
      </Pressable>

      {expanded ? (
        <View style={styles.capturePanel}>
          <View style={styles.repeatBlock}>
            {trend.map((point) => {
              const netStyle =
                point.net > 0
                  ? styles.trendNetPositive
                  : point.net < 0
                    ? styles.trendNetNegative
                    : styles.trendNetNeutral;

              return (
                <View key={point.monthDate.toISOString()} style={styles.trendMonthRow}>
                  <Text style={styles.trendMonthLabel}>{formatLocaleMonthShort(point.monthDate)}</Text>
                  <View style={styles.trendBars}>
                    <View style={styles.trendBarTrack}>
                      <View style={[styles.trendBarIncome, getBarWidthStyle(point.income / maxFlow)]} />
                    </View>
                    <View style={styles.trendBarTrack}>
                      <View style={[styles.trendBarExpense, getBarWidthStyle(point.expense / maxFlow)]} />
                    </View>
                  </View>
                  <Text numberOfLines={1} style={[styles.trendNetValue, netStyle]}>
                    {formatSignedCompactRupiah(point.net)}
                  </Text>
                </View>
              );
            })}
          </View>

          {movers.length > 0 ? (
            <View style={styles.trendMoversBlock}>
              <Text style={styles.groupTitle}>{breakdownStrings.topIncreasesTitle}</Text>
              {movers.map((mover) => (
                <View key={mover.context} style={styles.trendMoversRow}>
                  <Text numberOfLines={1} style={styles.trendMoversLabel}>
                    {displayContext(mover.context)}
                  </Text>
                  <Text style={styles.trendMoversValue}>
                    {mover.deltaPercent === null
                      ? `${formatRupiah(mover.current)} · ${breakdownStrings.categoryNewThisMonth}`
                      : formatString(breakdownStrings.topIncreaseAmount, {
                          amount: formatRupiah(mover.deltaAmount),
                          percent: Math.round(mover.deltaPercent * 100)
                        })}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
