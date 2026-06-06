import React, { memo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { componentStyles } from "../theme/styles/components";

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
  const segments = options.map((option) => {
    const active = option.value === selected;
    return (
      <Pressable
        accessibilityRole="button"
        key={option.value}
        onPress={() => onSelect(option.value)}
        style={[
          componentStyles.segmentButton,
          compact && componentStyles.segmentButtonCompact,
          stretch && componentStyles.segmentButtonStretch,
          active && componentStyles.segmentButtonActive
        ]}
      >
        <Text numberOfLines={1} style={[componentStyles.segmentButtonText, active && componentStyles.segmentButtonTextActive]}>
          {option.label}
        </Text>
      </Pressable>
    );
  });

  if (stretch) {
    return (
      <View
        style={[
          componentStyles.segmentedControl,
          componentStyles.segmentedControlStretch,
          compact && componentStyles.segmentedControlCompact
        ]}
      >
        <View style={[componentStyles.segmentedControlContent, componentStyles.segmentedControlContentStretch]}>
          {segments}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[componentStyles.segmentedControl, compact && componentStyles.segmentedControlCompact]}
      contentContainerStyle={componentStyles.segmentedControlContent}
    >
      {segments}
    </ScrollView>
  );
}

export const SegmentedControl = memo(SegmentedControlComponent) as typeof SegmentedControlComponent;