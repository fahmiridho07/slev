import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { ListActionRow } from "../../components";
import { useCapturePickerOrder } from "../../hooks/useCapturePickerOrder";
import { displayContext } from "../../i18n/display";
import { formatString } from "../../i18n";
import { reorderItemsByKey } from "../../lib/applyItemOrder";
import { hapticSelection } from "../../lib/haptics";
import { ExpenseCategory, MoneyAccount, SpendingContext } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";

type CategorySettingsListProps = {
  accounts: MoneyAccount[];
  categories: ExpenseCategory[];
  onDelete: (category: ExpenseCategory) => void;
  onEdit: (category: ExpenseCategory) => void;
};

export function CategorySettingsList({
  accounts,
  categories,
  onDelete,
  onEdit
}: CategorySettingsListProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const categoryStrings = strings.settings.categories;
  const categoryLabels = useMemo(
    () => categories.map((category) => category.label),
    [categories]
  );
  const { orderedCategories, reorderCategories } = useCapturePickerOrder(categoryLabels, accounts);
  const categoryByLabel = useMemo(
    () => new Map(categories.map((category) => [category.label, category])),
    [categories]
  );
  const orderedExpenseCategories = useMemo(
    () =>
      orderedCategories
        .map((label) => categoryByLabel.get(label))
        .filter((category): category is ExpenseCategory => category !== undefined),
    [categoryByLabel, orderedCategories]
  );

  const moveCategory = useCallback(
    (category: ExpenseCategory, direction: "up" | "down") => {
      const index = orderedCategories.indexOf(category.label);
      if (index < 0) {
        return;
      }
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= orderedCategories.length) {
        return;
      }
      hapticSelection();
      const next = reorderItemsByKey(
        orderedCategories,
        category.label,
        orderedCategories[targetIndex] as SpendingContext,
        (label) => label
      );
      reorderCategories(next);
    },
    [orderedCategories, reorderCategories]
  );

  return (
    <View style={styles.listPanel}>
      <Text style={styles.captureReorderHint}>{categoryStrings.reorderHint}</Text>
      {orderedExpenseCategories.map((category, index) => {
        const displayLabel = displayContext(category.label);
        const canMoveUp = index > 0;
        const canMoveDown = index < orderedExpenseCategories.length - 1;

        return (
          <View
            key={category.id}
            style={[
              index > 0 && styles.listPanelContinued,
              index < orderedExpenseCategories.length - 1 && styles.listPanelMiddle
            ]}
          >
            <ListActionRow
              accessibilityHint={strings.common.swipeToDelete}
              accessibilityLabel={formatString(categoryStrings.editA11y, { label: displayLabel })}
              onDelete={() => onDelete(category)}
              onPress={() => onEdit(category)}
            >
              <View style={styles.categorySettingsRow}>
                <View style={styles.categorySettingsMain}>
                  <View style={styles.analyticsRowHeader}>
                    <Text style={componentStyles.analyticsTitle}>{displayLabel}</Text>
                    <Text style={styles.analyticsAmount}>
                      {category.isDefault ? categoryStrings.default : categoryStrings.custom}
                    </Text>
                  </View>
                  {category.isDefault ? (
                    <Text style={styles.settingCopy}>
                      {formatString(categoryStrings.defaultStoredAs, { label: category.label })}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.categoryReorderControls}>
                  <Pressable
                    accessibilityLabel={formatString(categoryStrings.moveUpA11y, { label: displayLabel })}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !canMoveUp }}
                    disabled={!canMoveUp}
                    onPress={() => moveCategory(category, "up")}
                    style={[styles.categoryReorderButton, !canMoveUp && styles.categoryReorderButtonDisabled]}
                  >
                    <Ionicons color={canMoveUp ? colors.greenDark : colors.line} name="chevron-up" size={18} />
                  </Pressable>
                  <Pressable
                    accessibilityLabel={formatString(categoryStrings.moveDownA11y, { label: displayLabel })}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !canMoveDown }}
                    disabled={!canMoveDown}
                    onPress={() => moveCategory(category, "down")}
                    style={[styles.categoryReorderButton, !canMoveDown && styles.categoryReorderButtonDisabled]}
                  >
                    <Ionicons color={canMoveDown ? colors.greenDark : colors.line} name="chevron-down" size={18} />
                  </Pressable>
                </View>
              </View>
            </ListActionRow>
          </View>
        );
      })}
    </View>
  );
}