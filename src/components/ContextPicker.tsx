import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { displayContext } from "../i18n/display";
import { SpendingContext } from "../features/spendingMemory.types";
import { useTheme } from "../hooks/useTheme";
import { ReorderableChipGrid } from "./ReorderableChipGrid";

type ContextPickerProps = {
  categories: SpendingContext[];
  compact?: boolean;
  onReorder?: (categories: SpendingContext[]) => void;
  reorderable?: boolean;
  selected: SpendingContext;
  onSelect: (context: SpendingContext) => void;
};

function ContextPickerComponent({
  categories,
  compact = false,
  onReorder,
  reorderable = false,
  selected,
  onSelect
}: ContextPickerProps) {
  const { componentStyles, strings } = useTheme();

  function getContextHint(context: SpendingContext): string {
    const hints = strings.capture.contextHints;
    return hints[context as keyof typeof hints] ?? hints.custom;
  }

  const wrapStyle = compact ? componentStyles.contextWrapCompact : componentStyles.contextWrap;

  return (
    <View style={componentStyles.contextPickerBlock}>
      {reorderable && onReorder ? (
        <ReorderableChipGrid
          chipAccessibilityLabel={(item) => displayContext(item)}
          chipStyle={(active, dragging, hover) => [
            componentStyles.contextChip,
            active && componentStyles.contextChipActive,
            dragging && componentStyles.chipDragging,
            hover && componentStyles.chipDropTarget
          ]}
          getKey={(item) => item}
          items={categories}
          onReorder={onReorder}
          onSelect={onSelect}
          renderChip={(item, active) => (
            <Text style={[componentStyles.contextChipText, active && componentStyles.contextChipTextActive]}>
              {displayContext(item)}
            </Text>
          )}
          selectedKey={selected}
          wrapStyle={wrapStyle}
        />
      ) : (
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
      )}

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