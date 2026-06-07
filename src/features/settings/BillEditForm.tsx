import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { AccountPicker, ContextPicker } from "../../components";
import { formatAmountInput } from "../../lib/formatMoney";
import { hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useActions, useFinanceDerived, useFinanceSelector } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";
import { RecurringBill, SpendingContext } from "../spendingMemory.types";
import { BillFieldError } from "./settingsValidation";

type BillEditFormProps = {
  bill: RecurringBill;
  onCancel: () => void;
  onSaved: () => void;
};

function BillEditFormComponent({ bill, onCancel, onSaved }: BillEditFormProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const actions = useActions();
  const categoryLabels = useFinanceDerived((derived) => derived.categoryLabels);
  const accounts = useFinanceSelector((state) => state.accounts);
  const [label, setLabel] = useState(bill.label);
  const [amount, setAmount] = useState(formatAmountInput(String(bill.amount)));
  const [context, setContext] = useState<SpendingContext>(bill.context);
  const [accountLabel, setAccountLabel] = useState(bill.accountLabel ?? accounts[0]?.label ?? "");
  const [dayOfMonth, setDayOfMonth] = useState(String(bill.dayOfMonth));
  const [active, setActive] = useState(bill.active);
  const [fieldError, setFieldError] = useState<FormValidationError<BillFieldError> | null>(null);

  const clearFieldError = useCallback((field?: BillFieldError) => {
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
    const result = await actions.saveRecurringBill({
      id: bill.id,
      label,
      amount,
      context,
      accountLabel: accountLabel || undefined,
      dayOfMonth,
      active
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
  }, [accountLabel, actions, active, amount, bill.id, context, dayOfMonth, label, onSaved]);

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
              ? `${strings.settings.bills.nameA11y}. ${fieldError.message}`
              : strings.settings.bills.nameA11y
          }
          onChangeText={(value) => {
            clearFieldError("label");
            setLabel(value);
          }}
          placeholder={strings.settings.bills.namePlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={label}
        />
        {fieldError?.field === "label" && (
          <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
            {fieldError.message}
          </Text>
        )}
        <TextInput
          accessibilityLabel={
            fieldError?.field === "amount"
              ? `${strings.settings.bills.amountA11y}. ${fieldError.message}`
              : strings.settings.bills.amountA11y
          }
          keyboardType="number-pad"
          onChangeText={(value) => {
            clearFieldError("amount");
            setAmount(formatAmountInput(value));
          }}
          placeholder={strings.settings.bills.amount}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={amount}
        />
        {fieldError?.field === "amount" && (
          <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
            {fieldError.message}
          </Text>
        )}
        {categoryLabels.length > 0 && (
          <ContextPicker categories={categoryLabels} onSelect={setContext} selected={context} />
        )}
        {accounts.length > 0 && (
          <AccountPicker accounts={accounts} label={strings.common.account} onSelect={setAccountLabel} selected={accountLabel} />
        )}
        <TextInput
          accessibilityLabel={
            fieldError?.field === "dayOfMonth"
              ? `${strings.settings.bills.dayPlaceholder}. ${fieldError.message}`
              : strings.settings.bills.dayPlaceholder
          }
          keyboardType="number-pad"
          onChangeText={(value) => {
            clearFieldError("dayOfMonth");
            setDayOfMonth(value);
          }}
          placeholder={strings.settings.bills.dayPlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={dayOfMonth}
        />
        {fieldError?.field === "dayOfMonth" && (
          <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
            {fieldError.message}
          </Text>
        )}
        <Pressable
          accessibilityLabel={active ? strings.settings.bills.active : strings.settings.bills.paused}
          accessibilityRole="button"
          onPress={() => setActive((current) => !current)}
          style={styles.secondaryInlineButton}
        >
          <Ionicons name={active ? "checkmark-circle-outline" : "ellipse-outline"} size={16} color={colors.greenDark} />
          <Text style={componentStyles.secondaryButtonText}>
            {active ? strings.settings.bills.active : strings.settings.bills.paused}
          </Text>
        </Pressable>
      </ScrollView>
      <View style={componentStyles.sheetFooter}>
        <View style={componentStyles.editActions}>
          <Pressable accessibilityLabel={strings.common.cancel} accessibilityRole="button" onPress={onCancel} style={styles.secondaryButton}>
            <Text style={componentStyles.secondaryButtonText}>{strings.common.cancel}</Text>
          </Pressable>
          <Pressable accessibilityLabel={strings.settings.bills.save} accessibilityRole="button" onPress={() => void save()} style={styles.smallPrimaryButton}>
            <Text style={styles.primaryButtonText}>{strings.settings.bills.save}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const BillEditForm = memo(BillEditFormComponent);