import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { BottomSheet, DeleteConfirmDialog, EmptyState, ListActionsOnboardingTip } from "../../components";
import { useExpenseCategoryOrder } from "../../hooks/useExpenseCategoryOrder";
import { useListActionsHint } from "../../hooks/useListActionsHint";
import { formatString, getCategoryDeleteMessage } from "../../i18n";
import { hapticSelection, hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { ExpenseCategory, MoneyAccount } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
import { CategoryFieldError } from "./settingsValidation";
import { CategoryEditForm } from "./CategoryEditForm";
import { CategorySettingsList } from "./CategorySettingsList";

type CategorySettingsPanelProps = {
  accounts: MoneyAccount[];
  categories: ExpenseCategory[];
  onRemoveCategory: (category: ExpenseCategory) => void;
  onSaveCategory: (input: { label: string }) => Promise<{ ok: boolean; validation?: FormValidationError<CategoryFieldError> }>;
};

export function CategorySettingsPanel({
  accounts,
  categories,
  onRemoveCategory,
  onSaveCategory
}: CategorySettingsPanelProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const categoryStrings = strings.settings.categories;
  const [categoryDraft, setCategoryDraft] = useState("");
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [fieldError, setFieldError] = useState<FormValidationError<CategoryFieldError> | null>(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<ExpenseCategory | null>(null);
  const { dismiss: dismissHint, visible: showHint } = useListActionsHint(
    "settings_categories",
    categories.length > 0
  );
  const { getCategoryOrderState, orderedExpenseCategories } = useExpenseCategoryOrder(categories, accounts);
  const editingOrder = editingCategory ? getCategoryOrderState(editingCategory.label) : null;

  function resetDraft() {
    setCategoryDraft("");
    setFieldError(null);
  }

  function editCategory(category: ExpenseCategory) {
    hapticSelection();
    setEditingCategory(category);
  }

  return (
    <View style={styles.cardStack}>
      <View style={styles.capturePanel}>
        <Text style={componentStyles.microLabel}>{categoryStrings.add}</Text>
        <TextInput
          accessibilityLabel={
            fieldError?.field === "label"
              ? `${categoryStrings.nameA11y}. ${fieldError.message}`
              : categoryStrings.nameA11y
          }
          onChangeText={(value) => {
            setFieldError((current) => (current?.field === "label" ? null : current));
            setCategoryDraft(value);
          }}
          placeholder={categoryStrings.placeholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={categoryDraft}
        />
        {fieldError?.field === "label" && (
          <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
            {fieldError.message}
          </Text>
        )}
        <View style={componentStyles.editActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void (async () => {
                const result = await onSaveCategory({ label: categoryDraft });
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
            <Text style={styles.primaryButtonText}>{categoryStrings.save}</Text>
          </Pressable>
        </View>
      </View>

      {categories.length === 0 ? (
        <EmptyState text={categoryStrings.empty} />
      ) : (
        <>
          {showHint ? (
            <ListActionsOnboardingTip
              body={strings.listHints.settings_categories.body}
              onDismiss={dismissHint}
              title={strings.listHints.settings_categories.title}
            />
          ) : null}
          <CategorySettingsList
            categories={orderedExpenseCategories}
            onDelete={setPendingDeleteCategory}
            onEdit={editCategory}
          />
        </>
      )}

      <BottomSheet
        onClose={() => setEditingCategory(null)}
        title={
          editingCategory
            ? formatString(categoryStrings.editA11y, { label: editingCategory.label })
            : categoryStrings.edit
        }
        visible={Boolean(editingCategory)}
      >
        {editingCategory && editingOrder ? (
          <CategoryEditForm
            key={editingCategory.id}
            canMoveEarlier={editingOrder.canMoveEarlier}
            canMoveLater={editingOrder.canMoveLater}
            category={editingCategory}
            onCancel={() => setEditingCategory(null)}
            onMoveEarlier={editingOrder.moveEarlier}
            onMoveLater={editingOrder.moveLater}
            onSaved={() => setEditingCategory(null)}
          />
        ) : null}
      </BottomSheet>

      <DeleteConfirmDialog
        body={pendingDeleteCategory ? getCategoryDeleteMessage(pendingDeleteCategory) : ""}
        onCancel={() => setPendingDeleteCategory(null)}
        onConfirm={() => {
          if (pendingDeleteCategory) {
            onRemoveCategory(pendingDeleteCategory);
            if (editingCategory?.id === pendingDeleteCategory.id) {
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