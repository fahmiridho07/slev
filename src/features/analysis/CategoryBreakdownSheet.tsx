import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { BottomSheet, EmptyState, MomentRow, ProgressBar } from "../../components";
import { formatString } from "../../i18n";
import { formatLocaleMonthYear } from "../../i18n/localeDate";
import { filterBreakdownMoments, getMonthlyBudgetLimit } from "../../lib/breakdownDrilldown";
import { FinanceBreakdownRow } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { BudgetLimit, EntryType, SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
import { getProgressFillStyle } from "../../theme/styles/fillStyles";

type CategoryBreakdownSheetProps = {
  breakdownType: EntryType;
  budgetLimits: BudgetLimit[];
  moments: SpendingMoment[];
  onClose: () => void;
  referenceDate: Date;
  row: FinanceBreakdownRow | null;
  visible: boolean;
};

export function CategoryBreakdownSheet({
  breakdownType,
  budgetLimits,
  moments,
  onClose,
  referenceDate,
  row,
  visible
}: CategoryBreakdownSheetProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const breakdownStrings = strings.patterns.breakdown;
  const limitsStrings = strings.budget.limits;
  const entries = useMemo(
    () => (row ? filterBreakdownMoments(moments, breakdownType, row.key, referenceDate) : []),
    [breakdownType, moments, referenceDate, row]
  );
  const monthlyLimit = row && breakdownType === "expense" ? getMonthlyBudgetLimit(budgetLimits, row.key) : undefined;
  const budgetProgress = monthlyLimit && monthlyLimit.limitAmount > 0 ? row!.amount / monthlyLimit.limitAmount : 0;

  if (!row) {
    return null;
  }

  const monthLabel = formatLocaleMonthYear(referenceDate);

  return (
    <BottomSheet
      onClose={onClose}
      title={formatString(breakdownStrings.drilldownTitle, { category: row.label, month: monthLabel })}
      visible={visible}
    >
      <View style={componentStyles.sheetForm}>
        <Text style={styles.settingCopy}>
          {formatString(breakdownStrings.drilldownSummary, {
            count: entries.length,
            total: formatCompactRupiah(row.amount)
          })}
        </Text>

        {monthlyLimit && (
          <View style={styles.breakdownBudgetBlock}>
            <Text style={styles.budgetMeta}>
              {formatString(limitsStrings.spentOfLimit, {
                spent: formatCompactRupiah(row.amount),
                limit: formatCompactRupiah(monthlyLimit.limitAmount),
                period: limitsStrings.monthly
              })}
            </Text>
            <ProgressBar
              accessibilityLabel={formatString(strings.common.progressA11y, {
                label: row.label,
                percent: Math.round(budgetProgress * 100)
              })}
              fillStyle={[styles.progressFill, getProgressFillStyle(budgetProgress, colors)]}
              value={budgetProgress}
            />
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.repeatBlock}
          showsVerticalScrollIndicator={false}
          style={componentStyles.sheetScroll}
        >
          {entries.length === 0 ? (
            <EmptyState text={breakdownStrings.drilldownEmpty} />
          ) : (
            <View style={styles.listPanel}>
              {entries.map((moment) => (
                <MomentRow key={moment.id} moment={moment} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}