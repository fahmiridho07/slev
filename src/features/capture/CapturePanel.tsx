import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AccountPicker, ContextPicker, EmptyState, numberPadInputAccessoryProps } from "../../components";
import { CaptureDatePicker } from "./CaptureDatePicker";
import { CaptureTypePicker } from "./CaptureTypePicker";
import { formatCaptureDateLabel } from "./captureDate";
import { formatAmountInput } from "../../lib/formatMoney";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { shallowEqual, useFinanceDerived, useFinanceSelector } from "../../state/useFinance";
import { formatString } from "../../i18n";
import { useCapturePickerOrder } from "../../hooks/useCapturePickerOrder";
import { useTheme } from "../../hooks/useTheme";
import { hapticSuccess } from "../../lib/haptics";
import { buildCaptureSaveAckBanner, CaptureSaveAck } from "./captureSaveAck";
import { useCaptureForm } from "./useCaptureForm";

type CapturePanelProps = {
  compactTypePicker?: boolean;
  focusAmountToken?: number;
  onOpenSettings: () => void;
  onSaved?: () => void;
};

function CapturePanelComponent({
  compactTypePicker = false,
  focusAmountToken = 0,
  onOpenSettings,
  onSaved
}: CapturePanelProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const amountInputRef = useRef<TextInput>(null);

  function getSaveLabel(entryType: "expense" | "income" | "transfer") {
    if (entryType === "income") return strings.capture.saveIncome;
    if (entryType === "transfer") return strings.capture.saveTransfer;
    return strings.capture.saveExpense;
  }
  const categoryLabels = useFinanceDerived((derived) => derived.categoryLabels);
  const { accounts, expenseCategories, recurringBills } = useFinanceSelector(
    (state) => ({
      accounts: state.accounts,
      expenseCategories: state.expenseCategories,
      recurringBills: state.recurringBills
    }),
    shallowEqual
  );
  const activeBillSuggestions = useMemo(
    () => recurringBills.filter((bill) => bill.active).slice(0, 6),
    [recurringBills]
  );
  const { orderedAccounts, orderedCategories } = useCapturePickerOrder(categoryLabels, accounts);
  const { fieldError, form, patch, changeAmountText, changeEntryType, save } = useCaptureForm();

  const [dateOpen, setDateOpen] = useState(false);
  const [saveAck, setSaveAck] = useState<CaptureSaveAck | null>(null);
  const saveAckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSaveAck = useCallback((ack: CaptureSaveAck) => {
    if (saveAckTimerRef.current) {
      clearTimeout(saveAckTimerRef.current);
    }
    setSaveAck(ack);
    saveAckTimerRef.current = setTimeout(() => {
      setSaveAck(null);
      saveAckTimerRef.current = null;
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (saveAckTimerRef.current) {
        clearTimeout(saveAckTimerRef.current);
      }
    };
  }, []);

  const handleDateSelect = useCallback(
    (value: string | null) => {
      patch({ occurredAtKey: value });
      setDateOpen(false);
    },
    [patch]
  );

  useEffect(() => {
    if (focusAmountToken <= 0) {
      return;
    }

    requestAnimationFrame(() => {
      amountInputRef.current?.focus();
    });
  }, [focusAmountToken]);

  const handleSave = useCallback(async () => {
    const saved = await save();
    if (saved) {
      showSaveAck(saved);
      hapticSuccess();
      setDateOpen(false);
      onSaved?.();
    }
  }, [onSaved, save, showSaveAck]);

  return (
    <View style={styles.capturePanel}>
      <Text style={styles.kicker}>{strings.capture.kicker}</Text>
      <CaptureTypePicker compact={compactTypePicker} onSelect={changeEntryType} selected={form.entryType} />

      <View style={styles.amountRow}>
        <Text style={styles.currencyPrefix}>{strings.capture.currencyPrefix}</Text>
        <TextInput
          ref={amountInputRef}
          accessibilityLabel={
            fieldError?.field === "amount"
              ? `${strings.capture.amountA11y}. ${fieldError.message}`
              : strings.capture.amountA11y
          }
          keyboardType="number-pad"
          {...numberPadInputAccessoryProps}
          onChangeText={changeAmountText}
          placeholder={strings.capture.amountPlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.amountInput}
          value={form.amountText}
        />
      </View>
      {fieldError?.field === "amount" && (
        <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
          {fieldError.message}
        </Text>
      )}

      {form.entryType === "transfer" ? (
        <View style={styles.transferPickerBlock}>
          <AccountPicker
            accounts={orderedAccounts}
            label={strings.capture.from}
            selected={form.fromAccount}
            onSelect={(value) => patch({ fromAccount: value })}
          />
          <AccountPicker
            accounts={orderedAccounts.filter((account) => account.label !== form.fromAccount)}
            label={strings.capture.to}
            selected={form.toAccount === form.fromAccount ? "" : form.toAccount}
            onSelect={(value) => patch({ toAccount: value })}
          />
          {fieldError?.field === "transferAccounts" && (
            <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
              {fieldError.message}
            </Text>
          )}
        </View>
      ) : form.entryType === "income" ? (
        <TextInput
          accessibilityLabel={strings.capture.sourcePlaceholder}
          onChangeText={(value) => patch({ source: value })}
          placeholder={strings.capture.sourcePlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={form.source}
        />
      ) : (
        <TextInput
          accessibilityLabel={strings.capture.labelPlaceholder}
          onChangeText={(value) => patch({ label: value })}
          placeholder={strings.capture.labelPlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={form.label}
        />
      )}

      {form.entryType !== "transfer" && (
        <>
          <AccountPicker
            accounts={orderedAccounts}
            label={form.entryType === "income" ? strings.capture.receivedIn : strings.capture.paidFrom}
            selected={form.accountLabel}
            onSelect={(value) => patch({ accountLabel: value })}
          />
          {fieldError?.field === "momentAccount" && (
            <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
              {fieldError.message}
            </Text>
          )}
        </>
      )}

      {form.entryType === "expense" && (
        categoryLabels.length === 0 ? (
          <>
            <EmptyState
              text={strings.capture.noCategories}
              actionLabel={strings.capture.openSettings}
              onAction={onOpenSettings}
            />
            {fieldError?.field === "category" && (
              <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
                {fieldError.message}
              </Text>
            )}
          </>
        ) : (
          <>
            <Text style={componentStyles.microLabel}>{strings.capture.context}</Text>
            <ContextPicker
              categories={orderedCategories}
              expenseCategories={expenseCategories}
              selected={form.context}
              onSelect={(value) => patch({ context: value })}
            />
            {form.context === "Bills" ? (
              <>
                <Text style={styles.settingCopy}>{strings.capture.billsReservedHint}</Text>
                {activeBillSuggestions.length > 0 ? (
                  <View style={styles.repeatBlock}>
                    <Text style={componentStyles.microLabel}>{strings.capture.billSuggestions}</Text>
                    <View style={styles.templateGrid}>
                      {activeBillSuggestions.map((bill) => (
                        <View key={bill.id} style={styles.templateChip}>
                          <Pressable
                            accessibilityLabel={formatString(strings.capture.applyShortcutA11y, {
                              label: bill.label
                            })}
                            accessibilityRole="button"
                            onPress={() =>
                              patch({
                                amountText: formatAmountInput(String(bill.amount)),
                                label: bill.label
                              })
                            }
                            style={styles.templateMain}
                          >
                            <Text style={styles.repeatText}>{bill.label}</Text>
                            <Text style={styles.repeatAmount}>{formatRupiah(bill.amount)}</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}
              </>
            ) : null}
          </>
        )
      )}

      <View style={styles.captureOptionalRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: dateOpen }}
          onPress={() => setDateOpen((open) => !open)}
          style={styles.addNoteButton}
        >
          <Ionicons
            color={colors.muted}
            name={dateOpen ? "chevron-up" : "calendar-outline"}
            size={16}
          />
          <Text style={styles.addNoteText}>
            {dateOpen
              ? strings.capture.hideDate
              : formatCaptureDateLabel(form.occurredAtKey) ?? strings.capture.changeDate}
          </Text>
        </Pressable>
      </View>

      {dateOpen ? (
        <CaptureDatePicker occurredAtKey={form.occurredAtKey} onSelect={handleDateSelect} />
      ) : null}

      {fieldError?.field === "occurredAt" && (
        <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
          {fieldError.message}
        </Text>
      )}

      <Pressable
        accessibilityLabel={saveAck ? strings.capture.savedButton : getSaveLabel(form.entryType)}
        accessibilityRole="button"
        onPress={() => void handleSave()}
        style={[styles.primaryButton, saveAck ? styles.primaryButtonSaved : null]}
      >
        <Ionicons
          name={saveAck ? "checkmark-circle" : "checkmark-circle-outline"}
          size={20}
          color={colors.surface}
        />
        <Text style={styles.primaryButtonText}>
          {saveAck ? strings.capture.savedButton : getSaveLabel(form.entryType)}
        </Text>
      </Pressable>

      {saveAck && (
        <View accessibilityLiveRegion="polite" style={styles.captureSaveBanner}>
          <Ionicons name="checkmark-circle" size={18} color={colors.greenDark} />
          <Text style={styles.captureSaveBannerText}>{buildCaptureSaveAckBanner(saveAck, strings)}</Text>
        </View>
      )}
    </View>
  );
}

export const CapturePanel = memo(CapturePanelComponent);