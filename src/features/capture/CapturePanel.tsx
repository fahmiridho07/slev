import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AccountPicker, ContextPicker, EmptyState } from "../../components";
import { CaptureTypePicker } from "./CaptureTypePicker";
import { formatCompactRupiah, formatRupiah } from "../../lib/spendingMemoryPatterns";
import { getTemplateLabel } from "../../lib/analysis";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../../state/useFinance";
import { colors } from "../../theme/colors";
import { styles } from "../../theme/styles/app";
import { useCaptureForm } from "./useCaptureForm";

type CapturePanelProps = {
  onOpenSettings: () => void;
};

function getSaveLabel(entryType: "expense" | "income" | "transfer") {
  if (entryType === "income") return "Save income";
  if (entryType === "transfer") return "Save transfer";
  return "Save expense";
}

function CapturePanelComponent({ onOpenSettings }: CapturePanelProps) {
  const actions = useActions();
  const { categoryLabels, repeatSuggestions } = useDerived();
  const { accounts, manualTemplates } = useFinanceSelector(
    (state) => ({
      accounts: state.accounts,
      manualTemplates: state.manualTemplates
    }),
    shallowEqual
  );
  const {
    form,
    patch,
    changeAmountText,
    changeEntryType,
    applyRepeat,
    applyTemplate,
    save,
    saveTemplate
  } = useCaptureForm();

  const [expanded, setExpanded] = useState(false);
  const [noteOpen, setNoteOpen] = useState(Boolean(form.note));

  useEffect(() => {
    if (form.note) {
      setNoteOpen(true);
      setExpanded(true);
    }
  }, [form.note]);

  useEffect(() => {
    if (form.entryType !== "expense") {
      setExpanded(true);
    }
  }, [form.entryType]);

  const handleSave = useCallback(async () => {
    const saved = await save();
    if (saved) {
      setNoteOpen(false);
    }
  }, [save]);

  const showRepeatSuggestions = form.entryType === "expense" && repeatSuggestions.length > 0;
  const showQuickAdd = expanded && (manualTemplates.length > 0 || showRepeatSuggestions);

  return (
    <View style={styles.capturePanel}>
      <Text style={styles.kicker}>Quick capture</Text>
      {showQuickAdd && (
        <View style={styles.repeatBlock}>
          <Text style={styles.microLabel}>Quick add</Text>
          {manualTemplates.length > 0 && (
            <View style={styles.templateGrid}>
              {manualTemplates.slice(0, 6).map((template) => (
                <View key={template.id} style={styles.templateChip}>
                  <Pressable
                    accessibilityLabel={`Apply shortcut ${getTemplateLabel(template)}`}
                    accessibilityRole="button"
                    onPress={() => applyTemplate(template)}
                    style={styles.templateMain}
                  >
                    <Text style={styles.repeatText}>{getTemplateLabel(template)}</Text>
                    <Text style={styles.repeatAmount}>
                      {template.amount > 0 ? formatRupiah(template.amount) : template.type === "income" ? "Income" : template.context}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Remove shortcut ${getTemplateLabel(template)}`}
                    accessibilityRole="button"
                    onPress={() => actions.removeManualTemplate(template.id)}
                    style={styles.templateRemoveButton}
                  >
                    <Ionicons name="close-outline" size={14} color={colors.muted} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          {showRepeatSuggestions && (
            <View style={styles.suggestionRow}>
              {repeatSuggestions.map((item) => (
                <Pressable key={`${item.label}-${item.context}`} onPress={() => applyRepeat(item)} style={styles.repeatChip}>
                  <Text style={styles.repeatText}>{item.label}</Text>
                  <Text style={styles.repeatAmount}>{formatCompactRupiah(item.amount)}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
      {expanded && <CaptureTypePicker onSelect={changeEntryType} selected={form.entryType} />}

      <View style={styles.amountRow}>
        <Text style={styles.currencyPrefix}>Rp</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={changeAmountText}
          placeholder="0"
          placeholderTextColor={colors.muted}
          style={styles.amountInput}
          value={form.amountText}
        />
      </View>

      {expanded && form.entryType === "transfer" ? (
        <View style={styles.transferPickerBlock}>
          <AccountPicker
            accounts={accounts}
            label="From"
            selected={form.fromAccount}
            onSelect={(value) => patch({ fromAccount: value })}
          />
          <AccountPicker
            accounts={accounts.filter((account) => account.label !== form.fromAccount)}
            label="To"
            selected={form.toAccount === form.fromAccount ? "" : form.toAccount}
            onSelect={(value) => patch({ toAccount: value })}
          />
        </View>
      ) : expanded && form.entryType === "income" ? (
        <TextInput
          onChangeText={(value) => patch({ source: value })}
          placeholder="Source, optional"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={form.source}
        />
      ) : expanded ? (
        <TextInput
          onChangeText={(value) => patch({ label: value })}
          placeholder="Label, optional"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={form.label}
        />
      ) : null}

      {expanded && form.entryType !== "transfer" && (
        <AccountPicker
          accounts={accounts}
          label={form.entryType === "income" ? "Received in" : "Paid from"}
          selected={form.accountLabel}
          onSelect={(value) => patch({ accountLabel: value })}
        />
      )}

      {form.entryType === "expense" && (
        categoryLabels.length === 0 ? (
          <EmptyState
            text="No expense categories are active. Add one before saving expenses."
            actionLabel="Open Settings"
            onAction={onOpenSettings}
          />
        ) : (
          <>
            <View style={styles.contextHeaderRow}>
              <Text style={styles.microLabel}>Context</Text>
            </View>
            <ContextPicker
              categories={categoryLabels}
              selected={form.context}
              onSelect={(value) => patch({ context: value })}
            />
          </>
        )
      )}

      {expanded && (
        noteOpen ? (
          <TextInput
            multiline
            onChangeText={(value) => patch({ note: value })}
            placeholder="Tiny note, optional"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.noteInput]}
            value={form.note}
          />
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setNoteOpen(true)} style={styles.addNoteButton}>
            <Ionicons name="create-outline" size={16} color={colors.muted} />
            <Text style={styles.addNoteText}>Add a note</Text>
          </Pressable>
        )
      )}

      <Pressable accessibilityRole="button" onPress={() => void handleSave()} style={styles.primaryButton}>
        <Ionicons name="checkmark-circle-outline" size={20} color={colors.surface} />
        <Text style={styles.primaryButtonText}>{getSaveLabel(form.entryType)}</Text>
      </Pressable>

      {expanded ? (
        <>
          <Pressable accessibilityRole="button" onPress={saveTemplate} style={styles.secondaryInlineButton}>
            <Ionicons name="bookmark-outline" size={16} color={colors.greenDark} />
            <Text style={styles.textButtonLabel}>Save as shortcut</Text>
          </Pressable>
          {form.entryType === "expense" && (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: true }}
              onPress={() => setExpanded(false)}
              style={styles.captureExpandRow}
            >
              <Text style={styles.captureExpandText}>Fewer options</Text>
              <Ionicons name="chevron-up-outline" size={16} color={colors.greenDark} />
            </Pressable>
          )}
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: false }}
          onPress={() => setExpanded(true)}
          style={styles.captureExpandRow}
        >
          <Text style={styles.captureExpandText}>More options</Text>
          <Ionicons name="chevron-down-outline" size={16} color={colors.greenDark} />
        </Pressable>
      )}
    </View>
  );
}

export const CapturePanel = memo(CapturePanelComponent);