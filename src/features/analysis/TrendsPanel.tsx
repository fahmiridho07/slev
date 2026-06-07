import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { EmptyState, ObservationPanel, SectionHeader } from "../../components";
import { buildSpendingTrend, getPercentWidthStyle } from "../../lib/analysis";
import { NetWorthPoint } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { SpendingMoment } from "../spendingMemory.types";
import { colors } from "../../theme/colors";
import { styles } from "../../theme/styles/app";
import { CashflowPanel } from "./CashflowPanel";

function formatTrendDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short"
  });
}

export function TrendsPanel({
  moments,
  netWorthTrend
}: {
  moments: SpendingMoment[];
  netWorthTrend: NetWorthPoint[];
}) {
  const trend = useMemo(() => buildSpendingTrend(moments), [moments]);
  const netWorthPeak = useMemo(
    () => netWorthTrend.reduce((peak, point) => Math.max(peak, point.total), 0),
    [netWorthTrend]
  );
  const hasSpendingTrend = !trend.months.every((month) => month.amount === 0);
  const hasNetWorthTrend = netWorthTrend.length >= 2;

  if (!hasSpendingTrend && !hasNetWorthTrend) {
    return <EmptyState text="Trends appear after spending builds across months." />;
  }

  return (
    <View style={styles.analyticsBlock}>
      {hasNetWorthTrend ? (
        <>
          <SectionHeader title="Net-worth trend" />
          <View style={styles.listPanel}>
            {netWorthTrend.map((point) => (
              <View key={point.date} style={styles.analyticsRow}>
                <View style={styles.analyticsRowHeader}>
                  <Text style={styles.analyticsTitle}>{formatTrendDate(point.date)}</Text>
                  <Text style={styles.analyticsAmount}>{formatCompactRupiah(point.total)}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.trendFill,
                      getPercentWidthStyle(netWorthPeak > 0 ? point.total / netWorthPeak : 0)
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </>
      ) : (
        <EmptyState text="Snapshot your balances to see net-worth trend." />
      )}

      {hasSpendingTrend && <SectionHeader title="Spending trend" />}
      {hasSpendingTrend && <View style={styles.listPanel}>
        {trend.months.map((month) => (
          <View key={month.key} style={styles.analyticsRow}>
            <View style={styles.analyticsRowHeader}>
              <Text style={styles.analyticsTitle}>{month.label}</Text>
              <Text style={styles.analyticsAmount}>{formatCompactRupiah(month.amount)}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.trendFill, getPercentWidthStyle(month.share)]} />
            </View>
          </View>
        ))}
      </View>}

      {hasSpendingTrend && trend.midpointMessage && (
        <ObservationPanel
          pattern={{
            id: "midpoint-trend",
            group: "Stands out this week",
            title: "Current month pace is visible",
            detail: trend.midpointMessage,
            tone: "warm"
          }}
        />
      )}

      {hasSpendingTrend && <View style={styles.settingsPanel}>
        <View style={styles.settingRow}>
          <Ionicons name="podium-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Top categories this month</Text>
            <Text style={styles.settingCopy}>
              {trend.topCategories.length > 0
                ? trend.topCategories.map((category) => `${category.label} ${formatCompactRupiah(category.amount)}`).join(" - ")
                : "No category has stood out yet this month."}
            </Text>
          </View>
        </View>
      </View>}

      {hasSpendingTrend && (
        <>
          <SectionHeader title="Weekly cashflow" />
          <CashflowPanel moments={moments} showEmpty={false} />
        </>
      )}
    </View>
  );
}
