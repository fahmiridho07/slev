import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { BottomSheet, DeleteConfirmDialog, EmptyState, ListActionRow, ProgressBar, SegmentedControl } from "../../components";
import { CategoryModeValue } from "../app.types";
import { formatString, getCategoryDeleteMessage } from "../../i18n";
import { getMomentsInPeriod, sumExpenseMoments } from "../../lib/analysis";
import { getModeByCategory } from "../../lib/financeEngine";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { BudgetLimit, BudgetPeriod, CategoryMode, ExpenseCategory, SpendingContext, SpendingMoment } from "../spendingMemory.types";
import { hapticSelection } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useTheme } from "../../hooks/useTheme";
import { getProgressFillStyle } from "../../theme/styles/fillStyles";
import { LimitFieldError } from "./budgetValidation";
import { LimitEditForm } from "./LimitEditForm";

export function BudgetLimitsPanel({
  budgetLimits,
  categoryLabels,
  categoryModes,
  expenseCategories,
  moments,
  onDeleteCategory,
  onOpenSettings,
  onSaveCategoryMode
}: {
  budgetLimits: BudgetLimit[];
  categoryLabels: SpendingContext[];
  categoryModes: CategoryMode[];
  expenseCategories: ExpenseCategory[];
  moments: SpendingMoment[];
  onDeleteCategory: (category: ExpenseCategory) => void;
  onDeleteLimit?: (category: SpendingContext) => void;
  onOpenSettings: () => void;
  onSaveCategoryMode: (category: SpendingContext, mode: CategoryModeValue) => void;
  onSaveLimit?: (
    category: SpendingContext,
    amountText: string,
    period: BudgetPeriod
  ) => Promise<{ ok: boolean; validation?: FormValidationError<LimitFieldError> }>;
}) {
  const { colors, strings, styles } = useTheme();
  const limitsStrings = strings.budget.limits;
  const limitEditAction = strings.common.edit;
  const [editingCategory, setEditingCategory] = useState<SpendingContext | null>(null);
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
  const editingLimit = editingCategory ? limitByCategory.get(editingCategory) : undefined;

  function startEditing(category: SpendingContext) {
    hapticSelection();
    setEditingCategory(category);
  }

  function periodLabel(period: BudgetPeriod) {
    return period === "weekly" ? limitsStrings.weekly : limitsStrings.monthly;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        actionLabel={strings.common.openSettings}
        onAction={onOpenSettings}
        text={limitsStrings.emptyNoCategories}
      />
    );
  }

  return (
    <View style={styles.listPanel}>
      {rows.map((row) => (
        <View key={row.category} style={styles.budgetRow}>
          <ListActionRow
            accessibilityLabel={formatString(limitsStrings.editLimitA11y, {
              action: row.limit ? limitEditAction : limitsStrings.setLimit,
              category: row.category
            })}
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
                    ? formatString(limitsStrings.spentOfLimit, {
                        spent: formatRupiah(row.spent),
                        limit: formatRupiah(row.limit.limitAmount),
                        period: periodLabel(row.period)
                      })
                    : formatString(limitsStrings.noLimitSpent, {
                        spent: formatRupiah(row.spent)
                      })}
                </Text>
              </View>
            </View>
          </ListActionRow>

          <SegmentedControl
            compact
            options={[
              { label: limitsStrings.fixed, value: "fixed" },
              { label: limitsStrings.flexible, value: "flexible" }
            ]}
            selected={row.mode}
            onSelect={(mode) => onSaveCategoryMode(row.category, mode)}
          />

          {row.limit && (
            <ProgressBar
              accessibilityLabel={formatString(strings.common.progressA11y, {
                label: row.category,
                percent: Math.round(row.progress * 100)
              })}
              fillStyle={[styles.progressFill, getProgressFillStyle(row.progress, colors)]}
              value={row.progress}
            />
          )}
        </View>
      ))}
      <BottomSheet
        onClose={() => setEditingCategory(null)}
        title={
          editingCategory
            ? formatString(limitsStrings.editLimitA11y, {
                action: editingLimit ? limitEditAction : limitsStrings.setLimit,
                category: editingCategory
              })
            : limitsStrings.setLimit
        }
        visible={Boolean(editingCategory)}
      >
        {editingCategory ? (
          <LimitEditForm
            key={editingCategory}
            category={editingCategory}
            limit={editingLimit}
            onCancel={() => setEditingCategory(null)}
            onSaved={() => setEditingCategory(null)}
          />
        ) : null}
      </BottomSheet>
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