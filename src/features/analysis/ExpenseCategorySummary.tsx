import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { EmptyState, SectionHeader } from "../../components";
import { getTrackerEmptyReason } from "../../lib/analysis";
import { getTrackerEmptyCopy } from "../../lib/trackerCopy";
import { buildMonthlyBreakdown, FinanceBreakdownRow } from "../../lib/financeEngine";
import { getMonthReferenceDate } from "../../lib/spendingPeriod";
import { SpendingMoment } from "../spendingMemory.types";
import { hapticSelection } from "../../lib/haptics";
import { useTheme } from "../../hooks/useTheme";
import { BreakdownDrilldownOverlays } from "./BreakdownDrilldownOverlays";
import { CategoryBreakdownRows } from "./CategoryBreakdownRows";

type ExpenseCategorySummaryProps = {
  moments: SpendingMoment[];
  monthOffset: number;
};

export function ExpenseCategorySummary({ moments, monthOffset }: ExpenseCategorySummaryProps) {
  const { strings, styles } = useTheme();
  const breakdownStrings = strings.patterns.breakdown;
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedRow, setSelectedRow] = useState<FinanceBreakdownRow | null>(null);
  const [editingMoment, setEditingMoment] = useState<SpendingMoment | null>(null);
  const [pendingDeleteMoment, setPendingDeleteMoment] = useState<SpendingMoment | null>(null);
  const referenceDate = useMemo(() => getMonthReferenceDate(monthOffset), [monthOffset]);
  const emptyReason = useMemo(
    () => getTrackerEmptyReason(moments, referenceDate, "expense"),
    [moments, referenceDate]
  );
  const rows = useMemo(
    () => buildMonthlyBreakdown(moments, "expense", referenceDate),
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

  if (rows.length === 0) {
    return (
      <View style={styles.capturePanel}>
        <SectionHeader title={breakdownStrings.spendingByCategory} />
        <EmptyState
          text={
            emptyReason
              ? getTrackerEmptyCopy(emptyReason, "expense", strings.patterns.tracker)
              : breakdownStrings.expenseEmpty
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.capturePanel}>
      {emptyReason ? (
        <EmptyState text={getTrackerEmptyCopy(emptyReason, "expense", strings.patterns.tracker)} />
      ) : null}

      <SectionHeader title={breakdownStrings.spendingByCategory} />
      <CategoryBreakdownRows
        breakdownType="expense"
        moments={moments}
        onOpenRow={openRow}
        onToggleShowAll={() => setShowAllCategories((prev) => !prev)}
        referenceDate={referenceDate}
        rows={rows}
        showAllCategories={showAllCategories}
      />

      <BreakdownDrilldownOverlays
        breakdownType="expense"
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
  );
}