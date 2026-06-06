import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { CONTEXT_HINTS } from "../data/spendingMemory";
import { SpendingContext } from "../features/spendingMemory.types";
import { componentStyles } from "../theme/styles/components";

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
  return (
    <View style={compact ? componentStyles.contextWrapCompact : componentStyles.contextWrap}>
      {categories.map((item) => (
        <Pressable
          accessibilityRole="button"
          key={item}
          onPress={() => onSelect(item)}
          style={[componentStyles.contextChip, selected === item && componentStyles.contextChipActive]}
        >
          <Text style={[componentStyles.contextChipText, selected === item && componentStyles.contextChipTextActive]}>
            {item}
          </Text>
          {!compact && selected === item && (
            <Text style={componentStyles.contextHint}>{CONTEXT_HINTS[item] ?? "Custom spending category"}</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

export const ContextPicker = memo(ContextPickerComponent);