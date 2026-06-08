import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { ProgressBar } from "../../components";
import { formatString } from "../../i18n";
import { getPercentWidthStyle } from "../../lib/analysis";
import { filterBreakdownMoments } from "../../lib/breakdownDrilldown";
import { FinanceBreakdownRow } from "../../lib/financeEngine";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { EntryType, SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";

const TOP_CATEGORY_LIMIT = 5;

type CategoryBreakdownRowsProps = {
  breakdownType: EntryType;
  moments: SpendingMoment[];
  onOpenRow: (row: FinanceBreakdownRow) => void;
  onToggleShowAll: () => void;
  referenceDate: Date;
  rows: FinanceBreakdownRow[];
  showAllCategories: boolean;
};

export function CategoryBreakdownRows({
  breakdownType,
  moments,
  onOpenRow,
  onToggleShowAll,
  referenceDate,
  rows,
  showAllCategories
}: CategoryBreakdownRowsProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const breakdownStrings = strings.patterns.breakdown;
  const visibleRows = showAllCategories ? rows : rows.slice(0, TOP_CATEGORY_LIMIT);
  const hasHiddenRows = rows.length > TOP_CATEGORY_LIMIT;

  return (
    <>
      <View style={styles.listPanel}>
        {visibleRows.map((row) => {
          const entryCount = filterBreakdownMoments(moments, breakdownType, row.key, referenceDate).length;

          return (
            <Pressable
              key={row.key}
              accessibilityLabel={formatString(breakdownStrings.viewEntriesA11y, {
                category: row.label,
                count: entryCount
              })}
              accessibilityRole="button"
              onPress={() => onOpenRow(row)}
              style={[componentStyles.listActionPressable, styles.analyticsRow]}
            >
              <View style={styles.analyticsRowHeader}>
                <Text style={[componentStyles.analyticsTitle, styles.breakdownRowTitle]}>{row.label}</Text>
                <View style={styles.breakdownRowTrailing}>
                  <Text style={styles.analyticsAmount}>
                    {formatString(breakdownStrings.amountShare, {
                      amount: formatRupiah(row.amount),
                      percent: Math.round(row.share * 100)
                    })}
                  </Text>
                  <Ionicons color={colors.muted} name="chevron-forward" size={16} />
                </View>
              </View>

              <ProgressBar
                accessibilityLabel={formatString(strings.common.progressA11y, {
                  label: row.label,
                  percent: Math.round(row.share * 100)
                })}
                fillStyle={[styles.breakdownFill, getPercentWidthStyle(row.share)]}
                value={row.share}
              />
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