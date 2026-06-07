import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { displayContext } from "../i18n/display";
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
            {getContextHint(selected)}
          </Text>
        </View>
      )}
    </View>
  );
}

export const ContextPicker = memo(ContextPickerComponent);