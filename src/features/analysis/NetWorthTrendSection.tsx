import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { EmptyState, ProgressBar, SectionHeader } from "../../components";
import { formatString } from "../../i18n";
import { formatLocaleShortDate } from "../../i18n/localeDate";
import { getPercentWidthStyle } from "../../lib/analysis";
import { NetWorthPoint } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { useTheme } from "../../hooks/useTheme";

export function NetWorthTrendSection({
  netWorthTrend,
  onOpenBalance
}: {
  netWorthTrend: NetWorthPoint[];
  onOpenBalance: () => void;
}) {
  const { componentStyles, strings, styles } = useTheme();
  const trendsStrings = strings.patterns.trends;
  const netWorthPeak = useMemo(
    () => netWorthTrend.reduce((peak, point) => Math.max(peak, point.total), 0),
    [netWorthTrend]
  );
  const hasNetWorthTrend = netWorthTrend.length >= 2;

  if (!hasNetWorthTrend) {
    return (
      <EmptyState
        actionLabel={trendsStrings.snapshotAction}
        onAction={onOpenBalance}
        text={trendsStrings.snapshotForNetWorth}
      />
    );
  }

  return (
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
                percent: Math.round((netWorthPeak > 0 ? point.total / netWorthPeak : 0) * 100)
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
  );
}