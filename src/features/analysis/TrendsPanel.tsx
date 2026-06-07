import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { EmptyState, ObservationPanel, ProgressBar, SectionHeader } from "../../components";
import { buildSpendingTrend, getPercentWidthStyle } from "../../lib/analysis";
import { NetWorthPoint } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { SpendingMoment, type PatternGroup } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
import { formatString } from "../../i18n";
import { formatLocaleShortDate } from "../../i18n/localeDate";
import { CashflowPanel } from "./CashflowPanel";

export function TrendsPanel({
  moments,
  netWorthTrend
}: {
  moments: SpendingMoment[];
  netWorthTrend: NetWorthPoint[];
}) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const trendsStrings = strings.patterns.trends;
  const trend = useMemo(() => buildSpendingTrend(moments), [moments]);
  const netWorthPeak = useMemo(
    () => netWorthTrend.reduce((peak, point) => Math.max(peak, point.total), 0),
    [netWorthTrend]
  );
  const hasSpendingTrend = !trend.months.every((month) => month.amount === 0);
  const hasNetWorthTrend = netWorthTrend.length >= 2;

  if (!hasSpendingTrend && !hasNetWorthTrend) {
    return <EmptyState text={trendsStrings.empty} />;
  }

  return (
    <View style={styles.analyticsBlock}>
      {hasNetWorthTrend ? (
        <>
          <SectionHeader title={trendsStrings.netWorthTrend} />
          <View style={styles.listPanel}>
            {netWorthTrend.map((point) => (
              <View key={point.date} style={styles.analyticsRow}>
                <View style={styles.analyticsRowHeader}>
                  <Text style={componentStyles.analyticsTitle}>{formatLocaleShortDate(point.date)}</Text>
                  <Text style={styles.analyticsAmount}>{formatCompactRupiah(point.total)}</Text>
                </View>
                <ProgressBar
                  accessibilityLabel={formatString(strings.common.progressA11y, {
                    label: formatLocaleShortDate(point.date),
                    percent: Math.round(
                      (netWorthPeak > 0 ? point.total / netWorthPeak : 0) * 100
                    )
                  })}
                  fillStyle={[
                    styles.trendFill,
                    getPercentWidthStyle(netWorthPeak > 0 ? point.total / netWorthPeak : 0)
                  ]}
                  value={netWorthPeak > 0 ? point.total / netWorthPeak : 0}
                />
              </View>
            ))}
          </View>
        </>
      ) : (
        <EmptyState text={trendsStrings.snapshotForNetWorth} />
      )}

      {hasSpendingTrend && <SectionHeader title={trendsStrings.spendingTrend} />}
      {hasSpendingTrend && <View style={styles.listPanel}>
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
      </View>}

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

      {hasSpendingTrend && <View style={styles.settingsPanel}>
        <View style={styles.settingRow}>
          <Ionicons name="podium-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{trendsStrings.topCategoriesTitle}</Text>
            <Text style={styles.settingCopy}>
              {trend.topCategories.length > 0
                ? trend.topCategories.map((category) => `${category.label} ${formatCompactRupiah(category.amount)}`).join(" - ")
                : trendsStrings.topCategoriesEmpty}
            </Text>
          </View>
        </View>
      </View>}

      {hasSpendingTrend && (
        <>
          <SectionHeader title={trendsStrings.weeklyCashflow} />
          <CashflowPanel moments={moments} showEmpty={false} />
        </>
      )}
    </View>
  );
}