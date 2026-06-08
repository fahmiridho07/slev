import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AccountPicker, ContextPicker, EmptyState, numberPadInputAccessoryProps } from "../../components";
import { CaptureTypePicker } from "./CaptureTypePicker";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { getTemplateLabel } from "../../lib/analysis";
import { shallowEqual, useActions, useFinanceDerived, useFinanceSelector } from "../../state/useFinance";
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
  const actions = useActions();
  const categoryLabels = useFinanceDerived((derived) => derived.categoryLabels);
  const { accounts, manualTemplates } = useFinanceSelector(
    (state) => ({
      accounts: state.accounts,
      manualTemplates: state.manualTemplates
    }),
    shallowEqual
  );
  const { orderedAccounts, orderedCategories } = useCapturePickerOrder(categoryLabels, accounts);
  const {
    fieldError,
    shortcutFieldError,
    form,
    patch,
    changeAmountText,
    changeEntryType,
    applyTemplate,
    save,
    saveTemplate
  } = useCaptureForm();

  const [noteOpen, setNoteOpen] = useState(Boolean(form.note));
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

  useEffect(() => {
    if (form.note) {
      setNoteOpen(true);
    }
  }, [form.note]);

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
      setNoteOpen(false);
      onSaved?.();
    }
  }, [onSaved, save, showSaveAck]);

  return (
    <View style={styles.capturePanel}>
      <Text style={styles.kicker}>{strings.capture.kicker}</Text>
      {manualTemplates.length > 0 && (
        <View style={styles.repeatBlock}>
          <Text style={componentStyles.microLabel}>{strings.capture.quickAdd}</Text>
          <View style={styles.templateGrid}>
            {manualTemplates.slice(0, 6).map((template) => (
              <View key={template.id} style={styles.templateChip}>
                <Pressable
                  accessibilityLabel={formatString(strings.capture.applyShortcutA11y, {
                    label: getTemplateLabel(template)
                  })}
                  accessibilityRole="button"
                  onPress={() => applyTemplate(template)}
                  style={styles.templateMain}
                >
                  <Text style={styles.repeatText}>{getTemplateLabel(template)}</Text>
                  <Text style={styles.repeatAmount}>
                    {template.amount > 0
                      ? formatRupiah(template.amount)
                      : template.type === "income"
                        ? strings.capture.income
                        : template.context}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={formatString(strings.capture.removeShortcutA11y, {
                    label: getTemplateLabel(template)
                  })}
                  accessibilityRole="button"
                  onPress={() => actions.removeManualTemplate(template.id)}
                  style={styles.templateRemoveButton}
                >
                  <Ionicons name="close-outline" size={14} color={colors.muted} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}
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
        <>
          <TextInput
            accessibilityLabel={
              shortcutFieldError?.field === "shortcutLabel"
                ? `${strings.capture.sourcePlaceholder}. ${shortcutFieldError.message}`
                : strings.capture.sourcePlaceholder
            }
            onChangeText={(value) => patch({ source: value })}
            placeholder={strings.capture.sourcePlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={form.source}
          />
          {shortcutFieldError?.field === "shortcutLabel" && (
            <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
              {shortcutFieldError.message}
            </Text>
          )}
        </>
      ) : (
        <>
          <TextInput
            accessibilityLabel={
              shortcutFieldError?.field === "shortcutLabel"
                ? `${strings.capture.labelPlaceholder}. ${shortcutFieldError.message}`
                : strings.capture.labelPlaceholder
            }
            onChangeText={(value) => patch({ label: value })}
            placeholder={strings.capture.labelPlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={form.label}
          />
          {shortcutFieldError?.field === "shortcutLabel" && form.entryType === "expense" && (
            <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
              {shortcutFieldError.message}
            </Text>
          )}
        </>
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
              selected={form.context}
              onSelect={(value) => patch({ context: value })}
            />
            {form.context === "Bills" ? (
              <Text style={styles.settingCopy}>{strings.capture.billsReservedHint}</Text>
            ) : null}
          </>
        )
      )}

      {noteOpen ? (
        <TextInput
          multiline
          onChangeText={(value) => patch({ note: value })}
          placeholder={strings.capture.notePlaceholder}
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.noteInput]}
          value={form.note}
        />
      ) : (
        <Pressable accessibilityRole="button" onPress={() => setNoteOpen(true)} style={styles.addNoteButton}>
          <Ionicons name="create-outline" size={16} color={colors.muted} />
          <Text style={styles.addNoteText}>{strings.capture.addNote}</Text>
        </Pressable>
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

      <Pressable
        accessibilityLabel={strings.capture.saveAsShortcutA11y}
        accessibilityRole="button"
        onPress={() => void saveTemplate()}
        style={styles.secondaryInlineButton}
      >
        <Ionicons name="bookmark-outline" size={16} color={colors.greenDark} />
        <Text style={componentStyles.textButtonLabel}>{strings.capture.saveAsShortcut}</Text>
      </Pressable>
      {shortcutFieldError?.field === "shortcutTransfer" && (
        <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
          {shortcutFieldError.message}
        </Text>
      )}
    </View>
  );
}

export const CapturePanel = memo(CapturePanelComponent);