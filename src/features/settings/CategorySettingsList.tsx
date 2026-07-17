import React from "react";
import { Text, View } from "react-native";
import { ListActionRow } from "../../components";
import { displayContext, getCategoryHint } from "../../i18n/display";
import { formatString } from "../../i18n";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { ExpenseCategory } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";

type CategorySettingsListProps = {
  categories: ExpenseCategory[];
  onDelete: (category: ExpenseCategory) => void;
  onEdit: (category: ExpenseCategory) => void;
};

export function CategorySettingsList({ categories, onDelete, onEdit }: CategorySettingsListProps) {
  const { componentStyles, strings, styles } = useTheme();
  const categoryStrings = strings.settings.categories;

  return (
    <View style={styles.listPanel}>
      {categories.map((category, index) => {
        const displayLabel = displayContext(category.label);
        const hint = getCategoryHint(category.label, categories, strings);

        return (
          <View
            key={category.id}
            style={[
              index > 0 && styles.listPanelContinued,
              index < categories.length - 1 && styles.listPanelMiddle
            ]}
          >
            <ListActionRow
              accessibilityHint={strings.common.swipeToDelete}
              accessibilityLabel={formatString(categoryStrings.editA11y, { label: displayLabel })}
              onDelete={() => onDelete(category)}
              onPress={() => onEdit(category)}
              rowKey={category.id}
            >
              <View style={styles.analyticsRow}>
                <View style={styles.analyticsRowHeader}>
                  <Text numberOfLines={1} style={componentStyles.analyticsTitle}>
                    {displayLabel}
                  </Text>
                  <Text style={styles.analyticsAmount}>
                    {category.isDefault ? categoryStrings.default : categoryStrings.custom}
                  </Text>
                </View>
                <Text numberOfLines={2} style={styles.settingCopy}>
                  {category.monthlyGuide
                    ? `${hint} · ${formatString(categoryStrings.guideMeta, {
                        amount: formatRupiah(category.monthlyGuide)
                      })}`
                    : hint}
                </Text>
              </View>
            </ListActionRow>
          </View>
        );
      })}
    </View>
  );
}