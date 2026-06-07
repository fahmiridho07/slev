import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AccountPicker, ContextPicker, DeleteConfirmDialog, EmptyState, FormScrollAnchor, ListActionRow, ListActionsOnboardingTip } from "../../components";
import { useScrollToForm } from "../../hooks/scrollToForm";
import { useListActionsHint } from "../../hooks/useListActionsHint";
import { formatAmountInput } from "../../lib/formatMoney";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { MoneyAccount, RecurringBill, SpendingContext } from "../spendingMemory.types";
import { formatString } from "../../i18n";
import { hapticSelection, hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useTheme } from "../../hooks/useTheme";
import { BillFieldError } from "./settingsValidation";

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
  }) => Promise<{ ok: boolean; validation?: FormValidationError<BillFieldError> }>;
}) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const [editingBillId, setEditingBillId] = useState<string | undefined>(undefined);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [context, setContext] = useState<SpendingContext>(categoryLabels[0] ?? "Other");
  const [accountLabel, setAccountLabel] = useState(accounts[0]?.label ?? "");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [active, setActive] = useState(true);
  const [pendingDeleteBill, setPendingDeleteBill] = useState<RecurringBill | null>(null);
  const [fieldError, setFieldError] = useState<FormValidationError<BillFieldError> | null>(null);
  const { dismiss: dismissBillsHint, visible: showBillsHint } = useListActionsHint("recurring_bills", recurringBills.length > 0);
  const scrollToForm = useScrollToForm();

  useEffect(() => {
    if (editingBillId) {
      requestAnimationFrame(() => scrollToForm());
    }
  }, [editingBillId, scrollToForm]);

  function editBill(bill: RecurringBill) {
    hapticSelection();
    setEditingBillId(bill.id);
    setLabel(bill.label);
    setAmount(formatAmountInput(String(bill.amount)));
    setContext(bill.context);
    setAccountLabel(bill.accountLabel ?? accounts[0]?.label ?? "");
    setDayOfMonth(String(bill.dayOfMonth));
    setActive(bill.active);
    setFieldError(null);
  }

  function resetDraft() {
    setEditingBillId(undefined);
    setLabel("");
    setAmount("");
    setContext(categoryLabels[0] ?? "Other");
    setAccountLabel(accounts[0]?.label ?? "");
    setDayOfMonth("1");
    setActive(true);
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
      <FormScrollAnchor>
      <View style={styles.capturePanel}>
      <Text style={componentStyles.microLabel}>{strings.settings.bills.title}</Text>
      <Text style={styles.settingCopy}>{strings.settings.bills.intro}</Text>

      <Text style={componentStyles.microLabel}>{editingBillId ? strings.settings.bills.edit : strings.settings.bills.add}</Text>
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
        <Text style={componentStyles.secondaryButtonText}>{active ? strings.settings.bills.active : strings.settings.bills.paused}</Text>
      </Pressable>
      <View style={componentStyles.editActions}>
        {editingBillId && (
          <Pressable onPress={resetDraft} style={styles.secondaryButton}>
            <Text style={componentStyles.secondaryButtonText}>{strings.common.cancel}</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            void (async () => {
              const result = await onSaveBill({
                id: editingBillId,
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
              resetDraft();
            })();
          }}
          style={styles.smallPrimaryButton}
        >
          <Text style={styles.primaryButtonText}>{strings.settings.bills.save}</Text>
        </Pressable>
      </View>
      </View>
      </FormScrollAnchor>

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
                    {formatString(strings.settings.bills.rowMeta, {
                      account: bill.accountLabel ? ` · ${bill.accountLabel}` : "",
                      context: bill.context,
                      day: bill.dayOfMonth,
                      status: bill.active ? strings.settings.bills.active : strings.settings.bills.paused
                    })}
                  </Text>
                </View>
              </ListActionRow>
            </View>
          ))}
        </>
      )}

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
            if (editingBillId === pendingDeleteBill.id) {
              resetDraft();
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