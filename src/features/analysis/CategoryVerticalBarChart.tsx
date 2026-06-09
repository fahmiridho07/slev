import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { formatString } from "../../i18n";
import { getPercentHeightStyle } from "../../lib/analysis";
import { FinanceBreakdownRow } from "../../lib/financeEngine";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { useTheme } from "../../hooks/useTheme";
import { getCategoryChartColors } from "./categoryChartColors";

const CHART_COLUMN_LIMIT = 5;
const MIN_RELATIVE_BAR_HEIGHT = 0.1;

type CategoryVerticalBarChartProps = {
  limit?: number;
  onPressRow?: (row: FinanceBreakdownRow) => void;
  rows: FinanceBreakdownRow[];
};

export function CategoryVerticalBarChart({
  limit = CHART_COLUMN_LIMIT,
  onPressRow,
  rows
}: CategoryVerticalBarChartProps) {
  const { colors, strings, styles } = useTheme();
  const chartStrings = strings.patterns.chart;
  const chartColors = useMemo(() => getCategoryChartColors(colors), [colors]);
  const visibleRows = rows.slice(0, limit);
  const total = useMemo(() => rows.reduce((sum, row) => sum + row.amount, 0), [rows]);
  const maxShare = useMemo(
    () => visibleRows.reduce((peak, row) => Math.max(peak, row.share), 0),
    [visibleRows]
  );

  if (visibleRows.length === 0 || total <= 0) {
    return null;
  }

  return (
    <View style={styles.chartColumnPanel}>
      <View style={styles.chartColumnChart}>
        {visibleRows.map((row, index) => {
          const percent = Math.round(row.share * 100);
          const barColor = chartColors[index % chartColors.length];
          const relativeShare = maxShare > 0 ? row.share / maxShare : 0;
          const barHeight =
            relativeShare > 0 ? Math.max(relativeShare, MIN_RELATIVE_BAR_HEIGHT) : 0;

          const column = (
            <View style={styles.chartColumn}>
              <Text style={styles.chartColumnPercent}>{percent}%</Text>
              <View style={styles.chartColumnTrack}>
                <View
                  style={[
                    styles.chartColumnFill,
                    getPercentHeightStyle(barHeight),
                    { backgroundColor: barColor }
                  ]}
                />
              </View>
            </View>
          );

          if (!onPressRow) {
            return (
              <View key={row.key} style={styles.chartColumnPressable}>
                {column}
              </View>
            );
          }

          return (
            <Pressable
              key={row.key}
              accessibilityLabel={`${row.label}: ${formatRupiah(row.amount)}, ${percent} percent`}
              accessibilityRole="button"
              onPress={() => onPressRow(row)}
              style={({ pressed }) => [
                styles.chartColumnPressable,
                pressed && styles.chartColumnPressablePressed
              ]}
            >
              {column}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.chartColumnLegendDivider} />

      <View style={styles.chartLegend}>
        {visibleRows.map((row, index) => {
          const percent = Math.round(row.share * 100);
          const barColor = chartColors[index % chartColors.length];
          const legendContent = (
            <>
              <View style={styles.chartLegendLabelRow}>
                <View style={[styles.chartLegendSwatch, { backgroundColor: barColor }]} />
                <Text numberOfLines={1} style={styles.chartLegendLabel}>
                  {row.label}
                </Text>
              </View>
              <Text style={styles.chartLegendValue}>
                {formatString(chartStrings.legendValue, {
                  amount: formatRupiah(row.amount),
                  percent
                })}
              </Text>
            </>
          );

          if (!onPressRow) {
            return (
              <View key={row.key} style={styles.chartLegendRow}>
                {legendContent}
              </View>
            );
          }

          return (
            <Pressable
              key={row.key}
              accessibilityLabel={`${row.label}: ${formatRupiah(row.amount)}, ${percent} percent`}
              accessibilityRole="button"
              onPress={() => onPressRow(row)}
              style={({ pressed }) => [
                styles.chartLegendRow,
                styles.chartLegendRowPressable,
                pressed && styles.chartColumnPressablePressed
              ]}
            >
              {legendContent}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}