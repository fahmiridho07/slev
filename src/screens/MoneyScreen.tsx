import React, { memo, useCallback, useMemo, useState } from "react";
import { SectionList, StyleProp, Text, TextInput, View, ViewStyle } from "react-native";
import {
  BottomSheet,
  DeleteConfirmDialog,
  EmptyState,
  ListActionRow,
  ListActionsOnboardingTip,
  MomentRow,
  SectionHeader
} from "../components";
import { ExpenseCategorySummary } from "../features/analysis/ExpenseCategorySummary";
import { IncomeSourcesAccordion } from "../features/analysis/IncomeSourcesAccordion";
import { MonthSummaryCard } from "../features/analysis/MonthSummaryCard";
import { useListActionsHint } from "../hooks/useListActionsHint";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
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
import { useActions, useFinanceSelector } from "../state/useFinance";
import { useTheme } from "../hooks/useTheme";

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
  const [breakdownMonthOffset, setBreakdownMonthOffset] = useState(0);
  const [editingMoment, setEditingMoment] = useState<SpendingMoment | null>(null);
  const [query, setQuery] = useState("");
  const [pendingDeleteMoment, setPendingDeleteMoment] = useState<SpendingMoment | null>(null);

  const moments = useFinanceSelector((state) => state.moments);
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

  const startEditing = useCallback((moment: SpendingMoment) => {
    hapticSelection();
    setEditingMoment(moment);
  }, []);

  const cancelEdit = useCallback(() => setEditingMoment(null), []);
  const handleSaved = useCallback(() => setEditingMoment(null), []);

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

  const summarySection = useMemo(
    () => (
      <View style={styles.cardStack}>
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
        <IncomeSourcesAccordion moments={moments} monthOffset={breakdownMonthOffset} />
      </View>
    ),
    [breakdownMonthOffset, breakdownReferenceDate, earliestMonthOffset, moments, styles.cardStack]
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.cardStack}>
        {summarySection}
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
      colors.muted,
      dismissListHint,
      moments.length,
      query,
      showListHint,
      strings.activity,
      strings.listHints.memory,
      styles.cardStack,
      styles.input,
      summarySection
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
        keyboardDismissMode="on-drag"
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