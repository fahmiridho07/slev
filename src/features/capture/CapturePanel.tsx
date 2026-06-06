import { Ionicons } from "@expo/vector-icons";
import React, { memo, useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AccountPicker, ContextPicker, EmptyState, SegmentedControl } from "../../components";
import { formatCompactRupiah, formatRupiah } from "../../lib/spendingMemoryPatterns";
import { getTemplateLabel } from "../../lib/analysis";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../../state/useFinance";
import { colors } from "../../theme/colors";
import { styles } from "../../theme/styles/app";
import { useCaptureForm } from "./useCaptureForm";

type CapturePanelProps = {
  onOpenSettings: () => void;
};

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

  const [noteOpen, setNoteOpen] = useState(Boolean(form.note));

  useEffect(() => {
    if (form.note) {
      setNoteOpen(true);
    }
  }, [form.note]);

  return (
    <View style={styles.capturePanel}>
      <Text style={styles.kicker}>Quick capture</Text>
      {manualTemplates.length > 0 && (
        <View style={styles.repeatBlock}>
          <Text style={styles.microLabel}>Manual shortcuts</Text>
          <View style={styles.templateGrid}>
            {manualTemplates.slice(0, 6).map((template) => (
              <View key={template.id} style={styles.templateChip}>
                <Pressable onPress={() => applyTemplate(template)} style={styles.templateMain}>
                  <Text style={styles.repeatText}>{getTemplateLabel(template)}</Text>
                  <Text style={styles.repeatAmount}>
                    {template.amount > 0 ? formatRupiah(template.amount) : template.type === "income" ? "Income" : template.context}
                  </Text>
                </Pressable>
                <Pressable onPress={() => actions.removeManualTemplate(template.id)} style={styles.templateRemoveButton}>
                  <Ionicons name="close-outline" size={14} color={colors.muted} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}
      <SegmentedControl
        options={[
          { label: "Expense", value: "expense" },
          { label: "Income", value: "income" },
          { label: "Transfer", value: "transfer" }
        ]}
        selected={form.entryType}
        onSelect={changeEntryType}
      />
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

      {form.entryType === "transfer" ? (
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
      ) : form.entryType === "income" ? (
        <TextInput
          onChangeText={(value) => patch({ source: value })}
          placeholder="Source, optional"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={form.source}
        />
      ) : (
        <TextInput
          onChangeText={(value) => patch({ label: value })}
          placeholder="Label, optional"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={form.label}
        />
      )}

      {form.entryType !== "transfer" && (
        <AccountPicker
          accounts={accounts}
          label={form.entryType === "income" ? "Received in" : "Paid from"}
          selected={form.accountLabel}
          onSelect={(value) => patch({ accountLabel: value })}
        />
      )}

      {form.entryType === "expense" && repeatSuggestions.length > 0 && (
        <View style={styles.repeatBlock}>
          <Text style={styles.microLabel}>Repeat faster</Text>
          <View style={styles.suggestionRow}>
            {repeatSuggestions.map((item) => (
              <Pressable key={`${item.label}-${item.context}`} onPress={() => applyRepeat(item)} style={styles.repeatChip}>
                <Text style={styles.repeatText}>{item.label}</Text>
                <Text style={styles.repeatAmount}>{formatCompactRupiah(item.amount)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
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
              <Text style={styles.contextDefault}>Defaults to last used</Text>
            </View>
            <ContextPicker
              categories={categoryLabels}
              selected={form.context}
              onSelect={(value) => patch({ context: value })}
            />
          </>
        )
      )}

      {noteOpen ? (
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
          <Text style={styles.addNoteText}>Add note only if it helps recall</Text>
        </Pressable>
      )}

      <Pressable accessibilityRole="button" onPress={save} style={styles.primaryButton}>
        <Ionicons name="checkmark-circle-outline" size={20} color={colors.surface} />
        <Text style={styles.primaryButtonText}>
          {form.entryType === "income" ? "Save income" : form.entryType === "transfer" ? "Save transfer" : "Save memory"}
        </Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={saveTemplate} style={styles.secondaryInlineButton}>
        <Ionicons name="bookmark-outline" size={16} color={colors.greenDark} />
        <Text style={styles.textButtonLabel}>Save as shortcut</Text>
      </Pressable>
    </View>
  );
}

export const CapturePanel = memo(CapturePanelComponent);