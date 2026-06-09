import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { EmptyState, ListActionsOnboardingTip } from "../../components";
import { useListActionsHint } from "../../hooks/useListActionsHint";
import { hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { ExpenseCategory, MoneyAccount } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
import { CategoryFieldError } from "./settingsValidation";
import { CategorySettingsList } from "./CategorySettingsList";

type CategorySettingsPanelProps = {
  accounts: MoneyAccount[];
  categories: ExpenseCategory[];
  onDelete: (category: ExpenseCategory) => void;
  onEdit: (category: ExpenseCategory) => void;
  onSaveCategory: (input: { label: string }) => Promise<{ ok: boolean; validation?: FormValidationError<CategoryFieldError> }>;
};

export function CategorySettingsPanel({
  accounts,
  categories,
  onDelete,
  onEdit,
  onSaveCategory
}: CategorySettingsPanelProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const categoryStrings = strings.settings.categories;
  const [categoryDraft, setCategoryDraft] = useState("");
  const [fieldError, setFieldError] = useState<FormValidationError<CategoryFieldError> | null>(null);
  const { dismiss: dismissHint, visible: showHint } = useListActionsHint(
    "settings_categories",
    categories.length > 0
  );

  function resetDraft() {
    setCategoryDraft("");
    setFieldError(null);
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
            accounts={accounts}
            categories={categories}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </>
      )}
    </View>
  );
}