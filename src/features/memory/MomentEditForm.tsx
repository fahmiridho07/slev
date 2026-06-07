import React, { memo, useCallback, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AccountPicker, ContextPicker, SegmentedControl } from "../../components";
import { EntryType, MoneyAccount, SpendingContext, SpendingMoment } from "../spendingMemory.types";
import { getDefaultMomentAccount } from "../../lib/analysis";
import { formatAmountInput } from "../../lib/formatMoney";
import { useActions, useDerived, useFinanceSelector } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";

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
  const { colors, strings, styles } = useTheme();
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

  const save = useCallback(async () => {
    await actions.updateMoment(moment.id, {
      amountText,
      label,
      context,
      note,
      type,
      source,
      accountLabel
    });
    onSaved();
  }, [accountLabel, actions, amountText, context, label, moment.id, note, onSaved, source, type]);

  return (
    <View style={styles.repeatBlock}>
      <TextInput
        keyboardType="number-pad"
        onChangeText={(value) => setAmountText(formatAmountInput(value))}
        accessibilityLabel={strings.memory.edit.amount}
        placeholder={strings.memory.edit.amount}
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={amountText}
      />
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
      <View style={styles.editActions}>
        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{strings.common.cancel}</Text>
        </Pressable>
        <Pressable accessibilityLabel={strings.memory.edit.save} accessibilityRole="button" onPress={() => void save()} style={styles.smallPrimaryButton}>
          <Text style={styles.primaryButtonText}>{strings.memory.edit.save}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const MomentEditForm = memo(MomentEditFormComponent);