import React, { memo, useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { AccountPicker, ContextPicker, SegmentedControl } from "../../components";
import { EntryType, MoneyAccount, SpendingContext, SpendingMoment } from "../spendingMemory.types";
import { getDefaultMomentAccount } from "../../lib/analysis";
import { formatAmountInput } from "../../lib/formatMoney";
import { hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useActions, useFinanceDerived, useFinanceSelector } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";
import { MemoryFieldError } from "./memoryValidation";

type MomentEditFormProps = {
  moment: SpendingMoment;
  onCancel: () => void;
  onSaved: () => void;
};

function buildEditForm(moment: SpendingMoment, accounts: MoneyAccount[]) {
  return {
    amountText: formatAmountInput(String(moment.amount)),
    label: moment.label ?? "",
    context: moment.context,
    note: moment.note ?? "",
    type: moment.type,
    source: moment.source ?? "",
    accountLabel: moment.accountLabel ?? getDefaultMomentAccount(moment.type, accounts)
  };
}

function MomentEditFormComponent({ moment, onCancel, onSaved }: MomentEditFormProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const actions = useActions();
  const categoryLabels = useFinanceDerived((derived) => derived.categoryLabels);
  const accounts = useFinanceSelector((state) => state.accounts);
  const initial = buildEditForm(moment, accounts);

  const [amountText, setAmountText] = useState(initial.amountText);
  const [label, setLabel] = useState(initial.label);
  const [context, setContext] = useState<SpendingContext>(initial.context);
  const [note, setNote] = useState(initial.note);
  const [type, setType] = useState<EntryType>(initial.type);
  const [source, setSource] = useState(initial.source);
  const [accountLabel, setAccountLabel] = useState(initial.accountLabel);
  const [fieldError, setFieldError] = useState<FormValidationError<MemoryFieldError> | null>(null);

  const handleTypeChange = useCallback((nextType: EntryType) => {
    if (nextType === type) {
      return;
    }
    if (nextType === "income") {
      setSource((current) => current.trim() || label.trim());
      setLabel("");
    } else {
      setLabel((current) => current.trim() || source.trim());
      setSource("");
    }
    setType(nextType);
    setFieldError((current) => (current?.field === "label" ? null : current));
  }, [label, source, type]);

  const save = useCallback(async () => {
    const result = await actions.updateMoment(moment.id, {
      amountText,
      label,
      context,
      note,
      type,
      source,
      accountLabel
    });
    if (!result?.ok) {
      hapticWarning();
      if (result?.validation) {
        setFieldError(result.validation);
      }
      return;
    }
    setFieldError(null);
    onSaved();
  }, [accountLabel, actions, amountText, context, label, moment.id, note, onSaved, source, type]);

  return (
    <View style={componentStyles.sheetForm}>
      <ScrollView
        contentContainerStyle={styles.repeatBlock}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={componentStyles.sheetScroll}
      >
        <TextInput
          keyboardType="number-pad"
          onChangeText={(value) => {
            setFieldError((current) => (current?.field === "amount" ? null : current));
            setAmountText(formatAmountInput(value));
          }}
          accessibilityLabel={
            fieldError?.field === "amount"
              ? `${strings.activity.edit.amount}. ${fieldError.message}`
              : strings.activity.edit.amount
          }
          placeholder={strings.activity.edit.amount}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={amountText}
        />
        {fieldError?.field === "amount" && (
          <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
            {fieldError.message}
          </Text>
        )}
        <TextInput
          onChangeText={(value) => {
            setFieldError((current) => (current?.field === "label" ? null : current));
            if (type === "income") {
              setSource(value);
            } else {
              setLabel(value);
            }
          }}
          accessibilityLabel={
            fieldError?.field === "label"
              ? `${type === "income" ? strings.activity.edit.source : strings.activity.edit.label}. ${fieldError.message}`
              : type === "income"
                ? strings.activity.edit.source
                : strings.activity.edit.label
          }
          placeholder={type === "income" ? strings.activity.edit.source : strings.activity.edit.label}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={type === "income" ? source : label}
        />
        {fieldError?.field === "label" && (
          <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
            {fieldError.message}
          </Text>
        )}
        <SegmentedControl
          compact
          options={[
            { label: strings.common.expense, value: "expense" },
            { label: strings.common.income, value: "income" }
          ]}
          selected={type}
          onSelect={handleTypeChange}
        />
        {type === "expense" && (
          <ContextPicker categories={categoryLabels} selected={context} onSelect={setContext} compact />
        )}
        <AccountPicker
          accounts={accounts}
          label={type === "income" ? strings.activity.edit.receivedIn : strings.activity.edit.paidFrom}
          selected={accountLabel}
          onSelect={setAccountLabel}
        />
        <TextInput
          multiline
          onChangeText={setNote}
          accessibilityLabel={strings.activity.edit.note}
          placeholder={strings.activity.edit.note}
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.noteInput]}
          value={note}
        />
      </ScrollView>
      <View style={componentStyles.sheetFooter}>
        <View style={componentStyles.editActions}>
          <Pressable
            accessibilityLabel={strings.common.cancel}
            accessibilityRole="button"
            onPress={onCancel}
            style={styles.secondaryButton}
          >
            <Text style={componentStyles.secondaryButtonText}>{strings.common.cancel}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={strings.activity.edit.save}
            accessibilityRole="button"
            onPress={() => void save()}
            style={styles.smallPrimaryButton}
          >
            <Text style={styles.primaryButtonText}>{strings.activity.edit.save}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const MomentEditForm = memo(MomentEditFormComponent);