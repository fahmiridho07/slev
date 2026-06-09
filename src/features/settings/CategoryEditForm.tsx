import React, { memo, useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useActions } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";
import { ExpenseCategory } from "../spendingMemory.types";
import { CategoryFieldError } from "./settingsValidation";

type CategoryEditFormProps = {
  category: ExpenseCategory;
  onCancel: () => void;
  onSaved: () => void;
};

function CategoryEditFormComponent({ category, onCancel, onSaved }: CategoryEditFormProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const actions = useActions();
  const [categoryDraft, setCategoryDraft] = useState(category.label);
  const [fieldError, setFieldError] = useState<FormValidationError<CategoryFieldError> | null>(null);

  const save = useCallback(async () => {
    const result = await actions.saveCategory({ id: category.id, label: categoryDraft });
    if (!result.ok) {
      hapticWarning();
      if (result.validation) {
        setFieldError(result.validation);
      }
      return;
    }
    setFieldError(null);
    onSaved();
  }, [actions, category.id, categoryDraft, onSaved]);

  return (
    <View style={componentStyles.sheetForm}>
      <ScrollView
        contentContainerStyle={styles.repeatBlock}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={componentStyles.sheetScroll}
      >
        <TextInput
          accessibilityLabel={
            fieldError?.field === "label"
              ? `${strings.settings.categories.nameA11y}. ${fieldError.message}`
              : strings.settings.categories.nameA11y
          }
          onChangeText={(value) => {
            setFieldError((current) => (current?.field === "label" ? null : current));
            setCategoryDraft(value);
          }}
          placeholder={strings.settings.categories.placeholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={categoryDraft}
        />
        {fieldError?.field === "label" && (
          <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
            {fieldError.message}
          </Text>
        )}
        {category.isDefault ? (
          <Text style={styles.settingCopy}>{strings.settings.categories.defaultRenameHint}</Text>
        ) : (
          <Text style={styles.settingCopy}>{strings.settings.categories.renameHint}</Text>
        )}
      </ScrollView>
      <View style={componentStyles.sheetFooter}>
        <View style={componentStyles.editActions}>
          <Pressable accessibilityLabel={strings.common.cancel} accessibilityRole="button" onPress={onCancel} style={styles.secondaryButton}>
            <Text style={componentStyles.secondaryButtonText}>{strings.common.cancel}</Text>
          </Pressable>
          <Pressable accessibilityLabel={strings.settings.categories.save} accessibilityRole="button" onPress={() => void save()} style={styles.smallPrimaryButton}>
            <Text style={styles.primaryButtonText}>{strings.settings.categories.save}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const CategoryEditForm = memo(CategoryEditFormComponent);