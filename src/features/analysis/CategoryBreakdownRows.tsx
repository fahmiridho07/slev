import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { formatString } from "../../i18n";
import { filterBreakdownMoments } from "../../lib/breakdownDrilldown";
import { FinanceBreakdownRow } from "../../lib/financeEngine";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { EntryType, SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
import { getCategoryChartColors } from "./categoryChartColors";

const TOP_CATEGORY_LIMIT = 5;

type CategoryBreakdownRowsProps = {
  breakdownType: EntryType;
  moments: SpendingMoment[];
  onOpenRow: (row: FinanceBreakdownRow) => void;
  onToggleShowAll: () => void;
  referenceDate: Date;
  rows: FinanceBreakdownRow[];
  showAllCategories: boolean;
  skipTopRows?: number;
};

export function CategoryBreakdownRows({
  breakdownType,
  moments,
  onOpenRow,
  onToggleShowAll,
  referenceDate,
  rows,
  showAllCategories,
  skipTopRows = 0
}: CategoryBreakdownRowsProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const breakdownStrings = strings.patterns.breakdown;
  const chartColors = useMemo(() => getCategoryChartColors(colors), [colors]);
  const listRows = showAllCategories ? rows.slice(skipTopRows) : rows.slice(skipTopRows, TOP_CATEGORY_LIMIT);
  const hasHiddenRows =
    skipTopRows > 0 ? rows.length > skipTopRows : rows.length > TOP_CATEGORY_LIMIT;

  if (listRows.length === 0) {
    return hasHiddenRows ? (
      <Pressable
        accessibilityLabel={breakdownStrings.viewAll}
        accessibilityRole="button"
        onPress={onToggleShowAll}
        style={styles.accordionCard}
      >
        <Text style={styles.settingTitle}>{breakdownStrings.viewAll}</Text>
      </Pressable>
    ) : null;
  }

  return (
    <>
      <View style={styles.listPanel}>
        {listRows.map((row) => {
          const rowIndex = rows.findIndex((candidate) => candidate.key === row.key);
          const entryCount = filterBreakdownMoments(moments, breakdownType, row.key, referenceDate).length;
          const swatchColor = chartColors[rowIndex % chartColors.length];

          return (
            <Pressable
              key={row.key}
              accessibilityLabel={formatString(breakdownStrings.viewEntriesA11y, {
                category: row.label,
                count: entryCount
              })}
              accessibilityRole="button"
              onPress={() => onOpenRow(row)}
              style={[componentStyles.listActionPressable, styles.breakdownLegendRow]}
            >
              <View style={[styles.breakdownLegendSwatch, { backgroundColor: swatchColor }]} />
              <View style={styles.breakdownLegendTextBlock}>
                <Text numberOfLines={1} style={[componentStyles.analyticsTitle, styles.breakdownRowTitle]}>
                  {row.label}
                </Text>
                <Text style={styles.breakdownLegendMeta}>
                  {formatString(breakdownStrings.amountShare, {
                    amount: formatRupiah(row.amount),
                    percent: Math.round(row.share * 100)
                  })}
                </Text>
              </View>
              <Ionicons color={colors.muted} name="chevron-forward" size={16} />
            </Pressable>
          );
        })}
      </View>

      {hasHiddenRows ? (
        <Pressable
          accessibilityLabel={showAllCategories ? breakdownStrings.viewLess : breakdownStrings.viewAll}
          accessibilityRole="button"
          onPress={onToggleShowAll}
          style={styles.accordionCard}
        >
          <Text style={styles.settingTitle}>
            {showAllCategories ? breakdownStrings.viewLess : breakdownStrings.viewAll}
          </Text>
        </Pressable>
      ) : null}
    </>
  );
}