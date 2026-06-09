import React, { memo, useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useActions } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";
import { ExpenseCategory } from "../spendingMemory.types";
import { CategoryFieldError } from "./settingsValidation";

type CategoryEditFormProps = {
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  category: ExpenseCategory;
  onCancel: () => void;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  onSaved: () => void;
};

function CategoryEditFormComponent({
  canMoveEarlier,
  canMoveLater,
  category,
  onCancel,
  onMoveEarlier,
  onMoveLater,
  onSaved
}: CategoryEditFormProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const categoryStrings = strings.settings.categories;
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
        <Text style={styles.settingCopy}>
          {category.isDefault ? categoryStrings.defaultRenameHint : categoryStrings.renameHint}
        </Text>

        <Text style={componentStyles.microLabel}>{categoryStrings.orderLabel}</Text>
        <View style={componentStyles.editActions}>
          <Pressable
            accessibilityLabel={categoryStrings.moveEarlier}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canMoveEarlier }}
            disabled={!canMoveEarlier}
            onPress={onMoveEarlier}
            style={[styles.secondaryButton, styles.categoryOrderButton, !canMoveEarlier && styles.categoryOrderButtonDisabled]}
          >
            <Text style={componentStyles.secondaryButtonText}>{categoryStrings.moveEarlier}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={categoryStrings.moveLater}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canMoveLater }}
            disabled={!canMoveLater}
            onPress={onMoveLater}
            style={[styles.secondaryButton, styles.categoryOrderButton, !canMoveLater && styles.categoryOrderButtonDisabled]}
          >
            <Text style={componentStyles.secondaryButtonText}>{categoryStrings.moveLater}</Text>
          </Pressable>
        </View>
        <Text style={styles.settingCopy}>{categoryStrings.orderHint}</Text>
      </ScrollView>
      <View style={componentStyles.sheetFooter}>
        <View style={componentStyles.editActions}>
          <Pressable accessibilityLabel={strings.common.cancel} accessibilityRole="button" onPress={onCancel} style={styles.secondaryButton}>
            <Text style={componentStyles.secondaryButtonText}>{strings.common.cancel}</Text>
          </Pressable>
          <Pressable accessibilityLabel={categoryStrings.save} accessibilityRole="button" onPress={() => void save()} style={styles.smallPrimaryButton}>
            <Text style={styles.primaryButtonText}>{categoryStrings.save}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const CategoryEditForm = memo(CategoryEditFormComponent);