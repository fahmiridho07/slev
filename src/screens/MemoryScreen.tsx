import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useMemo, useState } from "react";
import { Pressable, SectionList, Text, TextInput, View } from "react-native";
import { DeleteConfirmDialog, EmptyState, MomentRow, ScreenHero } from "../components";
import { formatCompactRupiah } from "../lib/spendingMemoryPatterns";
import { MomentEditForm } from "../features/memory/MomentEditForm";
import { SpendingMoment } from "../features/spendingMemory.types";
import { buildRepeatHints, filterMoments, getMomentTitle, groupMomentsByRecallRange } from "../lib/analysis";
import { useActions, useFinanceSelector } from "../state/useFinance";
import { colors } from "../theme/colors";
import { styles } from "../theme/styles/app";

type MemoryMomentItemProps = {
  isEditing: boolean;
  moment: SpendingMoment;
  onCancelEdit: () => void;
  onDelete: (moment: SpendingMoment) => void;
  onSaved: () => void;
  onStartEdit: (moment: SpendingMoment) => void;
  repeatHint?: string;
};

const MemoryMomentItem = memo(function MemoryMomentItem({
  isEditing,
  moment,
  onCancelEdit,
  onDelete,
  onSaved,
  onStartEdit,
  repeatHint
}: MemoryMomentItemProps) {
  return (
    <View>
      <MomentRow moment={moment} repeatHint={repeatHint} />
      <View style={styles.rowActions}>
        <Pressable onPress={() => onStartEdit(moment)} style={styles.textButton}>
          <Ionicons name="create-outline" size={16} color={colors.greenDark} />
          <Text style={styles.textButtonLabel}>Edit</Text>
        </Pressable>
        <Pressable onPress={() => onDelete(moment)} style={styles.textButton}>
          <Ionicons name="trash-outline" size={16} color={colors.coral} />
          <Text style={[styles.textButtonLabel, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>

      {isEditing && <MomentEditForm moment={moment} onCancel={onCancelEdit} onSaved={onSaved} />}
    </View>
  );
});

type MemorySection = {
  data: SpendingMoment[];
  key: string;
  title: string;
};

function MemoryScreenComponent() {
  const actions = useActions();
  const moments = useFinanceSelector((state) => state.moments);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [pendingDeleteMoment, setPendingDeleteMoment] = useState<SpendingMoment | null>(null);

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
    setEditingId(moment.id);
  }, []);

  const cancelEdit = useCallback(() => setEditingId(null), []);

  const handleSaved = useCallback(() => setEditingId(null), []);

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
          isEditing={editingId === item.id}
          moment={item}
          onCancelEdit={cancelEdit}
          onDelete={setPendingDeleteMoment}
          onSaved={handleSaved}
          onStartEdit={startEditing}
          repeatHint={repeatHints.get(item.id)}
        />
      </View>
    ),
    [cancelEdit, editingId, handleSaved, repeatHints, startEditing]
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
          hint={`${thisMonthCount} moment${thisMonthCount === 1 ? "" : "s"} saved this month`}
          kicker="Spending memory"
          value={thisMonthExpense > 0 ? formatCompactRupiah(thisMonthExpense) : undefined}
          valueTone="danger"
        />
        {moments.length > 0 && (
          <TextInput
            onChangeText={setQuery}
            placeholder="Search label, context, or amount"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={query}
          />
        )}
      </>
    ),
    [moments.length, query, thisMonthCount, thisMonthExpense]
  );

  const listEmpty = useMemo(() => {
    if (moments.length === 0) {
      return <EmptyState text="No saved spending memory yet." />;
    }
    if (filteredMoments.length === 0) {
      return <EmptyState text="No memory matches that search." />;
    }
    return null;
  }, [filteredMoments.length, moments.length]);

  return (
    <>
      <SectionList
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyExtractor={keyExtractor}
        ListEmptyComponent={listEmpty}
        ListHeaderComponent={listHeader}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        sections={sections}
        stickySectionHeadersEnabled={false}
      />
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