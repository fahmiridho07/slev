import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  BottomSheet,
  DeleteConfirmDialog,
  EmptyState,
  MonthPeriodPicker,
  ProgressBar,
  SectionHeader,
  SegmentedControl
} from "../../components";
import { formatString } from "../../i18n";
import { AppStrings } from "../../i18n/types";
import { getMomentTitle, getPercentWidthStyle } from "../../lib/analysis";
import {
  buildBreakdownMonthDeltas,
  filterBreakdownMoments,
  getBreakdownDeltaBadgeKind,
  getMonthlyBudgetLimit,
  getTopBreakdownIncreases,
  shouldShowBreakdownDeltaBadge
} from "../../lib/breakdownDrilldown";
import { FinanceBreakdownRow, buildMonthlyBreakdown } from "../../lib/financeEngine";
import {
  buildMonthExpenseComparison,
  getEarliestSpendingMonthOffset,
  getMonthReferenceDate,
  isCurrentMonthOffset
} from "../../lib/spendingPeriod";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { BudgetLimit, EntryType, SpendingMoment } from "../spendingMemory.types";
import { MomentEditForm } from "../memory/MomentEditForm";
import { hapticSelection } from "../../lib/haptics";
import { useActions } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";
import { getProgressFillStyle } from "../../theme/styles/fillStyles";
import { CategoryBreakdownSheet } from "./CategoryBreakdownSheet";
import { MonthlySpendingChart } from "./MonthlySpendingChart";
import { SpendingTrendsSection } from "./SpendingTrendsSection";

const TOP_CATEGORY_LIMIT = 5;
const FLAT_DELTA_THRESHOLD = 0.005;

type BreakdownPanelProps = {
  budgetLimits: BudgetLimit[];
  moments: SpendingMoment[];
  monthOffset: number;
  onMonthOffsetChange: (offset: number) => void;
};

function getDeltaBadgeLabel(
  deltaKind: ReturnType<typeof getBreakdownDeltaBadgeKind>,
  deltaPercent: number | null,
  strings: AppStrings
): string | null {
  if (!deltaKind) {
    return null;
  }

  const breakdownStrings = strings.patterns.breakdown;
  if (deltaKind === "new") {
    return breakdownStrings.categoryNewThisMonth;
  }

  if (deltaPercent === null) {
    return null;
  }

  const percent = Math.round(Math.abs(deltaPercent) * 100);
  return deltaKind === "up"
    ? formatString(breakdownStrings.categoryDeltaUp, { percent })
    : formatString(breakdownStrings.categoryDeltaDown, { percent });
}

export function BreakdownPanel({ budgetLimits, moments, monthOffset, onMonthOffsetChange }: BreakdownPanelProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const actions = useActions();
  const breakdownStrings = strings.patterns.breakdown;
  const limitsStrings = strings.budget.limits;
  const [breakdownType, setBreakdownType] = useState<EntryType>("expense");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedRow, setSelectedRow] = useState<FinanceBreakdownRow | null>(null);
  const [editingMoment, setEditingMoment] = useState<SpendingMoment | null>(null);
  const [pendingDeleteMoment, setPendingDeleteMoment] = useState<SpendingMoment | null>(null);
  const referenceDate = useMemo(() => getMonthReferenceDate(monthOffset), [monthOffset]);
  const earliestMonthOffset = useMemo(() => getEarliestSpendingMonthOffset(moments), [moments]);
  const rows = useMemo(
    () => buildMonthlyBreakdown(moments, breakdownType, referenceDate),
    [breakdownType, moments, referenceDate]
  );
  const visibleRows = showAllCategories ? rows : rows.slice(0, TOP_CATEGORY_LIMIT);
  const hasHiddenRows = rows.length > TOP_CATEGORY_LIMIT;
  const entryCountByKey = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      counts.set(row.key, filterBreakdownMoments(moments, breakdownType, row.key, referenceDate).length);
    }
    return counts;
  }, [breakdownType, moments, referenceDate, rows]);
  const monthDeltas = useMemo(
    () => buildBreakdownMonthDeltas(moments, breakdownType, monthOffset),
    [breakdownType, moments, monthOffset]
  );
  const topIncreases = useMemo(
    () => getTopBreakdownIncreases(rows, monthDeltas),
    [monthDeltas, rows]
  );
  const expenseComparison = useMemo(
    () => buildMonthExpenseComparison(moments, monthOffset),
    [moments, monthOffset]
  );
  const deltaLabel = useMemo(() => {
    if (breakdownType !== "expense" || expenseComparison.previousExpense <= 0) {
      return null;
    }

    const percent = expenseComparison.deltaPercent;
    if (percent === null) {
      return null;
    }

    if (Math.abs(percent) < FLAT_DELTA_THRESHOLD) {
      return breakdownStrings.vsLastMonthFlat;
    }

    const roundedPercent = Math.round(Math.abs(percent) * 100);
    return percent > 0
      ? formatString(breakdownStrings.vsLastMonthUp, { percent: roundedPercent })
      : formatString(breakdownStrings.vsLastMonthDown, { percent: roundedPercent });
  }, [breakdownStrings, breakdownType, expenseComparison.deltaPercent, expenseComparison.previousExpense]);
  const deltaTone = expenseComparison.deltaPercent && expenseComparison.deltaPercent > 0 ? "up" : "down";
  const showTopIncreases =
    breakdownType === "expense" && expenseComparison.previousExpense > 0 && topIncreases.length > 0;

  useEffect(() => {
    setSelectedRow(null);
    setEditingMoment(null);
    setPendingDeleteMoment(null);
  }, [breakdownType, monthOffset]);

  const openRow = useCallback((row: FinanceBreakdownRow) => {
    hapticSelection();
    setSelectedRow(row);
  }, []);

  const startEditing = useCallback((moment: SpendingMoment) => {
    hapticSelection();
    setEditingMoment(moment);
  }, []);

  const cancelEdit = useCallback(() => setEditingMoment(null), []);

  const handleSaved = useCallback(() => setEditingMoment(null), []);

  return (
    <View style={styles.analyticsBlock}>
      <MonthPeriodPicker
        canGoBack={monthOffset > earliestMonthOffset}
        canGoForward={!isCurrentMonthOffset(monthOffset)}
        labelDate={referenceDate}
        onNext={() => onMonthOffsetChange(monthOffset + 1)}
        onPrevious={() => onMonthOffsetChange(monthOffset - 1)}
      />

      {deltaLabel && (
        <View style={styles.monthDeltaBadge}>
          <Text
            style={[
              styles.monthDeltaText,
              deltaTone === "up" ? styles.monthDeltaTextUp : styles.monthDeltaTextDown
            ]}
          >
            {deltaLabel}
          </Text>
        </View>
      )}

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
          {breakdownType === "expense" && (
            <MonthlySpendingChart compactLegend hero periodDate={referenceDate} rows={rows} />
          )}

          {showTopIncreases && (
            <View style={styles.topIncreasesPanel}>
              <Text style={componentStyles.microLabel}>{breakdownStrings.topIncreasesTitle}</Text>
              {topIncreases.map((increase) => {
                const matchingRow = rows.find((row) => row.key === increase.key);
                return (
                  <Pressable
                    key={increase.key}
                    accessibilityLabel={formatString(breakdownStrings.viewEntriesA11y, {
                      category: increase.label,
                      count: entryCountByKey.get(increase.key) ?? 0
                    })}
                    accessibilityRole="button"
                    disabled={!matchingRow}
                    onPress={() => matchingRow && openRow(matchingRow)}
                    style={styles.topIncreaseRow}
                  >
                    <Text style={styles.topIncreaseLabel}>{increase.label}</Text>
                    <Text style={styles.topIncreaseAmount}>
                      {formatString(breakdownStrings.topIncreaseAmount, {
                        amount: formatCompactRupiah(increase.deltaAmount),
                        percent: increase.deltaPercent ? Math.round(increase.deltaPercent * 100) : 0
                      })}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <SectionHeader
            title={breakdownType === "income" ? breakdownStrings.incomeBySource : breakdownStrings.spendingByCategory}
          />
          <View style={styles.listPanel}>
            {visibleRows.map((row) => {
              const monthlyLimit =
                breakdownType === "expense" ? getMonthlyBudgetLimit(budgetLimits, row.key) : undefined;
              const budgetProgress =
                monthlyLimit && monthlyLimit.limitAmount > 0 ? row.amount / monthlyLimit.limitAmount : 0;
              const rowDelta = monthDeltas.get(row.key);
              const deltaKind = getBreakdownDeltaBadgeKind(rowDelta);
              const deltaBadgeLabel = getDeltaBadgeLabel(deltaKind, rowDelta?.deltaPercent ?? null, strings);

              return (
                <Pressable
                  key={row.key}
                  accessibilityLabel={formatString(breakdownStrings.viewEntriesA11y, {
                    category: row.label,
                    count: entryCountByKey.get(row.key) ?? 0
                  })}
                  accessibilityRole="button"
                  onPress={() => openRow(row)}
                  style={[componentStyles.listActionPressable, styles.analyticsRow]}
                >
                  <View style={styles.analyticsRowHeader}>
                    <View style={styles.breakdownRowTitleBlock}>
                      <Text style={[componentStyles.analyticsTitle, styles.breakdownRowTitle]}>{row.label}</Text>
                      {deltaBadgeLabel && shouldShowBreakdownDeltaBadge(rowDelta) && (
                        <View
                          style={[
                            styles.categoryDeltaBadge,
                            deltaKind === "up" || deltaKind === "new"
                              ? styles.categoryDeltaBadgeUp
                              : styles.categoryDeltaBadgeDown
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryDeltaText,
                              deltaKind === "up" || deltaKind === "new"
                                ? styles.categoryDeltaTextUp
                                : styles.categoryDeltaTextDown
                            ]}
                          >
                            {deltaBadgeLabel}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.breakdownRowTrailing}>
                      <Text style={styles.analyticsAmount}>
                        {formatString(breakdownStrings.amountShare, {
                          amount: formatCompactRupiah(row.amount),
                          percent: Math.round(row.share * 100)
                        })}
                      </Text>
                      <Ionicons color={colors.muted} name="chevron-forward" size={16} />
                    </View>
                  </View>

                  {monthlyLimit && (
                    <Text style={styles.budgetMeta}>
                      {formatString(limitsStrings.spentOfLimit, {
                        spent: formatCompactRupiah(row.amount),
                        limit: formatCompactRupiah(monthlyLimit.limitAmount),
                        period: limitsStrings.monthly
                      })}
                    </Text>
                  )}

                  <ProgressBar
                    accessibilityLabel={formatString(strings.common.progressA11y, {
                      label: row.label,
                      percent: Math.round(row.share * 100)
                    })}
                    fillStyle={[styles.breakdownFill, getPercentWidthStyle(row.share)]}
                    value={row.share}
                  />

                  {monthlyLimit && (
                    <ProgressBar
                      accessibilityLabel={formatString(breakdownStrings.budgetProgressA11y, {
                        label: row.label,
                        percent: Math.round(budgetProgress * 100)
                      })}
                      fillStyle={[styles.progressFill, getProgressFillStyle(budgetProgress, colors)]}
                      value={budgetProgress}
                    />
                  )}
                </Pressable>
              );
            })}
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
          {breakdownType === "expense" && isCurrentMonthOffset(monthOffset) && (
            <SpendingTrendsSection moments={moments} />
          )}
        </>
      )}

      <CategoryBreakdownSheet
        breakdownType={breakdownType}
        budgetLimits={budgetLimits}
        moments={moments}
        onClose={() => setSelectedRow(null)}
        onDeleteMoment={setPendingDeleteMoment}
        onEditMoment={startEditing}
        referenceDate={referenceDate}
        row={selectedRow}
        visible={Boolean(selectedRow)}
      />

      <BottomSheet
        onClose={cancelEdit}
        title={
          editingMoment
            ? formatString(strings.activity.editSheetTitleNamed, { title: getMomentTitle(editingMoment) })
            : strings.activity.editSheetTitle
        }
        visible={Boolean(editingMoment)}
      >
        {editingMoment ? (
          <MomentEditForm
            key={editingMoment.id}
            moment={editingMoment}
            onCancel={cancelEdit}
            onSaved={handleSaved}
          />
        ) : null}
      </BottomSheet>

      <DeleteConfirmDialog
        body={
          pendingDeleteMoment
            ? formatString(strings.dialogs.activityDeleteBody, { title: getMomentTitle(pendingDeleteMoment) })
            : ""
        }
        onCancel={() => setPendingDeleteMoment(null)}
        onConfirm={() => {
          if (pendingDeleteMoment) {
            void actions.removeMoment(pendingDeleteMoment.id);
          }
          setPendingDeleteMoment(null);
        }}
        title={strings.dialogs.activityDeleteTitle}
        visible={Boolean(pendingDeleteMoment)}
      />
    </View>
  );
}