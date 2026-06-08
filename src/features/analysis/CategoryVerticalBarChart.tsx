import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { getPercentHeightStyle } from "../../lib/analysis";
import { FinanceBreakdownRow } from "../../lib/financeEngine";
import { useTheme } from "../../hooks/useTheme";

type CategoryVerticalBarChartProps = {
  limit?: number;
  onPressRow?: (row: FinanceBreakdownRow) => void;
  rows: FinanceBreakdownRow[];
};

export function CategoryVerticalBarChart({
  limit = 5,
  onPressRow,
  rows
}: CategoryVerticalBarChartProps) {
  const { colors, styles } = useTheme();
  const chartColors = useMemo(
    () => [
      colors.greenDark,
      colors.blue,
      colors.amber,
      colors.coral,
      colors.chartSage,
      colors.chartLilac,
      colors.chartSlate,
      colors.chartCopper
    ],
    [
      colors.amber,
      colors.blue,
      colors.chartCopper,
      colors.chartLilac,
      colors.chartSage,
      colors.chartSlate,
      colors.coral,
      colors.greenDark
    ]
  );
  const visibleRows = rows.slice(0, limit);
  const maxShare = useMemo(
    () => Math.max(...visibleRows.map((row) => row.share), 0.01),
    [visibleRows]
  );

  if (visibleRows.length === 0) {
    return null;
  }

  return (
    <View style={styles.chartColumnChart}>
      {visibleRows.map((row, index) => {
        const relativeShare = row.share / maxShare;
        const barColor = chartColors[index % chartColors.length];
        const column = (
          <View key={row.key} style={styles.chartColumn}>
            <View
              accessibilityLabel={`${row.label}: ${Math.round(row.share * 100)} percent`}
              accessibilityRole="text"
              style={styles.chartColumnTrack}
            >
              <View
                style={[
                  styles.chartColumnFill,
                  getPercentHeightStyle(relativeShare),
                  { backgroundColor: barColor }
                ]}
              />
            </View>
            <Text numberOfLines={2} style={styles.chartColumnLabel}>
              {row.label}
            </Text>
          </View>
        );

        if (!onPressRow) {
          return column;
        }

        return (
          <Pressable
            key={row.key}
            accessibilityRole="button"
            onPress={() => onPressRow(row)}
            style={styles.chartColumnPressable}
          >
            {column}
          </Pressable>
        );
      })}
    </View>
  );
}