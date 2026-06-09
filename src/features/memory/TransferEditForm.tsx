import React, { memo, useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { AccountPicker } from "../../components";
import { MoneyTransfer } from "../spendingMemory.types";
import { formatAmountInput } from "../../lib/formatMoney";
import { hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useActions, useFinanceSelector } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";

type TransferFieldError = "amount" | "transferAccounts";

type TransferEditFormProps = {
  onCancel: () => void;
  onSaved: () => void;
  transfer: MoneyTransfer;
};

function buildEditForm(transfer: MoneyTransfer) {
  return {
    amountText: formatAmountInput(String(transfer.amount)),
    fromAccount: transfer.fromAccount,
    note: transfer.note ?? "",
    toAccount: transfer.toAccount
  };
}

function TransferEditFormComponent({ onCancel, onSaved, transfer }: TransferEditFormProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const actions = useActions();
  const accounts = useFinanceSelector((state) => state.accounts);
  const initial = buildEditForm(transfer);

  const [amountText, setAmountText] = useState(initial.amountText);
  const [fromAccount, setFromAccount] = useState(initial.fromAccount);
  const [note, setNote] = useState(initial.note);
  const [toAccount, setToAccount] = useState(initial.toAccount);
  const [fieldError, setFieldError] = useState<FormValidationError<TransferFieldError> | null>(null);

  const save = useCallback(async () => {
    const result = await actions.updateTransfer(transfer.id, {
      amountText,
      fromAccount,
      note,
      toAccount
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
  }, [actions, amountText, fromAccount, note, onSaved, toAccount, transfer.id]);

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
        <View style={styles.transferPickerBlock}>
          <AccountPicker
            accounts={accounts}
            label={strings.capture.from}
            selected={fromAccount}
            onSelect={(value) => {
              setFieldError((current) => (current?.field === "transferAccounts" ? null : current));
              setFromAccount(value);
            }}
          />
          <AccountPicker
            accounts={accounts.filter((account) => account.label !== fromAccount)}
            label={strings.capture.to}
            selected={toAccount === fromAccount ? "" : toAccount}
            onSelect={(value) => {
              setFieldError((current) => (current?.field === "transferAccounts" ? null : current));
              setToAccount(value);
            }}
          />
          {fieldError?.field === "transferAccounts" && (
            <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
              {fieldError.message}
            </Text>
          )}
        </View>
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

export const TransferEditForm = memo(TransferEditFormComponent);