import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { DeleteConfirmDialog, EmptyState, ListActionRow, SegmentedControl } from "../../components";
import { CategoryModeValue } from "../app.types";
import { getCategoryDeleteMessage } from "../../i18n";
import { getMomentsInPeriod, sumExpenseMoments } from "../../lib/analysis";
import { formatAmountInput } from "../../lib/formatMoney";
import { getModeByCategory } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { BudgetLimit, BudgetPeriod, CategoryMode, ExpenseCategory, SpendingContext, SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
import { getProgressFillStyle } from "../../theme/styles/fillStyles";

export function BudgetLimitsPanel({
  budgetLimits,
  categoryLabels,
  categoryModes,
  expenseCategories,
  moments,
  onDeleteCategory,
  onDeleteLimit,
  onOpenSettings,
  onSaveCategoryMode,
  onSaveLimit
}: {
  budgetLimits: BudgetLimit[];
  categoryLabels: SpendingContext[];
  categoryModes: CategoryMode[];
  expenseCategories: ExpenseCategory[];
  moments: SpendingMoment[];
  onDeleteCategory: (category: ExpenseCategory) => void;
  onDeleteLimit: (category: SpendingContext) => void;
  onOpenSettings: () => void;
  onSaveCategoryMode: (category: SpendingContext, mode: CategoryModeValue) => void;
  onSaveLimit: (category: SpendingContext, amountText: string, period: BudgetPeriod) => void;
}) {
  const { colors, strings, styles } = useTheme();
  const [editingCategory, setEditingCategory] = useState<SpendingContext | null>(null);
  const [draftAmount, setDraftAmount] = useState("");
  const [draftPeriod, setDraftPeriod] = useState<BudgetPeriod>("weekly");
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<ExpenseCategory | null>(null);
  const limitByCategory = useMemo(
    () => new Map(budgetLimits.map((limit) => [limit.category, limit])),
    [budgetLimits]
  );
  const modeByCategory = useMemo(() => getModeByCategory(categoryModes), [categoryModes]);
  const rows = useMemo(
    () =>
      categoryLabels.map((category) => {
        const categoryMeta = expenseCategories.find((item) => item.label === category);
        const limit = limitByCategory.get(category);
        const period = limit?.period ?? "monthly";
        const spent = sumExpenseMoments(getMomentsInPeriod(moments, period).filter((moment) => moment.context === category));
        return {
          category,
          categoryMeta,
          limit,
          mode: modeByCategory.get(category) ?? "flexible",
          period,
          spent,
          progress: limit ? spent / limit.limitAmount : 0
        };
      }),
    [categoryLabels, expenseCategories, limitByCategory, modeByCategory, moments]
  );

  function startEditing(category: SpendingContext) {
    const limit = limitByCategory.get(category);
    setEditingCategory((current) => (current === category ? null : category));
    setDraftAmount(limit ? formatAmountInput(String(limit.limitAmount)) : "");
    setDraftPeriod(limit?.period ?? "weekly");
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        actionLabel="Open Settings"
        onAction={onOpenSettings}
        text="No expense categories are active, so budget limits have nowhere to attach."
      />
    );
  }

  return (
    <View style={styles.listPanel}>
      {rows.map((row) => (
        <View key={row.category} style={styles.budgetRow}>
          <ListActionRow
            accessibilityLabel={`${row.limit ? "Edit" : "Set"} limit for ${row.category}`}
            onDelete={
              row.categoryMeta
                ? () => setPendingDeleteCategory(row.categoryMeta!)
                : undefined
            }
            onPress={() => startEditing(row.category)}
          >
            <View style={styles.budgetHeader}>
              <View style={styles.budgetTitleBlock}>
                <Text style={styles.budgetCategory}>{row.category}</Text>
                <Text style={styles.budgetMeta}>
                  {row.limit
                    ? `${formatCompactRupiah(row.spent)} of ${formatCompactRupiah(row.limit.limitAmount)} ${row.period}`
                    : `No limit set - ${formatCompactRupiah(row.spent)} this month`}
                </Text>
              </View>
            </View>
          </ListActionRow>

          <SegmentedControl
            compact
            options={[
              { label: "Fixed", value: "fixed" },
              { label: "Flexible", value: "flexible" }
            ]}
            selected={row.mode}
            onSelect={(mode) => onSaveCategoryMode(row.category, mode)}
          />

          {row.limit && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, getProgressFillStyle(row.progress, colors)]} />
            </View>
          )}

          {editingCategory === row.category && (
            <View style={styles.inlineEditor}>
              <TextInput
                accessibilityLabel={`Limit amount for ${row.category}`}
                keyboardType="number-pad"
                onChangeText={(value) => setDraftAmount(formatAmountInput(value))}
                placeholder="Limit amount"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={draftAmount}
              />
              <SegmentedControl
                compact
                options={[
                  { label: "Weekly", value: "weekly" },
                  { label: "Monthly", value: "monthly" }
                ]}
                selected={draftPeriod}
                onSelect={setDraftPeriod}
              />
              <View style={styles.editActions}>
                {row.limit && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      onDeleteLimit(row.category);
                      setEditingCategory(null);
                    }}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.deleteText}>Delete limit</Text>
                  </Pressable>
                )}
                <Pressable accessibilityRole="button" onPress={() => setEditingCategory(null)} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    onSaveLimit(row.category, draftAmount, draftPeriod);
                    setEditingCategory(null);
                  }}
                  style={styles.smallPrimaryButton}
                >
                  <Text style={styles.primaryButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      ))}
      <DeleteConfirmDialog
        body={pendingDeleteCategory ? getCategoryDeleteMessage(pendingDeleteCategory) : ""}
        onCancel={() => setPendingDeleteCategory(null)}
        onConfirm={() => {
          if (pendingDeleteCategory) {
            onDeleteCategory(pendingDeleteCategory);
            if (editingCategory === pendingDeleteCategory.label) {
              setEditingCategory(null);
            }
            setPendingDeleteCategory(null);
          }
        }}
        title={
          pendingDeleteCategory?.isDefault
            ? strings.dialogs.categoryDeleteDefaultTitle
            : strings.dialogs.categoryDeleteTitle
        }
        visible={Boolean(pendingDeleteCategory)}
      />
    </View>
  );
}