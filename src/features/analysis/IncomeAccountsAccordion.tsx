import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { EmptyState, SegmentedControl } from "../../components";
import { getTrackerEmptyReason } from "../../lib/analysis";
import { getTrackerEmptyCopy } from "../../lib/trackerCopy";
import { BreakdownFilterType } from "../../lib/breakdownDrilldown";
import { buildMonthlyBreakdown, buildMonthlyIncomeBySource, FinanceBreakdownRow } from "../../lib/financeEngine";
import { getMonthReferenceDate } from "../../lib/spendingPeriod";
import { SpendingMoment } from "../spendingMemory.types";
import { hapticSelection } from "../../lib/haptics";
import { useTheme } from "../../hooks/useTheme";
import { BreakdownDrilldownOverlays } from "./BreakdownDrilldownOverlays";
import { CategoryBreakdownRows } from "./CategoryBreakdownRows";
import { CategoryVerticalBarChart } from "./CategoryVerticalBarChart";

type IncomeViewMode = "account" | "source";

type IncomeAccountsAccordionProps = {
  moments: SpendingMoment[];
  monthOffset: number;
};

export function IncomeAccountsAccordion({ moments, monthOffset }: IncomeAccountsAccordionProps) {
  const { colors, strings, styles } = useTheme();
  const breakdownStrings = strings.patterns.breakdown;
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<IncomeViewMode>("account");
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
    () =>
      viewMode === "account"
        ? buildMonthlyBreakdown(moments, "income", referenceDate)
        : buildMonthlyIncomeBySource(moments, referenceDate),
    [moments, referenceDate, viewMode]
  );
  const breakdownType: BreakdownFilterType = viewMode === "account" ? "income" : "income_source";
  const accordionTitle =
    viewMode === "account" ? breakdownStrings.incomeByAccount : breakdownStrings.incomeBySource;

  useEffect(() => {
    setShowAllCategories(false);
    setSelectedRow(null);
    setEditingMoment(null);
    setPendingDeleteMoment(null);
  }, [monthOffset, viewMode]);

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
        <Text style={styles.settingTitle}>{accordionTitle}</Text>
        <Ionicons color={colors.muted} name={expanded ? "chevron-up" : "chevron-down"} size={18} />
      </Pressable>

      {expanded ? (
        <View style={styles.capturePanel}>
          <SegmentedControl
            compact
            options={[
              { label: breakdownStrings.incomeViewAccount, value: "account" },
              { label: breakdownStrings.incomeViewSource, value: "source" }
            ]}
            selected={viewMode}
            onSelect={setViewMode}
          />
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
              <Text style={styles.settingCopy}>{breakdownStrings.incomeLoggedHint}</Text>
              <CategoryVerticalBarChart onPressRow={openRow} rows={rows} />
              {showAllCategories ? (
                <CategoryBreakdownRows
                  breakdownType={breakdownType}
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
                  breakdownType={breakdownType}
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
            breakdownType={breakdownType}
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