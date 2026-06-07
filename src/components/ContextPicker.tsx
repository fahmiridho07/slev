import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { SpendingContext } from "../features/spendingMemory.types";
import { useTheme } from "../hooks/useTheme";

type ContextPickerProps = {
  categories: SpendingContext[];
  compact?: boolean;
  selected: SpendingContext;
  onSelect: (context: SpendingContext) => void;
};

function ContextPickerComponent({
  categories,
  compact = false,
  selected,
  onSelect
}: ContextPickerProps) {
  const { componentStyles, strings } = useTheme();

  function getContextHint(context: SpendingContext): string {
    const hints = strings.capture.contextHints;
    return hints[context as keyof typeof hints] ?? hints.custom;
  }

  return (
    <View style={componentStyles.contextPickerBlock}>
      <View style={compact ? componentStyles.contextWrapCompact : componentStyles.contextWrap}>
        {categories.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item}
            onPress={() => {
              if (item !== selected) {
                onSelect(item);
              }
            }}
            style={[componentStyles.contextChip, selected === item && componentStyles.contextChipActive]}
          >
            <Text style={[componentStyles.contextChipText, selected === item && componentStyles.contextChipTextActive]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      {!compact && (
        <View style={componentStyles.contextHintBox}>
          <Text numberOfLines={2} style={componentStyles.contextHint}>
            {getContextHint(selected)}
          </Text>
        </View>
      )}
    </View>
  );
}

export const ContextPicker = memo(ContextPickerComponent);