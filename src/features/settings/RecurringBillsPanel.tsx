import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AccountPicker, ContextPicker, DeleteConfirmDialog, EmptyState, ListActionRow } from "../../components";
import { formatAmountInput } from "../../lib/formatMoney";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { MoneyAccount, RecurringBill, SpendingContext } from "../spendingMemory.types";
import { colors } from "../../theme/colors";
import { styles } from "../../theme/styles/app";

export function RecurringBillsPanel({
  accounts,
  categoryLabels,
  recurringBills,
  onDeleteBill,
  onSaveBill
}: {
  accounts: MoneyAccount[];
  categoryLabels: string[];
  recurringBills: RecurringBill[];
  onDeleteBill: (id: string) => void;
  onSaveBill: (input: {
    id?: string;
    label: string;
    amount: string;
    context: SpendingContext;
    accountLabel?: string;
    dayOfMonth: string;
    active: boolean;
  }) => void;
}) {
  const [editingBillId, setEditingBillId] = useState<string | undefined>(undefined);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [context, setContext] = useState<SpendingContext>(categoryLabels[0] ?? "Other");
  const [accountLabel, setAccountLabel] = useState(accounts[0]?.label ?? "");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [active, setActive] = useState(true);
  const [pendingDeleteBill, setPendingDeleteBill] = useState<RecurringBill | null>(null);

  function editBill(bill: RecurringBill) {
    setEditingBillId(bill.id);
    setLabel(bill.label);
    setAmount(formatAmountInput(String(bill.amount)));
    setContext(bill.context);
    setAccountLabel(bill.accountLabel ?? accounts[0]?.label ?? "");
    setDayOfMonth(String(bill.dayOfMonth));
    setActive(bill.active);
  }

  function resetDraft() {
    setEditingBillId(undefined);
    setLabel("");
    setAmount("");
    setContext(categoryLabels[0] ?? "Other");
    setAccountLabel(accounts[0]?.label ?? "");
    setDayOfMonth("1");
    setActive(true);
  }

  return (
    <View style={styles.capturePanel}>
      <Text style={styles.microLabel}>Recurring bills</Text>
      <Text style={styles.settingCopy}>
        Monthly bills you expect each cycle. They show on Home when a payment is coming up.
      </Text>

      <Text style={styles.microLabel}>{editingBillId ? "Edit bill" : "Add bill"}</Text>
      <TextInput
        onChangeText={setLabel}
        placeholder="Bill name, e.g. Internet"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={label}
      />
      <TextInput
        keyboardType="number-pad"
        onChangeText={(value) => setAmount(formatAmountInput(value))}
        placeholder="Amount"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={amount}
      />
      {categoryLabels.length > 0 && (
        <ContextPicker categories={categoryLabels} onSelect={setContext} selected={context} />
      )}
      {accounts.length > 0 && (
        <AccountPicker accounts={accounts} label="Account" onSelect={setAccountLabel} selected={accountLabel} />
      )}
      <TextInput
        keyboardType="number-pad"
        onChangeText={setDayOfMonth}
        placeholder="Day of month (1-31)"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={dayOfMonth}
      />
      <Pressable onPress={() => setActive((current) => !current)} style={styles.secondaryInlineButton}>
        <Ionicons name={active ? "checkmark-circle-outline" : "ellipse-outline"} size={16} color={colors.greenDark} />
        <Text style={styles.secondaryButtonText}>{active ? "Active" : "Paused"}</Text>
      </Pressable>
      <View style={styles.editActions}>
        {editingBillId && (
          <Pressable onPress={resetDraft} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            onSaveBill({
              id: editingBillId,
              label,
              amount,
              context,
              accountLabel: accountLabel || undefined,
              dayOfMonth,
              active
            });
            resetDraft();
          }}
          style={styles.smallPrimaryButton}
        >
          <Text style={styles.primaryButtonText}>Save bill</Text>
        </Pressable>
      </View>

      {recurringBills.length === 0 ? (
        <EmptyState text="No recurring bills yet. Add one when you know a fixed monthly payment." />
      ) : (
        <View style={styles.listPanel}>
          {recurringBills.map((bill, index) => (
            <View
              key={bill.id}
              style={[
                index > 0 && styles.listPanelContinued,
                index < recurringBills.length - 1 && styles.listPanelMiddle
              ]}
            >
              <ListActionRow
                accessibilityLabel={`Edit bill ${bill.label}`}
                onDelete={() => setPendingDeleteBill(bill)}
                onPress={() => editBill(bill)}
              >
                <View style={styles.analyticsRow}>
                  <View style={styles.analyticsRowHeader}>
                    <Text style={styles.analyticsTitle}>{bill.label}</Text>
                    <Text style={styles.analyticsAmount}>{formatRupiah(bill.amount)}</Text>
                  </View>
                  <Text style={styles.settingCopy}>
                    {bill.context} · day {bill.dayOfMonth}{bill.accountLabel ? ` · ${bill.accountLabel}` : ""} · {bill.active ? "Active" : "Paused"}
                  </Text>
                </View>
              </ListActionRow>
            </View>
          ))}
        </View>
      )}

      <DeleteConfirmDialog
        body={
          pendingDeleteBill
            ? `${pendingDeleteBill.label} will be removed from recurring bills. Logged payments stay in your spending history.`
            : ""
        }
        onCancel={() => setPendingDeleteBill(null)}
        onConfirm={() => {
          if (pendingDeleteBill) {
            onDeleteBill(pendingDeleteBill.id);
            if (editingBillId === pendingDeleteBill.id) {
              resetDraft();
            }
            setPendingDeleteBill(null);
          }
        }}
        title="Delete recurring bill?"
        visible={Boolean(pendingDeleteBill)}
      />
    </View>
  );
}