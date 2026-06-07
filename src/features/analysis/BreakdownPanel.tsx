import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { EmptyState, ProgressBar, SectionHeader, SegmentedControl } from "../../components";
import { formatString } from "../../i18n";
import { getPercentWidthStyle } from "../../lib/analysis";
import { buildMonthlyBreakdown } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { EntryType, SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
import { MonthlySpendingChart } from "./MonthlySpendingChart";
import { SpendingTrendsSection } from "./SpendingTrendsSection";

const TOP_CATEGORY_LIMIT = 5;

export function BreakdownPanel({ moments }: { moments: SpendingMoment[] }) {
  const { componentStyles, strings, styles } = useTheme();
  const breakdownStrings = strings.patterns.breakdown;
  const [breakdownType, setBreakdownType] = useState<EntryType>("expense");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const rows = useMemo(() => buildMonthlyBreakdown(moments, breakdownType), [breakdownType, moments]);
  const visibleRows = showAllCategories ? rows : rows.slice(0, TOP_CATEGORY_LIMIT);
  const hasHiddenRows = rows.length > TOP_CATEGORY_LIMIT;

  return (
    <View style={styles.analyticsBlock}>
      <SegmentedControl
        compact
        options={[
          { label: strings.common.expense, value: "expense" },
          { label: strings.common.income, value: "income" }
        ]}
        selected={breakdownType}
        onSelect={setBreakdownType}
      />
      {rows.length === 0 ? (
        <EmptyState
          text={breakdownType === "income" ? breakdownStrings.incomeEmpty : breakdownStrings.expenseEmpty}
        />
      ) : (
        <>
          {breakdownType === "expense" && <MonthlySpendingChart compactLegend hero rows={rows} />}
          <SectionHeader
            title={breakdownType === "income" ? breakdownStrings.incomeBySource : breakdownStrings.spendingByCategory}
          />
          <View style={styles.listPanel}>
            {visibleRows.map((row) => (
              <View key={row.key} style={styles.analyticsRow}>
                <View style={styles.analyticsRowHeader}>
                  <Text style={componentStyles.analyticsTitle}>{row.label}</Text>
                  <Text style={styles.analyticsAmount}>
                    {formatString(breakdownStrings.amountShare, {
                      amount: formatCompactRupiah(row.amount),
                      percent: Math.round(row.share * 100)
                    })}
                  </Text>
                </View>
                <ProgressBar
                  accessibilityLabel={formatString(strings.common.progressA11y, {
                    label: row.label,
                    percent: Math.round(row.share * 100)
                  })}
                  fillStyle={[styles.breakdownFill, getPercentWidthStyle(row.share)]}
                  value={row.share}
                />
              </View>
            ))}
          </View>
          {hasHiddenRows && (
            <Pressable
              accessibilityLabel={showAllCategories ? breakdownStrings.viewLess : breakdownStrings.viewAll}
              accessibilityRole="button"
              onPress={() => setShowAllCategories((prev) => !prev)}
              style={styles.accordionCard}
            >
              <Text style={styles.settingTitle}>
                {showAllCategories ? breakdownStrings.viewLess : breakdownStrings.viewAll}
              </Text>
            </Pressable>
          )}
          {breakdownType === "expense" && <SpendingTrendsSection moments={moments} />}
        </>
      )}
    </View>
  );
}