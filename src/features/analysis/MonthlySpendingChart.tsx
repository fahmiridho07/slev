import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { getPercentWidthStyle } from "../../lib/analysis";
import { FinanceBreakdownRow } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { colors } from "../../theme/colors";
import { styles } from "../../theme/styles/app";

const CHART_COLORS = [
  colors.greenDark,
  colors.blue,
  colors.amber,
  colors.coral,
  "#7a9e7e",
  "#9b7bb8",
  "#6f8ea8",
  "#c58b5a"
];

export function MonthlySpendingChart({ rows }: { rows: FinanceBreakdownRow[] }) {
  const total = useMemo(() => rows.reduce((sum, row) => sum + row.amount, 0), [rows]);

  if (rows.length === 0 || total <= 0) {
    return null;
  }

  return (
    <View style={styles.capturePanel}>
      <Text style={styles.microLabel}>This month at a glance</Text>
      <Text style={styles.settingCopy}>{formatCompactRupiah(total)} across {rows.length} categories</Text>

      <View style={styles.chartStackTrack}>
        <View style={styles.chartStackRow}>
          {rows.map((row, index) => (
            <View
              key={row.key}
              style={[
                styles.chartStackSegment,
                getPercentWidthStyle(row.share),
                { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.chartLegend}>
        {rows.map((row, index) => (
          <View key={row.key} style={styles.chartLegendRow}>
            <View style={styles.chartLegendLabelRow}>
              <View
                style={[
                  styles.chartLegendSwatch,
                  { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }
                ]}
              />
              <Text style={styles.chartLegendLabel}>{row.label}</Text>
            </View>
            <Text style={styles.chartLegendValue}>
              {formatCompactRupiah(row.amount)} · {Math.round(row.share * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}