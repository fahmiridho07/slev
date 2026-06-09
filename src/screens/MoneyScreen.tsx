import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleProp, Text, TextInput, View, ViewStyle } from "react-native";
import {
  BottomSheet,
  DeleteConfirmDialog,
  EmptyState,
  ListActionRow,
  ListActionsOnboardingTip,
  MomentRow,
  MonthPeriodPicker,
  SectionHeader,
  SegmentedControl,
  TransferRow
} from "../components";
import { AccountActivitySummary } from "../features/analysis/AccountActivitySummary";
import { ExpenseCategorySummary } from "../features/analysis/ExpenseCategorySummary";
import { IncomeAccountsAccordion } from "../features/analysis/IncomeAccountsAccordion";
import { MonthSummaryCard } from "../features/analysis/MonthSummaryCard";
import { useListActionsHint } from "../hooks/useListActionsHint";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { MomentEditForm } from "../features/memory/MomentEditForm";
import { TransferEditForm } from "../features/memory/TransferEditForm";
import { MoneyTransfer, SpendingMoment } from "../features/spendingMemory.types";
import { buildRepeatHints, getMomentTitle } from "../lib/analysis";
import {
  buildMonthActivityFeed,
  filterActivityFeed,
  getTransferActivityTitle,
  groupActivityFeedByDate
} from "../lib/activityFeed";
import { formatLocaleMonthYear } from "../i18n/localeDate";
import { hapticSelection } from "../lib/haptics";
import {
  getEarliestSpendingMonthOffset,
  getMonthReferenceDate,
  isCurrentMonthOffset
} from "../lib/spendingPeriod";
import { AppNavigation } from "../navigation/appNavigation";
import { formatString } from "../i18n";
import { useActions, useFinanceSelector } from "../state/useFinance";
import { useTheme } from "../hooks/useTheme";

type MoneyTab = "overview" | "activity";

type MoneyMomentItemProps = {
  isLast: boolean;
  moment: SpendingMoment;
  onDelete: (moment: SpendingMoment) => void;
  onStartEdit: (moment: SpendingMoment) => void;
  repeatHint?: string;
};

function MoneyMomentItem({
  isLast,
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
      rowKey={moment.id}
    >
      <MomentRow isLast={isLast} moment={moment} repeatHint={repeatHint} />
    </ListActionRow>
  );
}

type MoneyTransferItemProps = {
  isLast: boolean;
  onDelete: (transfer: MoneyTransfer) => void;
  onStartEdit: (transfer: MoneyTransfer) => void;
  transfer: MoneyTransfer;
};

function MoneyTransferItem({
  isLast,
  onDelete,
  onStartEdit,
  transfer
}: MoneyTransferItemProps) {
  const { strings } = useTheme();

  return (
    <ListActionRow
      accessibilityHint={strings.common.swipeToDelete}
      accessibilityLabel={getTransferActivityTitle(transfer)}
      onDelete={() => onDelete(transfer)}
      onPress={() => onStartEdit(transfer)}
      rowKey={transfer.id}
    >
      <TransferRow isLast={isLast} transfer={transfer} />
    </ListActionRow>
  );
}

type MoneyScreenProps = {
  navigation: AppNavigation;
  scrollContentStyle: StyleProp<ViewStyle>;
};

function MoneyScreenComponent({
  navigation,
  scrollContentStyle
}: MoneyScreenProps) {
  const { colors, strings, styles } = useTheme();
  const { refreshControl } = usePullToRefresh();
  const actions = useActions();
  const [moneyTab, setMoneyTab] = useState<MoneyTab>("overview");
  const [breakdownMonthOffset, setBreakdownMonthOffset] = useState(0);
  const [editingMoment, setEditingMoment] = useState<SpendingMoment | null>(null);
  const [editingTransfer, setEditingTransfer] = useState<MoneyTransfer | null>(null);
  const [query, setQuery] = useState("");
  const [pendingDeleteMoment, setPendingDeleteMoment] = useState<SpendingMoment | null>(null);
  const [pendingDeleteTransfer, setPendingDeleteTransfer] = useState<MoneyTransfer | null>(null);

  const moments = useFinanceSelector((state) => state.moments);
  const transfers = useFinanceSelector((state) => state.transfers);
  const { dismiss: dismissListHint, visible: showListHint } = useListActionsHint("memory", moments.length > 0);
  const breakdownReferenceDate = useMemo(
    () => getMonthReferenceDate(breakdownMonthOffset),
    [breakdownMonthOffset]
  );
  const earliestMonthOffset = useMemo(
    () => getEarliestSpendingMonthOffset(moments, transfers),
    [moments, transfers]
  );
  const repeatHints = useMemo(() => buildRepeatHints(moments), [moments]);
  const monthActivityItems = useMemo(
    () => buildMonthActivityFeed(moments, transfers, breakdownReferenceDate),
    [breakdownReferenceDate, moments, transfers]
  );
  const filteredActivityItems = useMemo(
    () => filterActivityFeed(monthActivityItems, query),
    [monthActivityItems, query]
  );
  const sections = useMemo(
    () =>
      groupActivityFeedByDate(filteredActivityItems).map((section, sectionIndex) => ({
        ...section,
        sectionIndex
      })),
    [filteredActivityItems]
  );
  const activityMonthLabel = useMemo(
    () => formatLocaleMonthYear(breakdownReferenceDate),
    [breakdownReferenceDate]
  );
  const hasAnyActivity = moments.length > 0 || transfers.length > 0;

  useEffect(() => {
    setQuery("");
  }, [breakdownMonthOffset]);

  const startEditingMoment = useCallback((moment: SpendingMoment) => {
    hapticSelection();
    setEditingMoment(moment);
  }, []);

  const startEditingTransfer = useCallback((transfer: MoneyTransfer) => {
    hapticSelection();
    setEditingTransfer(transfer);
  }, []);

  const cancelMomentEdit = useCallback(() => setEditingMoment(null), []);
  const cancelTransferEdit = useCallback(() => setEditingTransfer(null), []);
  const handleMomentSaved = useCallback(() => setEditingMoment(null), []);
  const handleTransferSaved = useCallback(() => setEditingTransfer(null), []);

  const activitySections = useMemo(
    () =>
      sections.map((section) => (
        <View key={section.key}>
          <View style={[styles.memoryGroup, section.sectionIndex > 0 && styles.memorySectionLead]}>
            <Text style={styles.groupTitle}>{section.title}</Text>
          </View>
          <View style={styles.listPanel}>
            {section.data.map((item, index) => {
              const isLast = index === section.data.length - 1;

              if (item.kind === "moment") {
                return (
                  <MoneyMomentItem
                    key={item.id}
                    isLast={isLast}
                    moment={item.moment}
                    onDelete={setPendingDeleteMoment}
                    onStartEdit={startEditingMoment}
                    repeatHint={repeatHints.get(item.moment.id)}
                  />
                );
              }

              return (
                <MoneyTransferItem
                  key={item.id}
                  isLast={isLast}
                  onDelete={setPendingDeleteTransfer}
                  onStartEdit={startEditingTransfer}
                  transfer={item.transfer}
                />
              );
            })}
          </View>
        </View>
      )),
    [repeatHints, sections, startEditingMoment, startEditingTransfer, styles]
  );

  const tabSwitcher = useMemo(
    () => (
      <SegmentedControl
        stretch
        options={[
          { label: strings.activity.tabOverview, value: "overview" },
          { label: strings.activity.tabActivity, value: "activity" }
        ]}
        selected={moneyTab}
        onSelect={setMoneyTab}
      />
    ),
    [moneyTab, strings.activity.tabActivity, strings.activity.tabOverview]
  );

  const overviewContent = useMemo(
    () => (
      <View style={styles.cardStack}>
        {tabSwitcher}
        <MonthSummaryCard
          canGoBack={breakdownMonthOffset > earliestMonthOffset}
          canGoForward={!isCurrentMonthOffset(breakdownMonthOffset)}
          labelDate={breakdownReferenceDate}
          moments={moments}
          monthOffset={breakdownMonthOffset}
          onNext={() => setBreakdownMonthOffset(breakdownMonthOffset + 1)}
          onPrevious={() => setBreakdownMonthOffset(breakdownMonthOffset - 1)}
        />
        <ExpenseCategorySummary moments={moments} monthOffset={breakdownMonthOffset} />
        <AccountActivitySummary moments={moments} monthOffset={breakdownMonthOffset} />
        <IncomeAccountsAccordion moments={moments} monthOffset={breakdownMonthOffset} />
      </View>
    ),
    [
      breakdownMonthOffset,
      breakdownReferenceDate,
      earliestMonthOffset,
      moments,
      styles.cardStack,
      tabSwitcher
    ]
  );

  const activityHeader = useMemo(
    () => (
      <View style={styles.cardStack}>
        {tabSwitcher}
        <View style={styles.capturePanel}>
          <MonthPeriodPicker
            canGoBack={breakdownMonthOffset > earliestMonthOffset}
            canGoForward={!isCurrentMonthOffset(breakdownMonthOffset)}
            labelDate={breakdownReferenceDate}
            onNext={() => setBreakdownMonthOffset(breakdownMonthOffset + 1)}
            onPrevious={() => setBreakdownMonthOffset(breakdownMonthOffset - 1)}
          />
        </View>
        <SectionHeader title={formatString(strings.activity.monthTitle, { month: activityMonthLabel })} />
        {showListHint && (
          <ListActionsOnboardingTip
            body={strings.listHints.memory.body}
            onDismiss={dismissListHint}
            title={strings.listHints.memory.title}
          />
        )}
        {hasAnyActivity ? (
          <TextInput
            accessibilityLabel={strings.activity.searchA11y}
            onChangeText={setQuery}
            placeholder={strings.activity.searchPlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={query}
          />
        ) : null}
      </View>
    ),
    [
      activityMonthLabel,
      breakdownMonthOffset,
      breakdownReferenceDate,
      colors.muted,
      dismissListHint,
      earliestMonthOffset,
      hasAnyActivity,
      query,
      showListHint,
      strings.activity,
      strings.listHints.memory,
      styles.cardStack,
      styles.input,
      tabSwitcher
    ]
  );

  const activityEmpty = useMemo(() => {
    if (!hasAnyActivity) {
      return (
        <EmptyState
          actionLabel={strings.activity.emptyAction}
          onAction={navigation.openCapture}
          text={strings.activity.emptyText}
        />
      );
    }
    if (monthActivityItems.length === 0) {
      return <EmptyState text={strings.activity.monthEmpty} />;
    }
    if (filteredActivityItems.length === 0) {
      return <EmptyState text={strings.activity.searchNoResults} />;
    }
    return null;
  }, [
    filteredActivityItems.length,
    hasAnyActivity,
    monthActivityItems.length,
    navigation.openCapture,
    strings.activity
  ]);

  return (
    <>
      {moneyTab === "overview" ? (
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {overviewContent}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {activityHeader}
          {activityEmpty}
          {activityEmpty == null ? <View style={styles.cardStack}>{activitySections}</View> : null}
        </ScrollView>
      )}
      <BottomSheet
        onClose={cancelMomentEdit}
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
            onCancel={cancelMomentEdit}
            onSaved={handleMomentSaved}
          />
        ) : null}
      </BottomSheet>
      <BottomSheet
        onClose={cancelTransferEdit}
        title={
          editingTransfer
            ? formatString(strings.activity.transferEditSheetTitleNamed, {
                title: getTransferActivityTitle(editingTransfer)
              })
            : strings.activity.transferEditSheetTitle
        }
        visible={Boolean(editingTransfer)}
      >
        {editingTransfer ? (
          <TransferEditForm
            key={editingTransfer.id}
            onCancel={cancelTransferEdit}
            onSaved={handleTransferSaved}
            transfer={editingTransfer}
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
            if (editingMoment?.id === pendingDeleteMoment.id) {
              setEditingMoment(null);
            }
            setPendingDeleteMoment(null);
          }
        }}
        title={strings.dialogs.activityDeleteTitle}
        visible={Boolean(pendingDeleteMoment)}
      />
      <DeleteConfirmDialog
        body={
          pendingDeleteTransfer
            ? formatString(strings.activity.transferDeleteBody, {
                title: getTransferActivityTitle(pendingDeleteTransfer)
              })
            : ""
        }
        onCancel={() => setPendingDeleteTransfer(null)}
        onConfirm={() => {
          if (pendingDeleteTransfer) {
            void actions.removeTransfer(pendingDeleteTransfer.id);
            if (editingTransfer?.id === pendingDeleteTransfer.id) {
              setEditingTransfer(null);
            }
            setPendingDeleteTransfer(null);
          }
        }}
        title={strings.activity.transferDeleteTitle}
        visible={Boolean(pendingDeleteTransfer)}
      />
    </>
  );
}

export const MoneyScreen = memo(MoneyScreenComponent);