import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { EmptyState, ObservationPanel, SectionHeader } from "../../components";
import { buildSpendingTrend, getPercentWidthStyle } from "../../lib/analysis";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { SpendingMoment } from "../spendingMemory.types";
import { colors } from "../../theme/colors";
import { styles } from "../../theme/styles/app";
import { CashflowPanel } from "./CashflowPanel";

export function TrendsPanel({ moments }: { moments: SpendingMoment[] }) {
  const trend = useMemo(() => buildSpendingTrend(moments), [moments]);

  if (trend.months.every((month) => month.amount === 0)) {
    return <EmptyState text="Trends appear after spending builds across months." />;
  }

  return (
    <View style={styles.analyticsBlock}>
      <View style={styles.listPanel}>
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
      </View>

      {trend.midpointMessage && (
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

      <View style={styles.settingsPanel}>
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
      </View>

      <SectionHeader title="Weekly cashflow" />
      <CashflowPanel moments={moments} showEmpty={false} />
    </View>
  );
}
