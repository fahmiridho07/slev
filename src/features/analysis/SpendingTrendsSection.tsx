import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { EmptyState, ObservationPanel, ProgressBar, SectionHeader } from "../../components";
import { formatString } from "../../i18n";
import { buildCashflowWeeks, buildSpendingTrend, getDataMaturity, getPercentWidthStyle } from "../../lib/analysis";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { SpendingMoment, type PatternGroup } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
import { CashflowPanel } from "./CashflowPanel";

export function SpendingTrendsSection({ moments }: { moments: SpendingMoment[] }) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const trendsStrings = strings.patterns.trends;
  const maturity = useMemo(() => getDataMaturity(moments), [moments]);
  const trend = useMemo(() => buildSpendingTrend(moments), [moments]);
  const distinctWeeksWithData = useMemo(() => {
    const fullWeeks = buildCashflowWeeks(moments, { mode: "full" });
    return fullWeeks.filter((week) => week.income > 0 || week.expense > 0).length;
  }, [moments]);
  const [expanded, setExpanded] = useState(maturity === "established");
  const [fullCashflow, setFullCashflow] = useState(distinctWeeksWithData >= 4);
  const hasSpendingTrend = !trend.months.every((month) => month.amount === 0);
  const hasCashflow = useMemo(() => {
    const weeks = buildCashflowWeeks(moments, { mode: fullCashflow ? "full" : "default" });
    return weeks.some((week) => week.income > 0 || week.expense > 0);
  }, [fullCashflow, moments]);

  if (!hasSpendingTrend && !hasCashflow) {
    return null;
  }

  return (
    <View style={styles.cardStack}>
      <Pressable
        accessibilityLabel={
          expanded ? trendsStrings.collapseAdvancedTrends : trendsStrings.expandAdvancedTrends
        }
        accessibilityRole="button"
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.accordionCard}
      >
        <Text style={styles.settingTitle}>{trendsStrings.advancedTrends}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} />
      </Pressable>

      {expanded && (
        <View style={styles.analyticsBlock}>
          {hasSpendingTrend && (
            <>
              <SectionHeader title={trendsStrings.spendingTrend} />
              <View style={styles.listPanel}>
                {trend.months.map((month) => (
                  <View key={month.key} style={styles.analyticsRow}>
                    <View style={styles.analyticsRowHeader}>
                      <Text style={componentStyles.analyticsTitle}>{month.label}</Text>
                      <Text style={styles.analyticsAmount}>{formatCompactRupiah(month.amount)}</Text>
                    </View>
                    <ProgressBar
                      accessibilityLabel={formatString(strings.common.progressA11y, {
                        label: month.label,
                        percent: Math.round(month.share * 100)
                      })}
                      fillStyle={[styles.trendFill, getPercentWidthStyle(month.share)]}
                      value={month.share}
                    />
                  </View>
                ))}
              </View>
            </>
          )}

          {hasSpendingTrend && trend.midpointMessage && (
            <ObservationPanel
              pattern={{
                id: "midpoint-trend",
                group: strings.patterns.groups.standsOut as PatternGroup,
                title: trendsStrings.currentPaceTitle,
                detail: trend.midpointMessage,
                tone: "warm"
              }}
            />
          )}

          {hasCashflow && (
            <>
              <SectionHeader title={trendsStrings.weeklyCashflow} />
              <CashflowPanel moments={moments} mode={fullCashflow ? "full" : "default"} showEmpty={false} />
              {distinctWeeksWithData >= 4 && (
                <Pressable
                  accessibilityLabel={
                    fullCashflow ? trendsStrings.hideFullCashflow : trendsStrings.showFullCashflow
                  }
                  accessibilityRole="button"
                  onPress={() => setFullCashflow((prev) => !prev)}
                  style={styles.accordionCard}
                >
                  <Text style={styles.settingTitle}>
                    {fullCashflow ? trendsStrings.hideFullCashflow : trendsStrings.showFullCashflow}
                  </Text>
                  <Ionicons
                    name={fullCashflow ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.muted}
                  />
                </Pressable>
              )}
            </>
          )}

          {!hasSpendingTrend && !hasCashflow && <EmptyState text={trendsStrings.empty} />}
        </View>
      )}
    </View>
  );
}