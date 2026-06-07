import React, { memo, useCallback, useMemo, useState } from "react";
import { SectionList, StyleProp, Text, TextInput, View, ViewStyle } from "react-native";
import { HomeMoneyPulse } from "../features/analysis/HomeMoneyPulse";
import { UpcomingBillsPanel } from "../features/analysis/UpcomingBillsPanel";
import {
  BottomSheet,
  DeleteConfirmDialog,
  EmptyState,
  ListActionRow,
  ListActionsOnboardingTip,
  MomentRow,
  SectionHeader
} from "../components";
import { useListActionsHint } from "../hooks/useListActionsHint";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { MomentEditForm } from "../features/memory/MomentEditForm";
import { SpendingMoment } from "../features/spendingMemory.types";
import { buildRepeatHints, filterMoments, getMomentTitle, groupMomentsByRecallRange } from "../lib/analysis";
import { hapticSelection } from "../lib/haptics";
import { AppNavigation } from "../navigation/appNavigation";
import { shallowEqual, useActions, useFinanceDerived, useFinanceSelector } from "../state/useFinance";
import { useTheme } from "../hooks/useTheme";
import { formatString } from "../i18n";

type OverviewMomentItemProps = {
  moment: SpendingMoment;
  onDelete: (moment: SpendingMoment) => void;
  onStartEdit: (moment: SpendingMoment) => void;
  repeatHint?: string;
};

const OverviewMomentItem = memo(function OverviewMomentItem({
  moment,
  onDelete,
  onStartEdit,
  repeatHint
}: OverviewMomentItemProps) {
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

type OverviewSection = {
  data: SpendingMoment[];
  key: string;
  sectionIndex: number;
  title: string;
};

type OverviewScreenProps = {
  navigation: AppNavigation;
  onOpenSettings: () => void;
  scrollContentStyle: StyleProp<ViewStyle>;
};

function OverviewScreenComponent({ navigation, onOpenSettings, scrollContentStyle }: OverviewScreenProps) {
  const { colors, strings, styles } = useTheme();
  const { refreshControl } = usePullToRefresh();
  const actions = useActions();
  const moments = useFinanceSelector((state) => state.moments);
  const { allocationPlan, hasMonthlyPlan, latestBalanceTotal, monthlySummary, runwayMonths, upcomingBills } =
    useFinanceDerived(
      (derived) => ({
        allocationPlan: derived.allocationPlan,
        hasMonthlyPlan: derived.hasMonthlyPlan,
        latestBalanceTotal: derived.latestBalanceTotal,
        monthlySummary: derived.monthlySummary,
        runwayMonths: derived.runwayMonths,
        upcomingBills: derived.upcomingBills
      }),
      shallowEqual
    );
  const { monthlyPlan, savingsGoals } = useFinanceSelector(
    (state) => ({
      monthlyPlan: state.monthlyPlan,
      savingsGoals: state.savingsGoals
    }),
    shallowEqual
  );

  const [editingMoment, setEditingMoment] = useState<SpendingMoment | null>(null);
  const [query, setQuery] = useState("");
  const [pendingDeleteMoment, setPendingDeleteMoment] = useState<SpendingMoment | null>(null);
  const { dismiss: dismissListHint, visible: showListHint } = useListActionsHint("memory", moments.length > 0);

  const repeatHints = useMemo(() => buildRepeatHints(moments), [moments]);
  const filteredMoments = useMemo(() => filterMoments(moments, query), [moments, query]);
  const sections = useMemo<OverviewSection[]>(
    () =>
      groupMomentsByRecallRange(filteredMoments).map((group, sectionIndex) => ({
        key: group.key,
        sectionIndex,
        title: group.label,
        data: group.items
      })),
    [filteredMoments]
  );

  const startEditing = useCallback((moment: SpendingMoment) => {
    hapticSelection();
    setEditingMoment(moment);
  }, []);

  const cancelEdit = useCallback(() => setEditingMoment(null), []);

  const handleSaved = useCallback(() => setEditingMoment(null), []);

  const renderItem = useCallback(
    ({ item, index, section }: { item: SpendingMoment; index: number; section: OverviewSection }) => (
      <View
        style={[
          styles.listPanel,
          index > 0 && styles.listPanelContinued,
          index < section.data.length - 1 && styles.listPanelMiddle
        ]}
      >
        <OverviewMomentItem
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
    ({ section }: { section: OverviewSection }) => {
      return (
        <View style={[styles.memoryGroup, section.sectionIndex > 0 && styles.memorySectionLead]}>
          <Text style={styles.groupTitle}>{section.title}</Text>
        </View>
      );
    },
    [styles.memoryGroup, styles.memorySectionLead, styles.groupTitle]
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.cardStack}>
        <HomeMoneyPulse
          dailyFlexibleRoom={allocationPlan.dailyFlexibleRoom}
          hasMonthlyPlan={hasMonthlyPlan}
          latestBalanceTotal={latestBalanceTotal}
          monthlyPlan={monthlyPlan}
          monthlySummary={monthlySummary}
          onOpenBudgetPlan={navigation.openBudgetPlan}
          runwayMonths={runwayMonths}
          savingsGoals={savingsGoals}
        />
        <UpcomingBillsPanel
          onLogPayment={(billId) => void actions.logRecurringBillPayment(billId)}
          onOpenSettings={onOpenSettings}
          upcomingBills={upcomingBills}
        />
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
      query,
      runwayMonths,
      savingsGoals,
      showListHint,
      strings.activity,
      strings.listHints.memory,
      styles.cardStack,
      styles.input,
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

export const OverviewScreen = memo(OverviewScreenComponent);