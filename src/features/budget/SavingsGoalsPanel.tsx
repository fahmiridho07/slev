import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { DeleteConfirmDialog, EmptyState, ListActionRow, ListActionsOnboardingTip } from "../../components";
import { useListActionsHint } from "../../hooks/useListActionsHint";
import { getPercentWidthStyle } from "../../lib/analysis";
import { formatAmountInput } from "../../lib/formatMoney";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { SavingsGoal } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";

export function SavingsGoalsPanel({
  savingsGoals,
  onDeleteGoal,
  onSaveGoal
}: {
  savingsGoals: SavingsGoal[];
  onDeleteGoal: (id: string) => void;
  onSaveGoal: (input: {
    id?: string;
    label: string;
    savedAmount: string;
    targetAmount: string;
  }) => void;
}) {
  const { colors, strings, styles } = useTheme();
  const [editingGoalId, setEditingGoalId] = useState<string | undefined>(undefined);
  const [goalLabel, setGoalLabel] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [pendingDeleteGoal, setPendingDeleteGoal] = useState<SavingsGoal | null>(null);
  const { dismiss: dismissGoalsHint, visible: showGoalsHint } = useListActionsHint("goals", savingsGoals.length > 0);

  function editGoal(goal: SavingsGoal) {
    setEditingGoalId(goal.id);
    setGoalLabel(goal.label);
    setTargetAmount(formatAmountInput(String(goal.targetAmount)));
    setSavedAmount(formatAmountInput(String(goal.savedAmount)));
  }

  function resetDraft() {
    setEditingGoalId(undefined);
    setGoalLabel("");
    setTargetAmount("");
    setSavedAmount("");
  }

  return (
    <View style={styles.analyticsBlock}>
      <View style={styles.capturePanel}>
        <Text style={styles.microLabel}>{editingGoalId ? "Edit savings goal" : "New savings goal"}</Text>
        <TextInput accessibilityLabel="Goal name" onChangeText={setGoalLabel} placeholder="Goal name" placeholderTextColor={colors.muted} style={styles.input} value={goalLabel} />
        <TextInput accessibilityLabel="Target amount" keyboardType="number-pad" onChangeText={(value) => setTargetAmount(formatAmountInput(value))} placeholder="Target amount" placeholderTextColor={colors.muted} style={styles.input} value={targetAmount} />
        <TextInput accessibilityLabel="Saved so far" keyboardType="number-pad" onChangeText={(value) => setSavedAmount(formatAmountInput(value))} placeholder="Saved so far" placeholderTextColor={colors.muted} style={styles.input} value={savedAmount} />
        <View style={styles.editActions}>
          {editingGoalId && (
            <Pressable onPress={resetDraft} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              onSaveGoal({ id: editingGoalId, label: goalLabel, savedAmount, targetAmount });
              resetDraft();
            }}
            style={styles.smallPrimaryButton}
          >
            <Text style={styles.primaryButtonText}>Save</Text>
          </Pressable>
        </View>
      </View>

      {savingsGoals.length === 0 ? (
        <EmptyState text="Savings goals can stay simple: target, current amount, and a small note." />
      ) : (
        <View style={styles.cardGrid}>
          {showGoalsHint && (
            <ListActionsOnboardingTip
              body={strings.listHints.goals.body}
              onDismiss={dismissGoalsHint}
              title={strings.listHints.goals.title}
            />
          )}
          {savingsGoals.map((goal) => {
            const progress = goal.targetAmount > 0 ? goal.savedAmount / goal.targetAmount : 0;
            return (
              <View key={goal.id} style={styles.goalCard}>
                <ListActionRow
                  accessibilityLabel={`Edit goal ${goal.label}`}
                  onDelete={() => setPendingDeleteGoal(goal)}
                  onPress={() => editGoal(goal)}
                >
                  <View style={styles.analyticsRowHeader}>
                    <Text style={styles.analyticsTitle}>{goal.label}</Text>
                    <Text style={styles.analyticsAmount}>{formatRupiah(goal.savedAmount)} / {formatRupiah(goal.targetAmount)}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.trendFill, getPercentWidthStyle(progress)]} />
                  </View>
                </ListActionRow>
              </View>
            );
          })}
        </View>
      )}
      <DeleteConfirmDialog
        body={
          pendingDeleteGoal
            ? `${pendingDeleteGoal.label} will be removed from your goals. This does not change saved memories or balances.`
            : ""
        }
        onCancel={() => setPendingDeleteGoal(null)}
        onConfirm={() => {
          if (pendingDeleteGoal) {
            onDeleteGoal(pendingDeleteGoal.id);
            setPendingDeleteGoal(null);
          }
        }}
        title="Delete goal?"
        visible={Boolean(pendingDeleteGoal)}
      />
    </View>
  );
}
