import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, SectionList, StyleProp, Text, TextInput, View, ViewStyle } from "react-native";
import {
  BottomSheet,
  DeleteConfirmDialog,
  EmptyState,
  ListActionRow,
  ListActionsOnboardingTip,
  MomentRow,
  MonthPeriodPicker,
  ScreenTabBar,
  SectionHeader,
  SegmentedControl
} from "../components";
import { AccountAnalysisPanel } from "../features/analysis/AccountAnalysisPanel";
import { BreakdownPanel } from "../features/analysis/BreakdownPanel";
import { CashflowPanel } from "../features/analysis/CashflowPanel";
import { HomeMoneyPulse } from "../features/analysis/HomeMoneyPulse";
import { UpcomingBillsPanel } from "../features/analysis/UpcomingBillsPanel";
import { useListActionsHint } from "../hooks/useListActionsHint";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { PatternTabKey } from "../features/app.types";
import { MomentEditForm } from "../features/memory/MomentEditForm";
import { SpendingMoment } from "../features/spendingMemory.types";
import { buildRepeatHints, filterMoments, getMomentTitle, groupMomentsByRecallRange } from "../lib/analysis";
import { hapticSelection } from "../lib/haptics";
import {
  getEarliestSpendingMonthOffset,
  getMonthReferenceDate,
  isCurrentMonthOffset
} from "../lib/spendingPeriod";
import { AppNavigation } from "../navigation/appNavigation";
import { formatString } from "../i18n";
import { shallowEqual, useActions, useFinanceDerived, useFinanceSelector } from "../state/useFinance";
import { useTheme } from "../hooks/useTheme";

type TrackerView = "cashflow" | "expense" | "income";

type MoneyMomentItemProps = {
  moment: SpendingMoment;
  onDelete: (moment: SpendingMoment) => void;
  onStartEdit: (moment: SpendingMoment) => void;
  repeatHint?: string;
};

const MoneyMomentItem = memo(function MoneyMomentItem({
  moment,
  onDelete,
  onStartEdit,
  repeatHint
}: MoneyMomentItemProps) {
  const { strings } = useTheme();

  return (
    <ListActionRow
      accessibilityHint={strings.common.swipeToDelete}
      accessibilityLabel={getMomentTitle(moment)}
      onDelete={() => onDelete(moment)}
      onPress={() => onStartEdit(moment)}
    >
      <MomentRow moment={moment} repeatHint={repeatHint} />
    </ListActionRow>
  );
});

type ActivitySection = {
  data: SpendingMoment[];
  key: string;
  sectionIndex: number;
  title: string;
};

type MoneyScreenProps = {
  activePatternTab: PatternTabKey;
  navigation: AppNavigation;
  onOpenBalance: () => void;
  onOpenSettings: () => void;
  onPatternTabChange: (tab: PatternTabKey) => void;
  planningEnabled: boolean;
  scrollContentStyle: StyleProp<ViewStyle>;
};

function MoneyScreenComponent({
  activePatternTab,
  navigation,
  onOpenBalance,
  onOpenSettings,
  onPatternTabChange,
  planningEnabled,
  scrollContentStyle
}: MoneyScreenProps) {
  const { colors, strings, styles } = useTheme();
  const { refreshControl } = usePullToRefresh();
  const actions = useActions();
  const [breakdownMonthOffset, setBreakdownMonthOffset] = useState(0);
  const [trackerView, setTrackerView] = useState<TrackerView>("cashflow");
  const [editingMoment, setEditingMoment] = useState<SpendingMoment | null>(null);
  const [query, setQuery] = useState("");
  const [pendingDeleteMoment, setPendingDeleteMoment] = useState<SpendingMoment | null>(null);

  const moments = useFinanceSelector((state) => state.moments);
  const { accounts, balanceSnapshots, budgetLimits, categoryModes, monthlyPlan, savingsGoals, transfers } =
    useFinanceSelector(
      (state) => ({
        accounts: state.accounts,
        balanceSnapshots: state.balanceSnapshots,
        budgetLimits: state.budgetLimits,
        categoryModes: state.categoryModes,
        monthlyPlan: state.monthlyPlan,
        savingsGoals: state.savingsGoals,
        transfers: state.transfers
      }),
      shallowEqual
    );
  const {
    allocationPlan,
    hasMonthlyPlan,
    latestBalanceTotal,
    monthlySummary,
    netWorthTrend,
    projectedBalanceSnapshots,
    runwayMonths,
    upcomingBills
  } = useFinanceDerived(
    (derived) => ({
      allocationPlan: derived.allocationPlan,
      hasMonthlyPlan: derived.hasMonthlyPlan,
      latestBalanceTotal: derived.latestBalanceTotal,
      monthlySummary: derived.monthlySummary,
      netWorthTrend: derived.netWorthTrend,
      projectedBalanceSnapshots: derived.projectedBalanceSnapshots,
      runwayMonths: derived.runwayMonths,
      upcomingBills: derived.upcomingBills
    }),
    shallowEqual
  );

  const visiblePatternTab = planningEnabled ? activePatternTab : "breakdown";
  const { dismiss: dismissListHint, visible: showListHint } = useListActionsHint("memory", moments.length > 0);
  const breakdownReferenceDate = useMemo(
    () => getMonthReferenceDate(breakdownMonthOffset),
    [breakdownMonthOffset]
  );
  const earliestMonthOffset = useMemo(() => getEarliestSpendingMonthOffset(moments), [moments]);
  const repeatHints = useMemo(() => buildRepeatHints(moments), [moments]);
  const filteredMoments = useMemo(() => filterMoments(moments, query), [moments, query]);
  const sections = useMemo<ActivitySection[]>(
    () =>
      groupMomentsByRecallRange(filteredMoments).map((group, sectionIndex) => ({
        key: group.key,
        sectionIndex,
        title: group.label,
        data: group.items
      })),
    [filteredMoments]
  );

  useEffect(() => {
    if (!planningEnabled && activePatternTab === "accounts") {
      onPatternTabChange("breakdown");
    }
  }, [activePatternTab, onPatternTabChange, planningEnabled]);

  useEffect(() => {
    if (visiblePatternTab !== "breakdown") {
      setBreakdownMonthOffset(0);
    }
  }, [visiblePatternTab]);

  const startEditing = useCallback((moment: SpendingMoment) => {
    hapticSelection();
    setEditingMoment(moment);
  }, []);

  const cancelEdit = useCallback(() => setEditingMoment(null), []);
  const handleSaved = useCallback(() => setEditingMoment(null), []);

  const patternTabBar = planningEnabled ? (
    <ScreenTabBar
      options={[
        { icon: "pie-chart-outline", label: strings.patterns.tabs.spending, value: "breakdown" },
        { icon: "card-outline", label: strings.patterns.tabs.accounts, value: "accounts" }
      ]}
      selected={visiblePatternTab}
      onSelect={onPatternTabChange}
    />
  ) : null;

  const renderItem = useCallback(
    ({ item, index, section }: { item: SpendingMoment; index: number; section: ActivitySection }) => (
      <View
        style={[
          styles.listPanel,
          index > 0 && styles.listPanelContinued,
          index < section.data.length - 1 && styles.listPanelMiddle
        ]}
      >
        <MoneyMomentItem
          moment={item}
          onDelete={setPendingDeleteMoment}
          onStartEdit={startEditing}
          repeatHint={repeatHints.get(item.id)}
        />
      </View>
    ),
    [repeatHints, startEditing, styles]
  );

  const keyExtractor = useCallback((item: SpendingMoment) => item.id, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: ActivitySection }) => (
      <View style={[styles.memoryGroup, section.sectionIndex > 0 && styles.memorySectionLead]}>
        <Text style={styles.groupTitle}>{section.title}</Text>
      </View>
    ),
    [styles.groupTitle, styles.memoryGroup, styles.memorySectionLead]
  );

  const trackerSection = useMemo(
    () => (
      <View style={styles.analyticsBlock}>
        <MonthPeriodPicker
          canGoBack={breakdownMonthOffset > earliestMonthOffset}
          canGoForward={!isCurrentMonthOffset(breakdownMonthOffset)}
          labelDate={breakdownReferenceDate}
          onNext={() => setBreakdownMonthOffset(breakdownMonthOffset + 1)}
          onPrevious={() => setBreakdownMonthOffset(breakdownMonthOffset - 1)}
        />
        <SegmentedControl
          stretch
          options={[
            { label: strings.patterns.tracker.cashflow, value: "cashflow" },
            { label: strings.common.expense, value: "expense" },
            { label: strings.common.income, value: "income" }
          ]}
          selected={trackerView}
          onSelect={setTrackerView}
        />
        {trackerView === "cashflow" && (
          <View style={styles.analyticsBlock}>
            <SectionHeader title={strings.patterns.trends.weeklyCashflow} />
            <CashflowPanel moments={moments} referenceDate={breakdownReferenceDate} />
          </View>
        )}
        {trackerView === "expense" && (
          <BreakdownPanel
            breakdownType="expense"
            budgetLimits={budgetLimits}
            moments={moments}
            monthOffset={breakdownMonthOffset}
          />
        )}
        {trackerView === "income" && (
          <BreakdownPanel
            breakdownType="income"
            budgetLimits={budgetLimits}
            moments={moments}
            monthOffset={breakdownMonthOffset}
          />
        )}
      </View>
    ),
    [
      breakdownMonthOffset,
      breakdownReferenceDate,
      budgetLimits,
      earliestMonthOffset,
      moments,
      strings.common.expense,
      strings.common.income,
      strings.patterns.tracker.cashflow,
      strings.patterns.trends.weeklyCashflow,
      styles.analyticsBlock,
      trackerView
    ]
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.cardStack}>
        {patternTabBar}
        <HomeMoneyPulse
          dailyFlexibleRoom={allocationPlan.dailyFlexibleRoom}
          hasMonthlyPlan={hasMonthlyPlan}
          latestBalanceTotal={latestBalanceTotal}
          monthlyPlan={monthlyPlan}
          monthlySummary={monthlySummary}
          onOpenBudgetPlan={planningEnabled ? navigation.openBudgetPlan : undefined}
          runwayMonths={runwayMonths}
          savingsGoals={savingsGoals}
        />
        {planningEnabled && (
          <UpcomingBillsPanel
            onLogPayment={(billId) => void actions.logRecurringBillPayment(billId)}
            onOpenSettings={onOpenSettings}
            upcomingBills={upcomingBills}
          />
        )}
        {trackerSection}
        <SectionHeader title={strings.activity.sectionTitle} />
        {showListHint && (
          <ListActionsOnboardingTip
            body={strings.listHints.memory.body}
            onDismiss={dismissListHint}
            title={strings.listHints.memory.title}
          />
        )}
        {moments.length > 0 && (
          <TextInput
            accessibilityLabel={strings.activity.searchA11y}
            onChangeText={setQuery}
            placeholder={strings.activity.searchPlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={query}
          />
        )}
      </View>
    ),
    [
      actions,
      allocationPlan.dailyFlexibleRoom,
      colors.muted,
      dismissListHint,
      hasMonthlyPlan,
      latestBalanceTotal,
      monthlyPlan,
      monthlySummary,
      moments.length,
      navigation.openBudgetPlan,
      onOpenSettings,
      patternTabBar,
      planningEnabled,
      query,
      runwayMonths,
      savingsGoals,
      showListHint,
      strings.activity,
      strings.listHints.memory,
      styles.cardStack,
      styles.input,
      trackerSection,
      upcomingBills
    ]
  );

  const listEmpty = useMemo(() => {
    if (moments.length === 0) {
      return (
        <EmptyState
          actionLabel={strings.activity.emptyAction}
          onAction={navigation.openCapture}
          text={strings.activity.emptyText}
        />
      );
    }
    if (filteredMoments.length === 0) {
      return <EmptyState text={strings.activity.searchNoResults} />;
    }
    return null;
  }, [filteredMoments.length, moments.length, navigation.openCapture, strings.activity]);

  if (planningEnabled && visiblePatternTab === "accounts") {
    return (
      <ScrollView
        contentContainerStyle={scrollContentStyle}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
      >
        <View style={styles.cardStack}>
          {patternTabBar}
          <AccountAnalysisPanel
            accounts={accounts}
            balanceSnapshots={balanceSnapshots}
            moments={moments}
            netWorthTrend={netWorthTrend}
            onDeleteTransfer={(id) => void actions.removeTransfer(id)}
            onOpenBalance={onOpenBalance}
            projectedBalanceSnapshots={projectedBalanceSnapshots}
            transfers={transfers}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <>
      <SectionList
        contentContainerStyle={scrollContentStyle}
        keyboardShouldPersistTaps="handled"
        keyExtractor={keyExtractor}
        refreshControl={refreshControl}
        ListEmptyComponent={listEmpty}
        ListHeaderComponent={listHeader}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        sections={sections}
        stickySectionHeadersEnabled={false}
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
            setPendingDeleteMoment(null);
          }
        }}
        title={strings.dialogs.activityDeleteTitle}
        visible={Boolean(pendingDeleteMoment)}
      />
    </>
  );
}

export const MoneyScreen = memo(MoneyScreenComponent);