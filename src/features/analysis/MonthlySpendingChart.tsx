import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { formatString } from "../../i18n";
import { getPercentWidthStyle } from "../../lib/analysis";
import { FinanceBreakdownRow } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { useTheme } from "../../hooks/useTheme";

export function MonthlySpendingChart({ rows }: { rows: FinanceBreakdownRow[] }) {
  const { colors, strings, styles } = useTheme();
  const chartStrings = strings.patterns.chart;
  const chartColors = useMemo(
    () => [
      colors.greenDark,
      colors.blue,
      colors.amber,
      colors.coral,
      "#7a9e7e",
      "#9b7bb8",
      "#6f8ea8",
      "#c58b5a"
    ],
    [colors.amber, colors.blue, colors.coral, colors.greenDark]
  );
  const total = useMemo(() => rows.reduce((sum, row) => sum + row.amount, 0), [rows]);

  if (rows.length === 0 || total <= 0) {
    return null;
  }

  return (
    <View style={styles.capturePanel}>
      <Text style={styles.microLabel}>{chartStrings.title}</Text>
      <Text style={styles.settingCopy}>
        {formatString(chartStrings.totalAcross, { total: formatCompactRupiah(total), count: rows.length })}
      </Text>

      <View style={styles.chartStackTrack}>
        <View style={styles.chartStackRow}>
          {rows.map((row, index) => (
            <View
              key={row.key}
              style={[
                styles.chartStackSegment,
                getPercentWidthStyle(row.share),
                { backgroundColor: chartColors[index % chartColors.length] }
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
                  { backgroundColor: chartColors[index % chartColors.length] }
                ]}
              />
              <Text style={styles.chartLegendLabel}>{row.label}</Text>
            </View>
            <Text style={styles.chartLegendValue}>
              {formatString(chartStrings.legendValue, {
                amount: formatCompactRupiah(row.amount),
                percent: Math.round(row.share * 100)
              })}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}