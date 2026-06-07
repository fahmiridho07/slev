import React, { memo, useCallback, useMemo, useState } from "react";
import { SectionList, StyleProp, Text, TextInput, View, ViewStyle } from "react-native";
import {
  BottomSheet,
  DeleteConfirmDialog,
  EmptyState,
  ListActionRow,
  ListActionsOnboardingTip,
  MomentRow,
  ScreenHero
} from "../components";
import { useListActionsHint } from "../hooks/useListActionsHint";
import { formatCompactRupiah } from "../lib/spendingMemoryPatterns";
import { MomentEditForm } from "../features/memory/MomentEditForm";
import { SpendingMoment } from "../features/spendingMemory.types";
import { buildRepeatHints, filterMoments, getMomentTitle, groupMomentsByRecallRange } from "../lib/analysis";
import { AppNavigation } from "../navigation/appNavigation";
import { useActions, useFinanceSelector } from "../state/useFinance";
import { useTheme } from "../hooks/useTheme";

type MemoryMomentItemProps = {
  moment: SpendingMoment;
  onDelete: (moment: SpendingMoment) => void;
  onStartEdit: (moment: SpendingMoment) => void;
  repeatHint?: string;
};

const MemoryMomentItem = memo(function MemoryMomentItem({
  moment,
  onDelete,
  onStartEdit,
  repeatHint
}: MemoryMomentItemProps) {
  return (
    <ListActionRow
      accessibilityLabel={`Edit ${getMomentTitle(moment)}`}
      onDelete={() => onDelete(moment)}
      onPress={() => onStartEdit(moment)}
    >
      <MomentRow moment={moment} repeatHint={repeatHint} />
    </ListActionRow>
  );
});

type MemorySection = {
  data: SpendingMoment[];
  key: string;
  title: string;
};

type MemoryScreenProps = {
  navigation: AppNavigation;
  scrollContentStyle: StyleProp<ViewStyle>;
};

function MemoryScreenComponent({ navigation, scrollContentStyle }: MemoryScreenProps) {
  const { colors, strings, styles } = useTheme();
  const actions = useActions();
  const moments = useFinanceSelector((state) => state.moments);

  const [editingMoment, setEditingMoment] = useState<SpendingMoment | null>(null);
  const [query, setQuery] = useState("");
  const [pendingDeleteMoment, setPendingDeleteMoment] = useState<SpendingMoment | null>(null);
  const { dismiss: dismissListHint, visible: showListHint } = useListActionsHint("memory", moments.length > 0);

  const repeatHints = useMemo(() => buildRepeatHints(moments), [moments]);
  const filteredMoments = useMemo(() => filterMoments(moments, query), [moments, query]);
  const thisMonthCount = useMemo(() => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    return moments.filter((moment) => Date.parse(moment.occurredAt) >= monthStart).length;
  }, [moments]);
  const thisMonthExpense = useMemo(() => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    return moments
      .filter((moment) => moment.type === "expense" && Date.parse(moment.occurredAt) >= monthStart)
      .reduce((sum, moment) => sum + moment.amount, 0);
  }, [moments]);
  const sections = useMemo<MemorySection[]>(
    () =>
      groupMomentsByRecallRange(filteredMoments).map((group) => ({
        key: group.key,
        title: group.label,
        data: group.items
      })),
    [filteredMoments]
  );

  const startEditing = useCallback((moment: SpendingMoment) => {
    setEditingMoment(moment);
  }, []);

  const cancelEdit = useCallback(() => setEditingMoment(null), []);

  const handleSaved = useCallback(() => setEditingMoment(null), []);

  const renderItem = useCallback(
    ({ item, index, section }: { item: SpendingMoment; index: number; section: MemorySection }) => (
      <View
        style={[
          styles.listPanel,
          index > 0 && styles.listPanelContinued,
          index < section.data.length - 1 && styles.listPanelMiddle
        ]}
      >
        <MemoryMomentItem
          moment={item}
          onDelete={setPendingDeleteMoment}
          onStartEdit={startEditing}
          repeatHint={repeatHints.get(item.id)}
        />
      </View>
    ),
    [repeatHints, startEditing]
  );

  const keyExtractor = useCallback((item: SpendingMoment) => item.id, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: MemorySection }) => (
      <View style={styles.memoryGroup}>
        <Text style={styles.groupTitle}>{section.title}</Text>
      </View>
    ),
    []
  );

  const listHeader = useMemo(
    () => (
      <>
        <ScreenHero
          hint={
            moments.length > 0
              ? `${thisMonthCount} moment${thisMonthCount === 1 ? "" : "s"} saved this month`
              : "Saved spending appears here after capture"
          }
          kicker="Spending memory"
          value={thisMonthExpense > 0 ? formatCompactRupiah(thisMonthExpense) : undefined}
          valueTone="danger"
          variant="surface"
        />
        {showListHint && (
          <ListActionsOnboardingTip
            body={strings.listHints.memory.body}
            onDismiss={dismissListHint}
            title={strings.listHints.memory.title}
          />
        )}
        {moments.length > 0 && (
          <TextInput
            accessibilityLabel="Search memories"
            onChangeText={setQuery}
            placeholder="Search label, context, or amount"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={query}
          />
        )}
      </>
    ),
    [dismissListHint, moments.length, query, showListHint, strings.listHints.memory, thisMonthCount, thisMonthExpense]
  );

  const listEmpty = useMemo(() => {
    if (moments.length === 0) {
      return (
        <EmptyState
          actionLabel="Go to Home"
          onAction={navigation.openHome}
          text="No saved spending memory yet."
        />
      );
    }
    if (filteredMoments.length === 0) {
      return <EmptyState text="No memory matches that search." />;
    }
    return null;
  }, [filteredMoments.length, moments.length, navigation.openHome]);

  return (
    <>
      <SectionList
        contentContainerStyle={scrollContentStyle}
        keyboardShouldPersistTaps="handled"
        keyExtractor={keyExtractor}
        ListEmptyComponent={listEmpty}
        ListHeaderComponent={listHeader}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        sections={sections}
        stickySectionHeadersEnabled={false}
      />
      <BottomSheet
        onClose={cancelEdit}
        title={editingMoment ? `Edit ${getMomentTitle(editingMoment)}` : "Edit memory"}
        visible={Boolean(editingMoment)}
      >
        {editingMoment ? (
          <MomentEditForm moment={editingMoment} onCancel={cancelEdit} onSaved={handleSaved} />
        ) : null}
      </BottomSheet>
      <DeleteConfirmDialog
        body={
          pendingDeleteMoment
            ? `${getMomentTitle(pendingDeleteMoment)} will be removed from Memory. Budget and analysis totals will update automatically.`
            : ""
        }
        onCancel={() => setPendingDeleteMoment(null)}
        onConfirm={() => {
          if (pendingDeleteMoment) {
            void actions.removeMoment(pendingDeleteMoment.id);
            setPendingDeleteMoment(null);
          }
        }}
        title="Delete memory?"
        visible={Boolean(pendingDeleteMoment)}
      />
    </>
  );
}

export const MemoryScreen = memo(MemoryScreenComponent);