import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { BottomSheet, DeleteConfirmDialog, EmptyState, ListActionRow, ListActionsOnboardingTip } from "../../components";
import { useListActionsHint } from "../../hooks/useListActionsHint";
import { formatAmountInput } from "../../lib/formatMoney";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { RecurringBill } from "../spendingMemory.types";
import { formatString } from "../../i18n";
import { hapticSelection, hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useTheme } from "../../hooks/useTheme";
import { BillFieldError } from "./settingsValidation";
import { BillEditForm } from "./BillEditForm";

export function RecurringBillsPanel({
  recurringBills,
  onDeleteBill,
  onSaveBill
}: {
  recurringBills: RecurringBill[];
  onDeleteBill: (id: string) => void;
  onSaveBill: (input: {
    id?: string;
    label: string;
    amount: string;
    active: boolean;
    dueDay?: number | null;
  }) => Promise<{ ok: boolean; validation?: FormValidationError<BillFieldError> }>;
}) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [active, setActive] = useState(true);
  const [dueDay, setDueDay] = useState<number | null>(null);
  const [pendingDeleteBill, setPendingDeleteBill] = useState<RecurringBill | null>(null);
  const [fieldError, setFieldError] = useState<FormValidationError<BillFieldError> | null>(null);
  const { dismiss: dismissBillsHint, visible: showBillsHint } = useListActionsHint("recurring_bills", recurringBills.length > 0);

  function editBill(bill: RecurringBill) {
    hapticSelection();
    setEditingBill(bill);
  }

  function resetAddDraft() {
    setLabel("");
    setAmount("");
    setActive(true);
    setDueDay(null);
    setFieldError(null);
  }

  function clearFieldError(field?: BillFieldError) {
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
        <Text style={componentStyles.microLabel}>{strings.settings.bills.title}</Text>
        <Text style={styles.settingCopy}>{strings.settings.bills.intro}</Text>

        <Text style={componentStyles.microLabel}>{strings.settings.bills.add}</Text>
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
        <TextInput
          accessibilityLabel={strings.settings.bills.dayPlaceholder}
          keyboardType="number-pad"
          maxLength={2}
          onChangeText={(value) => {
            const digits = value.replace(/[^0-9]/g, "");
            if (digits.length === 0) {
              setDueDay(null);
              return;
            }
            setDueDay(Math.min(31, Math.max(1, parseInt(digits, 10))));
          }}
          placeholder={strings.settings.bills.dayPlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={dueDay != null ? String(dueDay) : ""}
        />
        <Pressable
          accessibilityLabel={active ? strings.settings.bills.active : strings.settings.bills.paused}
          accessibilityRole="button"
          onPress={() => setActive((current) => !current)}
          style={styles.secondaryInlineButton}
        >
          <Ionicons name={active ? "checkmark-circle-outline" : "ellipse-outline"} size={16} color={colors.greenDark} />
          <Text style={componentStyles.secondaryButtonText}>{active ? strings.settings.bills.active : strings.settings.bills.paused}</Text>
        </Pressable>
        <View style={componentStyles.editActions}>
          <Pressable
            onPress={() => {
              void (async () => {
                const result = await onSaveBill({ label, amount, active, dueDay });
                if (!result.ok) {
                  hapticWarning();
                  if (result.validation) {
                    setFieldError(result.validation);
                  }
                  return;
                }
                resetAddDraft();
              })();
            }}
            style={styles.smallPrimaryButton}
          >
            <Text style={styles.primaryButtonText}>{strings.settings.bills.save}</Text>
          </Pressable>
        </View>
      </View>

      {recurringBills.length === 0 ? (
        <EmptyState text={strings.settings.bills.empty} />
      ) : (
        <>
          {showBillsHint && (
            <ListActionsOnboardingTip
              body={strings.listHints.recurring_bills.body}
              onDismiss={dismissBillsHint}
              title={strings.listHints.recurring_bills.title}
            />
          )}
          {recurringBills.map((bill, index) => (
            <View
              key={bill.id}
              style={[
                styles.listPanel,
                index > 0 && styles.listPanelContinued,
                index < recurringBills.length - 1 && styles.listPanelMiddle
              ]}
            >
              <ListActionRow
                accessibilityLabel={formatString(strings.settings.bills.editA11y, { label: bill.label })}
                onDelete={() => setPendingDeleteBill(bill)}
                onPress={() => editBill(bill)}
              >
                <View style={styles.analyticsRow}>
                  <View style={styles.analyticsRowHeader}>
                    <Text style={componentStyles.analyticsTitle}>{bill.label}</Text>
                    <Text style={styles.analyticsAmount}>{formatRupiah(bill.amount)}</Text>
                  </View>
                  <Text style={styles.settingCopy}>
                    {bill.active ? strings.settings.bills.active : strings.settings.bills.paused}
                  </Text>
                </View>
              </ListActionRow>
            </View>
          ))}
        </>
      )}

      <BottomSheet
        onClose={() => setEditingBill(null)}
        title={
          editingBill
            ? formatString(strings.settings.bills.editA11y, { label: editingBill.label })
            : strings.settings.bills.edit
        }
        visible={Boolean(editingBill)}
      >
        {editingBill ? (
          <BillEditForm key={editingBill.id} bill={editingBill} onCancel={() => setEditingBill(null)} onSaved={() => setEditingBill(null)} />
        ) : null}
      </BottomSheet>
      <DeleteConfirmDialog
        body={
          pendingDeleteBill
            ? formatString(strings.settings.bills.deleteBody, { label: pendingDeleteBill.label })
            : ""
        }
        onCancel={() => setPendingDeleteBill(null)}
        onConfirm={() => {
          if (pendingDeleteBill) {
            onDeleteBill(pendingDeleteBill.id);
            if (editingBill?.id === pendingDeleteBill.id) {
              setEditingBill(null);
            }
            setPendingDeleteBill(null);
          }
        }}
        title={strings.settings.bills.deleteTitle}
        visible={Boolean(pendingDeleteBill)}
      />
    </View>
  );
}