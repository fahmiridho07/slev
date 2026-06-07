import React, { memo, useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { AccountPicker, ContextPicker, SegmentedControl } from "../../components";
import { EntryType, MoneyAccount, SpendingContext, SpendingMoment } from "../spendingMemory.types";
import { getDefaultMomentAccount } from "../../lib/analysis";
import { formatAmountInput } from "../../lib/formatMoney";
import { hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useActions, useDerived, useFinanceSelector } from "../../state/useFinance";
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
  const { categoryLabels } = useDerived();
  const accounts = useFinanceSelector((state) => state.accounts);

  const [amountText, setAmountText] = useState(() => buildEditForm(moment, accounts).amountText);
  const [label, setLabel] = useState(() => buildEditForm(moment, accounts).label);
  const [context, setContext] = useState<SpendingContext>(() => buildEditForm(moment, accounts).context);
  const [note, setNote] = useState(() => buildEditForm(moment, accounts).note);
  const [type, setType] = useState<EntryType>(() => buildEditForm(moment, accounts).type);
  const [source, setSource] = useState(() => buildEditForm(moment, accounts).source);
  const [accountLabel, setAccountLabel] = useState(() => buildEditForm(moment, accounts).accountLabel);
  const [fieldError, setFieldError] = useState<FormValidationError<MemoryFieldError> | null>(null);

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
              ? `${strings.memory.edit.amount}. ${fieldError.message}`
              : strings.memory.edit.amount
          }
          placeholder={strings.memory.edit.amount}
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
          onChangeText={type === "income" ? setSource : setLabel}
          accessibilityLabel={type === "income" ? strings.memory.edit.source : strings.memory.edit.label}
          placeholder={type === "income" ? strings.memory.edit.source : strings.memory.edit.label}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={type === "income" ? source : label}
        />
        <SegmentedControl
          compact
          options={[
            { label: strings.common.expense, value: "expense" },
            { label: strings.common.income, value: "income" }
          ]}
          selected={type}
          onSelect={setType}
        />
        {type === "expense" && (
          <ContextPicker categories={categoryLabels} selected={context} onSelect={setContext} compact />
        )}
        <AccountPicker
          accounts={accounts}
          label={type === "income" ? strings.memory.edit.receivedIn : strings.memory.edit.paidFrom}
          selected={accountLabel}
          onSelect={setAccountLabel}
        />
        <TextInput
          multiline
          onChangeText={setNote}
          accessibilityLabel={strings.memory.edit.note}
          placeholder={strings.memory.edit.note}
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.noteInput]}
          value={note}
        />
      </ScrollView>
      <View style={componentStyles.sheetFooter}>
        <View style={componentStyles.editActions}>
          <Pressable accessibilityRole="button" onPress={onCancel} style={styles.secondaryButton}>
            <Text style={componentStyles.secondaryButtonText}>{strings.common.cancel}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={strings.memory.edit.save}
            accessibilityRole="button"
            onPress={() => void save()}
            style={styles.smallPrimaryButton}
          >
            <Text style={styles.primaryButtonText}>{strings.memory.edit.save}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const MomentEditForm = memo(MomentEditFormComponent);