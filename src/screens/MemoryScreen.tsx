import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useMemo, useState } from "react";
import { Pressable, SectionList, Text, TextInput, View } from "react-native";
import { AccountPicker, ContextPicker, DeleteConfirmDialog, EmptyState, MomentRow, SegmentedControl } from "../components";
import { EntryType, SpendingContext, SpendingMoment } from "../features/spendingMemory.types";
import { filterMoments, getDefaultMomentAccount, getMomentTitle, getRepeatHint, groupMomentsByRecallRange } from "../lib/analysis";
import { formatAmountInput } from "../lib/formatMoney";
import { useFinance } from "../state/useFinance";
import { colors } from "../theme/colors";
import { styles } from "../theme/styles/app";

type MemoryMomentItemProps = {
  accounts: ReturnType<typeof useFinance>["state"]["accounts"];
  categoryLabels: SpendingContext[];
  editingId: string | null;
  moment: SpendingMoment;
  moments: SpendingMoment[];
  onCancelEdit: () => void;
  onDelete: (moment: SpendingMoment) => void;
  onSaveEdit: (
    id: string,
    input: {
      amountText: string;
      label: string;
      context: SpendingContext;
      note: string;
      type: EntryType;
      source: string;
      accountLabel: string;
    }
  ) => void;
  onStartEdit: (moment: SpendingMoment) => void;
  editAccountLabel: string;
  editAmount: string;
  editContext: SpendingContext;
  editLabel: string;
  editNote: string;
  editSource: string;
  editType: EntryType;
  setEditAccountLabel: (value: string) => void;
  setEditAmount: (value: string) => void;
  setEditContext: (value: SpendingContext) => void;
  setEditLabel: (value: string) => void;
  setEditNote: (value: string) => void;
  setEditSource: (value: string) => void;
  setEditType: (value: EntryType) => void;
};

const MemoryMomentItem = memo(function MemoryMomentItem({
  accounts,
  categoryLabels,
  editingId,
  moment,
  moments,
  onCancelEdit,
  onDelete,
  onSaveEdit,
  onStartEdit,
  editAccountLabel,
  editAmount,
  editContext,
  editLabel,
  editNote,
  editSource,
  editType,
  setEditAccountLabel,
  setEditAmount,
  setEditContext,
  setEditLabel,
  setEditNote,
  setEditSource,
  setEditType
}: MemoryMomentItemProps) {
  const isEditing = editingId === moment.id;

  return (
    <View>
      <MomentRow moment={moment} repeatHint={getRepeatHint(moment, moments)} />
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

      {isEditing && (
        <View style={styles.editPanel}>
          <TextInput
            keyboardType="number-pad"
            onChangeText={(value) => setEditAmount(formatAmountInput(value))}
            placeholder="Amount"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={editAmount}
          />
          <TextInput
            onChangeText={editType === "income" ? setEditSource : setEditLabel}
            placeholder={editType === "income" ? "Source" : "Label"}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={editType === "income" ? editSource : editLabel}
          />
          <SegmentedControl
            compact
            options={[
              { label: "Expense", value: "expense" },
              { label: "Income", value: "income" }
            ]}
            selected={editType}
            onSelect={setEditType}
          />
          {editType === "expense" && (
            <ContextPicker categories={categoryLabels} selected={editContext} onSelect={setEditContext} compact />
          )}
          <AccountPicker
            accounts={accounts}
            label={editType === "income" ? "Received in" : "Paid from"}
            selected={editAccountLabel}
            onSelect={setEditAccountLabel}
          />
          <TextInput
            multiline
            onChangeText={setEditNote}
            placeholder="Note"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.noteInput]}
            value={editNote}
          />
          <View style={styles.editActions}>
            <Pressable onPress={onCancelEdit} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onSaveEdit(moment.id, {
                  amountText: editAmount,
                  label: editLabel,
                  context: editContext,
                  note: editNote,
                  type: editType,
                  source: editSource,
                  accountLabel: editAccountLabel
                });
              }}
              style={styles.smallPrimaryButton}
            >
              <Text style={styles.primaryButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
});

type MemorySection = {
  data: SpendingMoment[];
  key: string;
  title: string;
};

function MemoryScreenComponent() {
  const { actions, derived, state } = useFinance();
  const { accounts, moments } = state;
  const { categoryLabels } = derived;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editContext, setEditContext] = useState<SpendingContext>("Other");
  const [editNote, setEditNote] = useState("");
  const [editType, setEditType] = useState<EntryType>("expense");
  const [editSource, setEditSource] = useState("");
  const [editAccountLabel, setEditAccountLabel] = useState("");
  const [query, setQuery] = useState("");
  const [pendingDeleteMoment, setPendingDeleteMoment] = useState<SpendingMoment | null>(null);

  const filteredMoments = useMemo(() => filterMoments(moments, query), [moments, query]);
  const sections = useMemo<MemorySection[]>(
    () =>
      groupMomentsByRecallRange(filteredMoments).map((group) => ({
        key: group.key,
        title: group.label,
        data: group.items
      })),
    [filteredMoments]
  );

  const startEditing = useCallback(
    (moment: SpendingMoment) => {
      setEditingId(moment.id);
      setEditAmount(formatAmountInput(String(moment.amount)));
      setEditLabel(moment.label ?? "");
      setEditContext(moment.context);
      setEditNote(moment.note ?? "");
      setEditType(moment.type);
      setEditSource(moment.source ?? "");
      setEditAccountLabel(moment.accountLabel ?? getDefaultMomentAccount(moment.type, accounts));
    },
    [accounts]
  );

  const cancelEdit = useCallback(() => setEditingId(null), []);

  const saveEdit = useCallback(
    (
      id: string,
      input: {
        amountText: string;
        label: string;
        context: SpendingContext;
        note: string;
        type: EntryType;
        source: string;
        accountLabel: string;
      }
    ) => {
      void actions.updateMoment(id, input);
      setEditingId(null);
    },
    [actions]
  );

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
          accounts={accounts}
          categoryLabels={categoryLabels}
          editingId={editingId}
          moment={item}
          moments={moments}
          onCancelEdit={cancelEdit}
          onDelete={setPendingDeleteMoment}
          onSaveEdit={saveEdit}
          onStartEdit={startEditing}
          editAccountLabel={editAccountLabel}
          editAmount={editAmount}
          editContext={editContext}
          editLabel={editLabel}
          editNote={editNote}
          editSource={editSource}
          editType={editType}
          setEditAccountLabel={setEditAccountLabel}
          setEditAmount={setEditAmount}
          setEditContext={setEditContext}
          setEditLabel={setEditLabel}
          setEditNote={setEditNote}
          setEditSource={setEditSource}
          setEditType={setEditType}
        />
      </View>
    ),
    [
      accounts,
      cancelEdit,
      categoryLabels,
      editAccountLabel,
      editAmount,
      editContext,
      editLabel,
      editNote,
      editSource,
      editType,
      editingId,
      moments,
      saveEdit,
      startEditing
    ]
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
        <View style={styles.heroPanel}>
          <Text style={styles.kickerDark}>Memory</Text>
          <Text style={styles.heroTitle}>A quiet list of where money went.</Text>
        </View>
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
    [moments.length, query]
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