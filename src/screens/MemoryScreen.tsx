import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { AccountPicker, ContextPicker, DeleteConfirmDialog, EmptyState, MomentRow, SegmentedControl } from "../components";
import { filterMoments, getDefaultMomentAccount, getMomentTitle, getRepeatHint, groupMomentsByRecallRange } from "../lib/analysis";
import { formatAmountInput } from "../lib/formatMoney";
import { EntryType, MoneyAccount, SpendingContext, SpendingMoment } from "../features/spendingMemory.types";
import { colors } from "../theme/colors";
import { styles } from "../theme/styles/app";

export function MemoryScreen({
  accounts,
  categoryLabels,
  moments,
  onDelete,
  onUpdate
}: {
  accounts: MoneyAccount[];
  categoryLabels: SpendingContext[];
  moments: SpendingMoment[];
  onDelete: (id: string) => void;
  onUpdate: (
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
}) {
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
  const grouped = useMemo(() => groupMomentsByRecallRange(filteredMoments), [filteredMoments]);

  function startEditing(moment: SpendingMoment) {
    setEditingId(moment.id);
    setEditAmount(formatAmountInput(String(moment.amount)));
    setEditLabel(moment.label ?? "");
    setEditContext(moment.context);
    setEditNote(moment.note ?? "");
    setEditType(moment.type);
    setEditSource(moment.source ?? "");
    setEditAccountLabel(moment.accountLabel ?? getDefaultMomentAccount(moment.type, accounts));
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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

      {moments.length === 0 ? (
        <EmptyState text="No saved spending memory yet." />
      ) : filteredMoments.length === 0 ? (
        <EmptyState text="No memory matches that search." />
      ) : (
        grouped.map((group) => (
          <View key={group.key} style={styles.memoryGroup}>
            <Text style={styles.groupTitle}>{group.label}</Text>
            <View style={styles.listPanel}>
              {group.items.map((moment) => (
                <View key={moment.id}>
                  <MomentRow moment={moment} repeatHint={getRepeatHint(moment, moments)} />
                  <View style={styles.rowActions}>
                    <Pressable onPress={() => startEditing(moment)} style={styles.textButton}>
                      <Ionicons name="create-outline" size={16} color={colors.greenDark} />
                      <Text style={styles.textButtonLabel}>Edit</Text>
                    </Pressable>
                    <Pressable onPress={() => setPendingDeleteMoment(moment)} style={styles.textButton}>
                      <Ionicons name="trash-outline" size={16} color={colors.coral} />
                      <Text style={[styles.textButtonLabel, styles.deleteText]}>Delete</Text>
                    </Pressable>
                  </View>

                  {editingId === moment.id && (
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
                        <Pressable onPress={() => setEditingId(null)} style={styles.secondaryButton}>
                          <Text style={styles.secondaryButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            onUpdate(moment.id, {
                              amountText: editAmount,
                              label: editLabel,
                              context: editContext,
                              note: editNote,
                              type: editType,
                              source: editSource,
                              accountLabel: editAccountLabel
                            });
                            setEditingId(null);
                          }}
                          style={styles.smallPrimaryButton}
                        >
                          <Text style={styles.primaryButtonText}>Save</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))
      )}
      <DeleteConfirmDialog
        body={
          pendingDeleteMoment
            ? `${getMomentTitle(pendingDeleteMoment)} will be removed from Memory. Budget and analysis totals will update automatically.`
            : ""
        }
        onCancel={() => setPendingDeleteMoment(null)}
        onConfirm={() => {
          if (pendingDeleteMoment) {
            onDelete(pendingDeleteMoment.id);
            setPendingDeleteMoment(null);
          }
        }}
        title="Delete memory?"
        visible={Boolean(pendingDeleteMoment)}
      />
    </ScrollView>
  );
}
