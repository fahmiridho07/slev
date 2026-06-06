import React, { memo, useCallback, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AccountPicker, ContextPicker, SegmentedControl } from "../../components";
import { EntryType, MoneyAccount, SpendingContext, SpendingMoment } from "../spendingMemory.types";
import { getDefaultMomentAccount } from "../../lib/analysis";
import { formatAmountInput } from "../../lib/formatMoney";
import { useActions, useDerived, useFinanceSelector } from "../../state/useFinance";
import { colors } from "../../theme/colors";
import { styles } from "../../theme/styles/app";

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
  const actions = useActions();
  const { categoryLabels } = useDerived();
  const accounts = useFinanceSelector((state) => state.accounts);
  const initial = buildEditForm(moment, accounts);

  const [amountText, setAmountText] = useState(initial.amountText);
  const [label, setLabel] = useState(initial.label);
  const [context, setContext] = useState<SpendingContext>(initial.context);
  const [note, setNote] = useState(initial.note);
  const [type, setType] = useState<EntryType>(initial.type);
  const [source, setSource] = useState(initial.source);
  const [accountLabel, setAccountLabel] = useState(initial.accountLabel);

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
    <View style={styles.editPanel}>
      <TextInput
        keyboardType="number-pad"
        onChangeText={(value) => setAmountText(formatAmountInput(value))}
        placeholder="Amount"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={amountText}
      />
      <TextInput
        onChangeText={type === "income" ? setSource : setLabel}
        placeholder={type === "income" ? "Source" : "Label"}
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={type === "income" ? source : label}
      />
      <SegmentedControl
        compact
        options={[
          { label: "Expense", value: "expense" },
          { label: "Income", value: "income" }
        ]}
        selected={type}
        onSelect={setType}
      />
      {type === "expense" && (
        <ContextPicker categories={categoryLabels} selected={context} onSelect={setContext} compact />
      )}
      <AccountPicker
        accounts={accounts}
        label={type === "income" ? "Received in" : "Paid from"}
        selected={accountLabel}
        onSelect={setAccountLabel}
      />
      <TextInput
        multiline
        onChangeText={setNote}
        placeholder="Note"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.noteInput]}
        value={note}
      />
      <View style={styles.editActions}>
        <Pressable onPress={onCancel} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
        <Pressable onPress={() => void save()} style={styles.smallPrimaryButton}>
          <Text style={styles.primaryButtonText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const MomentEditForm = memo(MomentEditFormComponent);