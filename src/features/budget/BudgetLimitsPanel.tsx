import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { DeleteConfirmDialog, EmptyState, SegmentedControl, SwipeActionRow } from "../../components";
import { CategoryModeValue } from "../app.types";
import { getCategoryDeleteBody, getMomentsInPeriod, sumExpenseMoments } from "../../lib/analysis";
import { formatAmountInput } from "../../lib/formatMoney";
import { getModeByCategory } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { BudgetLimit, BudgetPeriod, CategoryMode, ExpenseCategory, SpendingContext, SpendingMoment } from "../spendingMemory.types";
import { colors } from "../../theme/colors";
import { styles } from "../../theme/styles/app";
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
    setEditingCategory(category);
    setDraftAmount(limit ? formatAmountInput(String(limit.limitAmount)) : "");
    setDraftPeriod(limit?.period ?? "weekly");
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        text="No expense categories are active, so budget limits have nowhere to attach."
        actionLabel="Open Settings"
        onAction={onOpenSettings}
      />
    );
  }

  return (
    <View style={styles.listPanel}>
      {rows.map((row) => (
        <SwipeActionRow
          canDelete={Boolean(row.categoryMeta)}
          key={row.category}
          onDelete={() => {
            if (row.categoryMeta) {
              setPendingDeleteCategory(row.categoryMeta);
            }
          }}
        >
          <View style={styles.budgetRow}>
            <View style={styles.budgetHeader}>
              <View style={styles.budgetTitleBlock}>
                <Text style={styles.budgetCategory}>{row.category}</Text>
                <Text style={styles.budgetMeta}>
                  {row.limit
                    ? `${formatCompactRupiah(row.spent)} of ${formatCompactRupiah(row.limit.limitAmount)} ${row.period}`
                    : `No limit set - ${formatCompactRupiah(row.spent)} this month`}
                </Text>
              </View>
              <Pressable onPress={() => startEditing(row.category)} style={styles.textButton}>
                <Ionicons name={row.limit ? "create-outline" : "add-circle-outline"} size={16} color={colors.greenDark} />
                <Text style={styles.textButtonLabel}>{row.limit ? "Edit" : "Set"}</Text>
              </Pressable>
            </View>

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
                <View style={[styles.progressFill, getProgressFillStyle(row.progress)]} />
              </View>
            )}

            {editingCategory === row.category && (
              <View style={styles.inlineEditor}>
                <TextInput
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
                      onPress={() => {
                        onDeleteLimit(row.category);
                        setEditingCategory(null);
                      }}
                      style={styles.secondaryButton}
                    >
                      <Text style={styles.deleteText}>Delete limit</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => setEditingCategory(null)} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
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
        </SwipeActionRow>
      ))}
      <DeleteConfirmDialog
        body={pendingDeleteCategory ? getCategoryDeleteBody(pendingDeleteCategory) : ""}
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
        title={pendingDeleteCategory?.isDefault ? "Remove default category?" : "Delete category?"}
        visible={Boolean(pendingDeleteCategory)}
      />
    </View>
  );
}
