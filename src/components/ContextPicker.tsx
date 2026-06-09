import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { displayContext, getCategoryHint } from "../i18n/display";
import { ExpenseCategory, SpendingContext } from "../features/spendingMemory.types";
import { useTheme } from "../hooks/useTheme";

type ContextPickerProps = {
  categories: SpendingContext[];
  compact?: boolean;
  expenseCategories?: ExpenseCategory[];
  selected: SpendingContext;
  onSelect: (context: SpendingContext) => void;
};

function ContextPickerComponent({
  categories,
  compact = false,
  expenseCategories = [],
  selected,
  onSelect
}: ContextPickerProps) {
  const { componentStyles, strings } = useTheme();

  const wrapStyle = compact ? componentStyles.contextWrapCompact : componentStyles.contextWrap;

  return (
    <View style={componentStyles.contextPickerBlock}>
      <View style={wrapStyle}>
        {categories.map((item) => {
          const active = selected === item;
          return (
            <Pressable
              accessibilityLabel={displayContext(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={item}
              onPress={() => {
                if (!active) {
                  onSelect(item);
                }
              }}
              style={[componentStyles.contextChip, active && componentStyles.contextChipActive]}
            >
              <Text style={[componentStyles.contextChipText, active && componentStyles.contextChipTextActive]}>
                {displayContext(item)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!compact && (
        <View style={componentStyles.contextHintBox}>
          <Text numberOfLines={2} style={componentStyles.contextHint}>
            {getCategoryHint(selected, expenseCategories, strings)}
          </Text>
        </View>
      )}
    </View>
  );
}

export const ContextPicker = memo(ContextPickerComponent);