import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { AccountPicker, ContextPicker, EmptyState, SegmentedControl } from "../components";
import { HomeMoneyPulse } from "../features/analysis/HomeMoneyPulse";
import { CaptureType, MonthlySummary } from "../features/app.types";
import { ManualTemplate, MoneyAccount, MonthlyPlan, SpendingContext } from "../features/spendingMemory.types";
import { RepeatSuggestion, getTemplateLabel } from "../lib/analysis";
import { formatCompactRupiah, formatRupiah } from "../lib/spendingMemoryPatterns";
import { colors } from "../theme/colors";
import { styles } from "../theme/styles/app";

export function HomeScreen({
  accountLabel,
  accounts,
  amountText,
  categoryLabels,
  context,
  entryType,
  fromAccount,
  label,
  latestBalanceTotal,
  manualTemplates,
  monthlyPlan,
  monthlySummary,
  note,
  repeatSuggestions,
  source,
  toAccount,
  onChangeAmount,
  onChangeAccount,
  onChangeContext,
  onChangeEntryType,
  onChangeFromAccount,
  onChangeLabel,
  onChangeNote,
  onChangeSource,
  onChangeToAccount,
  onDeleteTemplate,
  onSave,
  onSaveTemplate,
  onOpenSettings,
  onUseTemplate,
  onUseRepeat
}: {
  accountLabel: string;
  accounts: MoneyAccount[];
  amountText: string;
  categoryLabels: SpendingContext[];
  context: SpendingContext;
  entryType: CaptureType;
  fromAccount: string;
  label: string;
  latestBalanceTotal: number;
  manualTemplates: ManualTemplate[];
  monthlyPlan: MonthlyPlan | null;
  monthlySummary: MonthlySummary;
  note: string;
  repeatSuggestions: RepeatSuggestion[];
  source: string;
  toAccount: string;
  onChangeAmount: (value: string) => void;
  onChangeAccount: (value: string) => void;
  onChangeContext: (value: SpendingContext) => void;
  onChangeEntryType: (value: CaptureType) => void;
  onChangeFromAccount: (value: string) => void;
  onChangeLabel: (value: string) => void;
  onChangeNote: (value: string) => void;
  onChangeSource: (value: string) => void;
  onChangeToAccount: (value: string) => void;
  onDeleteTemplate: (id: string) => void;
  onSave: () => void;
  onSaveTemplate: () => void;
  onOpenSettings: () => void;
  onUseTemplate: (template: ManualTemplate) => void;
  onUseRepeat: (suggestion: RepeatSuggestion) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(Boolean(note));

  useEffect(() => {
    if (note) {
      setNoteOpen(true);
    }
  }, [note]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <HomeMoneyPulse
        latestBalanceTotal={latestBalanceTotal}
        monthlyPlan={monthlyPlan}
        monthlySummary={monthlySummary}
      />

      <View style={styles.capturePanel}>
        <Text style={styles.kicker}>Quick capture</Text>
        {manualTemplates.length > 0 && (
          <View style={styles.repeatBlock}>
            <Text style={styles.microLabel}>Manual shortcuts</Text>
            <View style={styles.templateGrid}>
              {manualTemplates.slice(0, 6).map((template) => (
                <View key={template.id} style={styles.templateChip}>
                  <Pressable onPress={() => onUseTemplate(template)} style={styles.templateMain}>
                    <Text style={styles.repeatText}>{getTemplateLabel(template)}</Text>
                    <Text style={styles.repeatAmount}>
                      {template.amount > 0 ? formatRupiah(template.amount) : template.type === "income" ? "Income" : template.context}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => onDeleteTemplate(template.id)} style={styles.templateRemoveButton}>
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
          selected={entryType}
          onSelect={onChangeEntryType}
        />
        <View style={styles.amountRow}>
          <Text style={styles.currencyPrefix}>Rp</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={onChangeAmount}
            placeholder="0"
            placeholderTextColor={colors.muted}
            style={styles.amountInput}
            value={amountText}
          />
        </View>

        {entryType === "transfer" ? (
          <View style={styles.transferPickerBlock}>
            <AccountPicker
              accounts={accounts}
              label="From"
              selected={fromAccount}
              onSelect={onChangeFromAccount}
            />
            <AccountPicker
              accounts={accounts.filter((account) => account.label !== fromAccount)}
              label="To"
              selected={toAccount === fromAccount ? "" : toAccount}
              onSelect={onChangeToAccount}
            />
          </View>
        ) : entryType === "income" ? (
          <TextInput
            onChangeText={onChangeSource}
            placeholder="Source, optional"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={source}
          />
        ) : (
          <TextInput
            onChangeText={onChangeLabel}
            placeholder="Label, optional"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={label}
          />
        )}

        {entryType !== "transfer" && (
          <AccountPicker
            accounts={accounts}
            label={entryType === "income" ? "Received in" : "Paid from"}
            selected={accountLabel}
            onSelect={onChangeAccount}
          />
        )}

        {entryType === "expense" && repeatSuggestions.length > 0 && (
          <View style={styles.repeatBlock}>
            <Text style={styles.microLabel}>Repeat faster</Text>
            <View style={styles.suggestionRow}>
              {repeatSuggestions.map((item) => (
                <Pressable key={`${item.label}-${item.context}`} onPress={() => onUseRepeat(item)} style={styles.repeatChip}>
                  <Text style={styles.repeatText}>{item.label}</Text>
                  <Text style={styles.repeatAmount}>{formatCompactRupiah(item.amount)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {entryType === "expense" && (
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
            <ContextPicker categories={categoryLabels} selected={context} onSelect={onChangeContext} />
          </>
          )
        )}

        {noteOpen ? (
          <TextInput
            multiline
            onChangeText={onChangeNote}
            placeholder="Tiny note, optional"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.noteInput]}
            value={note}
          />
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setNoteOpen(true)} style={styles.addNoteButton}>
            <Ionicons name="create-outline" size={16} color={colors.muted} />
            <Text style={styles.addNoteText}>Add note only if it helps recall</Text>
          </Pressable>
        )}

        <Pressable accessibilityRole="button" onPress={onSave} style={styles.primaryButton}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.surface} />
          <Text style={styles.primaryButtonText}>
            {entryType === "income" ? "Save income" : entryType === "transfer" ? "Save transfer" : "Save memory"}
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onSaveTemplate} style={styles.secondaryInlineButton}>
          <Ionicons name="bookmark-outline" size={16} color={colors.greenDark} />
          <Text style={styles.textButtonLabel}>Save as shortcut</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
