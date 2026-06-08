import React, { memo, useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { formatAmountInput } from "../../lib/formatMoney";
import { hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useActions } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";
import { SavingsGoal } from "../spendingMemory.types";

type GoalFieldError = "label" | "targetAmount";

type GoalEditFormProps = {
  goal: SavingsGoal;
  onCancel: () => void;
  onSaved: () => void;
};

function GoalEditFormComponent({ goal, onCancel, onSaved }: GoalEditFormProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const goalsStrings = strings.budget.goals;
  const actions = useActions();
  const [goalLabel, setGoalLabel] = useState(goal.label);
  const [targetAmount, setTargetAmount] = useState(formatAmountInput(String(goal.targetAmount)));
  const [savedAmount, setSavedAmount] = useState(formatAmountInput(String(goal.savedAmount)));
  const [fieldError, setFieldError] = useState<FormValidationError<GoalFieldError> | null>(null);

  const clearFieldError = useCallback((field?: GoalFieldError) => {
    setFieldError((current) => {
      if (!current) {
        return current;
      }
      if (!field || current.field === field) {
        return null;
      }
      return current;
    });
  }, []);

  const save = useCallback(async () => {
    const result = await actions.saveGoal({
      id: goal.id,
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
    setFieldError(null);
    onSaved();
  }, [actions, goal.id, goalLabel, onSaved, savedAmount, targetAmount]);

  return (
    <View style={componentStyles.sheetForm}>
      <ScrollView
        contentContainerStyle={styles.repeatBlock}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={componentStyles.sheetScroll}
      >
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
      </ScrollView>
      <View style={componentStyles.sheetFooter}>
        <View style={componentStyles.editActions}>
          <Pressable accessibilityLabel={strings.common.cancel} accessibilityRole="button" onPress={onCancel} style={styles.secondaryButton}>
            <Text style={componentStyles.secondaryButtonText}>{strings.common.cancel}</Text>
          </Pressable>
          <Pressable accessibilityLabel={strings.common.save} accessibilityRole="button" onPress={() => void save()} style={styles.smallPrimaryButton}>
            <Text style={styles.primaryButtonText}>{strings.common.save}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const GoalEditForm = memo(GoalEditFormComponent);