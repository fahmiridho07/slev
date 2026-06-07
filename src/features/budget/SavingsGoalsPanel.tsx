import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { DeleteConfirmDialog, EmptyState, ListActionRow, ListActionsOnboardingTip, ProgressBar } from "../../components";
import { useListActionsHint } from "../../hooks/useListActionsHint";
import { formatString } from "../../i18n";
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
  const { colors, componentStyles, strings, styles } = useTheme();
  const goalsStrings = strings.budget.goals;
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
    <View style={styles.cardStack}>
      <View style={styles.capturePanel}>
        <Text style={componentStyles.microLabel}>{editingGoalId ? goalsStrings.editGoal : goalsStrings.newGoal}</Text>
        <TextInput
          accessibilityLabel={goalsStrings.goalNameA11y}
          onChangeText={setGoalLabel}
          placeholder={goalsStrings.goalNamePlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={goalLabel}
        />
        <TextInput
          accessibilityLabel={goalsStrings.targetAmountA11y}
          keyboardType="number-pad"
          onChangeText={(value) => setTargetAmount(formatAmountInput(value))}
          placeholder={goalsStrings.targetAmountPlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={targetAmount}
        />
        <TextInput
          accessibilityLabel={goalsStrings.savedSoFarA11y}
          keyboardType="number-pad"
          onChangeText={(value) => setSavedAmount(formatAmountInput(value))}
          placeholder={goalsStrings.savedSoFarPlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={savedAmount}
        />
        <View style={componentStyles.editActions}>
          {editingGoalId && (
            <Pressable onPress={resetDraft} style={styles.secondaryButton}>
              <Text style={componentStyles.secondaryButtonText}>{strings.common.cancel}</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              onSaveGoal({ id: editingGoalId, label: goalLabel, savedAmount, targetAmount });
              resetDraft();
            }}
            style={styles.smallPrimaryButton}
          >
            <Text style={styles.primaryButtonText}>{strings.common.save}</Text>
          </Pressable>
        </View>
      </View>

      {savingsGoals.length === 0 ? (
        <EmptyState text={goalsStrings.emptyGoals} />
      ) : (
        <View style={styles.cardStack}>
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
                  accessibilityLabel={formatString(goalsStrings.editGoalA11y, { label: goal.label })}
                  onDelete={() => setPendingDeleteGoal(goal)}
                  onPress={() => editGoal(goal)}
                >
                  <View style={styles.analyticsRowHeader}>
                    <Text style={componentStyles.analyticsTitle}>{goal.label}</Text>
                    <Text style={styles.analyticsAmount}>{formatRupiah(goal.savedAmount)} / {formatRupiah(goal.targetAmount)}</Text>
                  </View>
                  <ProgressBar
                    accessibilityLabel={formatString(strings.common.progressA11y, {
                      label: goal.label,
                      percent: Math.round(progress * 100)
                    })}
                    fillStyle={[styles.trendFill, getPercentWidthStyle(progress)]}
                    value={progress}
                  />
                </ListActionRow>
              </View>
            );
          })}
        </View>
      )}
      <DeleteConfirmDialog
        body={
          pendingDeleteGoal
            ? formatString(goalsStrings.deleteGoalBody, { label: pendingDeleteGoal.label })
            : ""
        }
        onCancel={() => setPendingDeleteGoal(null)}
        onConfirm={() => {
          if (pendingDeleteGoal) {
            onDeleteGoal(pendingDeleteGoal.id);
            setPendingDeleteGoal(null);
          }
        }}
        title={goalsStrings.deleteGoalTitle}
        visible={Boolean(pendingDeleteGoal)}
      />
    </View>
  );
}