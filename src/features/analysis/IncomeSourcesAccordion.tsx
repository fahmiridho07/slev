import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { EmptyState } from "../../components";
import { getTrackerEmptyReason } from "../../lib/analysis";
import { getTrackerEmptyCopy } from "../../lib/trackerCopy";
import { buildMonthlyBreakdown, FinanceBreakdownRow } from "../../lib/financeEngine";
import { getMonthReferenceDate } from "../../lib/spendingPeriod";
import { SpendingMoment } from "../spendingMemory.types";
import { hapticSelection } from "../../lib/haptics";
import { useTheme } from "../../hooks/useTheme";
import { BreakdownDrilldownOverlays } from "./BreakdownDrilldownOverlays";
import { CategoryBreakdownRows } from "./CategoryBreakdownRows";
import { CategoryVerticalBarChart } from "./CategoryVerticalBarChart";

type IncomeSourcesAccordionProps = {
  moments: SpendingMoment[];
  monthOffset: number;
};

export function IncomeSourcesAccordion({ moments, monthOffset }: IncomeSourcesAccordionProps) {
  const { colors, strings, styles } = useTheme();
  const breakdownStrings = strings.patterns.breakdown;
  const [expanded, setExpanded] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedRow, setSelectedRow] = useState<FinanceBreakdownRow | null>(null);
  const [editingMoment, setEditingMoment] = useState<SpendingMoment | null>(null);
  const [pendingDeleteMoment, setPendingDeleteMoment] = useState<SpendingMoment | null>(null);
  const referenceDate = useMemo(() => getMonthReferenceDate(monthOffset), [monthOffset]);
  const emptyReason = useMemo(
    () => getTrackerEmptyReason(moments, referenceDate, "income"),
    [moments, referenceDate]
  );
  const rows = useMemo(
    () => buildMonthlyBreakdown(moments, "income", referenceDate),
    [moments, referenceDate]
  );

  useEffect(() => {
    setShowAllCategories(false);
    setSelectedRow(null);
    setEditingMoment(null);
    setPendingDeleteMoment(null);
  }, [monthOffset]);

  const openRow = useCallback((row: FinanceBreakdownRow) => {
    hapticSelection();
    setSelectedRow(row);
  }, []);

  const startEditing = useCallback((moment: SpendingMoment) => {
    hapticSelection();
    setSelectedRow(null);
    setEditingMoment(moment);
  }, []);

  if (rows.length === 0 && !emptyReason) {
    return null;
  }

  return (
    <View style={styles.cardStack}>
      <Pressable
        accessibilityLabel={expanded ? breakdownStrings.viewLess : breakdownStrings.viewAll}
        accessibilityRole="button"
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.accordionCard}
      >
        <Text style={styles.settingTitle}>{breakdownStrings.incomeBySource}</Text>
        <Ionicons color={colors.muted} name={expanded ? "chevron-up" : "chevron-down"} size={18} />
      </Pressable>

      {expanded ? (
        <View style={styles.capturePanel}>
          {rows.length === 0 ? (
            <EmptyState
              text={
                emptyReason
                  ? getTrackerEmptyCopy(emptyReason, "income", strings.patterns.tracker)
                  : breakdownStrings.incomeEmpty
              }
            />
          ) : (
            <>
              {emptyReason ? (
                <EmptyState text={getTrackerEmptyCopy(emptyReason, "income", strings.patterns.tracker)} />
              ) : null}
              <CategoryVerticalBarChart onPressRow={openRow} rows={rows} />
              {showAllCategories ? (
                <CategoryBreakdownRows
                  breakdownType="income"
                  moments={moments}
                  onOpenRow={openRow}
                  onToggleShowAll={() => setShowAllCategories((prev) => !prev)}
                  referenceDate={referenceDate}
                  rows={rows}
                  showAllCategories={showAllCategories}
                  skipTopRows={5}
                />
              ) : (
                <CategoryBreakdownRows
                  breakdownType="income"
                  moments={moments}
                  onOpenRow={openRow}
                  onToggleShowAll={() => setShowAllCategories(true)}
                  referenceDate={referenceDate}
                  rows={rows}
                  showAllCategories={false}
                  skipTopRows={5}
                />
              )}
            </>
          )}

          <BreakdownDrilldownOverlays
            breakdownType="income"
            editingMoment={editingMoment}
            moments={moments}
            onCloseEdit={() => setEditingMoment(null)}
            onCloseRow={() => setSelectedRow(null)}
            onEditMoment={startEditing}
            onSaved={() => setEditingMoment(null)}
            pendingDeleteMoment={pendingDeleteMoment}
            referenceDate={referenceDate}
            selectedRow={selectedRow}
            setPendingDeleteMoment={setPendingDeleteMoment}
          />
        </View>
      ) : null}
    </View>
  );
}