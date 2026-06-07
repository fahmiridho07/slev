import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { DeleteConfirmDialog, EmptyState, ListActionRow, ListActionsOnboardingTip, ProgressBar } from "../../components";
import { useListActionsHint } from "../../hooks/useListActionsHint";
import { formatString } from "../../i18n";
import { getPercentWidthStyle } from "../../lib/analysis";
import { formatAmountInput } from "../../lib/formatMoney";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { SavingsGoal } from "../spendingMemory.types";
import { hapticSelection, hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useTheme } from "../../hooks/useTheme";
import { GoalFieldError } from "./budgetValidation";

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
  }) => Promise<{ ok: boolean; validation?: FormValidationError<GoalFieldError> }>;
}) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const goalsStrings = strings.budget.goals;
  const [editingGoalId, setEditingGoalId] = useState<string | undefined>(undefined);
  const [goalLabel, setGoalLabel] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [pendingDeleteGoal, setPendingDeleteGoal] = useState<SavingsGoal | null>(null);
  const [fieldError, setFieldError] = useState<FormValidationError<GoalFieldError> | null>(null);
  const { dismiss: dismissGoalsHint, visible: showGoalsHint } = useListActionsHint("goals", savingsGoals.length > 0);

  function editGoal(goal: SavingsGoal) {
    hapticSelection();
    setEditingGoalId(goal.id);
    setGoalLabel(goal.label);
    setTargetAmount(formatAmountInput(String(goal.targetAmount)));
    setSavedAmount(formatAmountInput(String(goal.savedAmount)));
    setFieldError(null);
  }

  function resetDraft() {
    setEditingGoalId(undefined);
    setGoalLabel("");
    setTargetAmount("");
    setSavedAmount("");
    setFieldError(null);
  }

  function clearFieldError(field?: GoalFieldError) {
    setFieldError((current) => {
      if (!current) {
        return current;
      }
      if (!field || current.field === field) {
        return null;
      }
      return current;
    });
  }

  return (
    <View style={styles.cardStack}>
      <View style={styles.capturePanel}>
        <Text style={componentStyles.microLabel}>{editingGoalId ? goalsStrings.editGoal : goalsStrings.newGoal}</Text>
        <TextInput
          accessibilityLabel={
            fieldError?.field === "label"
              ? `${goalsStrings.goalNameA11y}. ${fieldError.message}`
              : goalsStrings.goalNameA11y
          }
          onChangeText={(value) => {
            clearFieldError("label");
            setGoalLabel(value);
          }}
          placeholder={goalsStrings.goalNamePlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={goalLabel}
        />
        {fieldError?.field === "label" && (
          <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
            {fieldError.message}
          </Text>
        )}
        <TextInput
          accessibilityLabel={
            fieldError?.field === "targetAmount"
              ? `${goalsStrings.targetAmountA11y}. ${fieldError.message}`
              : goalsStrings.targetAmountA11y
          }
          keyboardType="number-pad"
          onChangeText={(value) => {
            clearFieldError("targetAmount");
            setTargetAmount(formatAmountInput(value));
          }}
          placeholder={goalsStrings.targetAmountPlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={targetAmount}
        />
        {fieldError?.field === "targetAmount" && (
          <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
            {fieldError.message}
          </Text>
        )}
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
              void (async () => {
                const result = await onSaveGoal({
                  id: editingGoalId,
                  label: goalLabel,
                  savedAmount,
                  targetAmount
                });
                if (!result.ok) {
                  hapticWarning();
                  if (result.validation) {
                    setFieldError(result.validation);
                  }
                  return;
                }
                resetDraft();
              })();
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