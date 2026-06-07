import React, { memo, useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SegmentedControl } from "../../components";
import { formatString } from "../../i18n";
import { formatAmountInput } from "../../lib/formatMoney";
import { hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useActions } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";
import { BudgetLimit, BudgetPeriod, SpendingContext } from "../spendingMemory.types";
import { LimitFieldError } from "./budgetValidation";

type LimitEditFormProps = {
  category: SpendingContext;
  limit: BudgetLimit | undefined;
  onCancel: () => void;
  onSaved: () => void;
};

function LimitEditFormComponent({ category, limit, onCancel, onSaved }: LimitEditFormProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const limitsStrings = strings.budget.limits;
  const actions = useActions();
  const [draftAmount, setDraftAmount] = useState(limit ? formatAmountInput(String(limit.limitAmount)) : "");
  const [draftPeriod, setDraftPeriod] = useState<BudgetPeriod>(limit?.period ?? "weekly");
  const [fieldError, setFieldError] = useState<FormValidationError<LimitFieldError> | null>(null);

  const save = useCallback(async () => {
    const result = await actions.saveCategoryBudget(category, draftAmount, draftPeriod);
    if (!result.ok) {
      hapticWarning();
      if (result.validation) {
        setFieldError(result.validation);
      }
      return;
    }
    setFieldError(null);
    onSaved();
  }, [actions, category, draftAmount, draftPeriod, onSaved]);

  const removeLimit = useCallback(async () => {
    await actions.removeCategoryBudget(category);
    onSaved();
  }, [actions, category, onSaved]);

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
            fieldError?.field === "amount"
              ? `${formatString(limitsStrings.limitAmountA11y, { category })}. ${fieldError.message}`
              : formatString(limitsStrings.limitAmountA11y, { category })
          }
          keyboardType="number-pad"
          onChangeText={(value) => {
            setFieldError((current) => (current?.field === "amount" ? null : current));
            setDraftAmount(formatAmountInput(value));
          }}
          placeholder={limitsStrings.limitAmountPlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={draftAmount}
        />
        {fieldError?.field === "amount" && (
          <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
            {fieldError.message}
          </Text>
        )}
        <SegmentedControl
          compact
          options={[
            { label: limitsStrings.weekly, value: "weekly" },
            { label: limitsStrings.monthly, value: "monthly" }
          ]}
          selected={draftPeriod}
          onSelect={setDraftPeriod}
        />
      </ScrollView>
      <View style={componentStyles.sheetFooter}>
        <View style={componentStyles.editActions}>
          {limit && (
            <Pressable accessibilityLabel={limitsStrings.deleteLimit} accessibilityRole="button" onPress={() => void removeLimit()} style={styles.secondaryButton}>
              <Text style={componentStyles.deleteText}>{limitsStrings.deleteLimit}</Text>
            </Pressable>
          )}
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

export const LimitEditForm = memo(LimitEditFormComponent);