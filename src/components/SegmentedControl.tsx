import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";

type SegmentedControlProps<T extends string> = {
  compact?: boolean;
  options: { label: string; value: T }[];
  selected: T;
  onSelect: (value: T) => void;
  stretch?: boolean;
};

function SegmentedControlComponent<T extends string>({
  compact = false,
  options,
  selected,
  onSelect,
  stretch = false
}: SegmentedControlProps<T>) {
  const { componentStyles } = useTheme();

  if (stretch) {
    return (
      <View style={[componentStyles.segmentedControl, componentStyles.segmentedControlStretch]}>
        <View style={[componentStyles.segmentedControlContent, componentStyles.segmentedControlContentStretch]}>
          {options.map((option) => {
            const active = option.value === selected;
            return (
              <Pressable
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={option.value}
                onPress={() => onSelect(option.value)}
                style={[
                  componentStyles.choiceChip,
                  componentStyles.choiceChipStretch,
                  active && componentStyles.choiceChipActive
                ]}
              >
                <Text
                  numberOfLines={2}
                  style={[componentStyles.choiceChipText, active && componentStyles.choiceChipTextActive]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        componentStyles.choiceChipWrap,
        compact && componentStyles.choiceChipWrapCompact
      ]}
    >
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            accessibilityLabel={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[componentStyles.choiceChip, active && componentStyles.choiceChipActive]}
          >
            <Text style={[componentStyles.choiceChipText, active && componentStyles.choiceChipTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const SegmentedControl = memo(SegmentedControlComponent) as typeof SegmentedControlComponent;