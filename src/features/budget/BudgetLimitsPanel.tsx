import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { DeleteConfirmDialog, EmptyState, ListActionRow, ProgressBar, SegmentedControl } from "../../components";
import { CategoryModeValue } from "../app.types";
import { formatString, getCategoryDeleteMessage } from "../../i18n";
import { getMomentsInPeriod, sumExpenseMoments } from "../../lib/analysis";
import { formatAmountInput } from "../../lib/formatMoney";
import { getModeByCategory } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { BudgetLimit, BudgetPeriod, CategoryMode, ExpenseCategory, SpendingContext, SpendingMoment } from "../spendingMemory.types";
import { hapticSelection, hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useTheme } from "../../hooks/useTheme";
import { getProgressFillStyle } from "../../theme/styles/fillStyles";
import { LimitFieldError } from "./budgetValidation";

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
  onSaveLimit: (
    category: SpendingContext,
    amountText: string,
    period: BudgetPeriod
  ) => Promise<{ ok: boolean; validation?: FormValidationError<LimitFieldError> }>;
}) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const limitsStrings = strings.budget.limits;
  const limitEditAction = strings.common.edit;
  const [editingCategory, setEditingCategory] = useState<SpendingContext | null>(null);
  const [draftAmount, setDraftAmount] = useState("");
  const [draftPeriod, setDraftPeriod] = useState<BudgetPeriod>("weekly");
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<ExpenseCategory | null>(null);
  const [limitFieldError, setLimitFieldError] = useState<FormValidationError<LimitFieldError> | null>(null);
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
    hapticSelection();
    const limit = limitByCategory.get(category);
    setEditingCategory(category);
    setDraftAmount(limit ? formatAmountInput(String(limit.limitAmount)) : "");
    setDraftPeriod(limit?.period ?? "weekly");
    setLimitFieldError(null);
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
                        spent: formatCompactRupiah(row.spent),
                        limit: formatCompactRupiah(row.limit.limitAmount),
                        period: periodLabel(row.period)
                      })
                    : formatString(limitsStrings.noLimitSpent, {
                        spent: formatCompactRupiah(row.spent)
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

          {editingCategory === row.category && (
            <View style={styles.inlineEditor}>
              <TextInput
                accessibilityLabel={
                  limitFieldError?.field === "amount"
                    ? `${formatString(limitsStrings.limitAmountA11y, { category: row.category })}. ${limitFieldError.message}`
                    : formatString(limitsStrings.limitAmountA11y, { category: row.category })
                }
                keyboardType="number-pad"
                onChangeText={(value) => {
                  setLimitFieldError((current) => (current?.field === "amount" ? null : current));
                  setDraftAmount(formatAmountInput(value));
                }}
                placeholder={limitsStrings.limitAmountPlaceholder}
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={draftAmount}
              />
              {limitFieldError?.field === "amount" && (
                <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
                  {limitFieldError.message}
                </Text>
              )}
              <SegmentedControl
                compact
                options={[
                  { label: limitsStrings.weekly, value: "weekly" },
                  { label: limitsStrings.monthly, value: "monthly" }
                ]}
                selected={draftPeriod}
                onSelect={setDraftPeriod}
              />
              <View style={componentStyles.editActions}>
                {row.limit && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      onDeleteLimit(row.category);
                      setEditingCategory(null);
                    }}
                    style={styles.secondaryButton}
                  >
                    <Text style={componentStyles.deleteText}>{limitsStrings.deleteLimit}</Text>
                  </Pressable>
                )}
                <Pressable accessibilityRole="button" onPress={() => setEditingCategory(null)} style={styles.secondaryButton}>
                  <Text style={componentStyles.secondaryButtonText}>{strings.common.cancel}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    void (async () => {
                      const result = await onSaveLimit(row.category, draftAmount, draftPeriod);
                      if (!result.ok) {
                        hapticWarning();
                        if (result.validation) {
                          setLimitFieldError(result.validation);
                        }
                        return;
                      }
                      setLimitFieldError(null);
                      setEditingCategory(null);
                    })();
                  }}
                  style={styles.smallPrimaryButton}
                >
                  <Text style={styles.primaryButtonText}>{strings.common.save}</Text>
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