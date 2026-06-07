import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { hapticSelection } from "../lib/haptics";

type ScreenTabBarProps<T extends string> = {
  options: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: T;
  }[];
  selected: T;
  onSelect: (value: T) => void;
};

function ScreenTabBarComponent<T extends string>({
  options,
  selected,
  onSelect
}: ScreenTabBarProps<T>) {
  const { colors, componentStyles } = useTheme();

  return (
    <View style={componentStyles.screenTabBar}>
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            accessibilityLabel={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={option.value}
            onPress={() => {
              if (!active) {
                hapticSelection();
              }
              onSelect(option.value);
            }}
            style={[componentStyles.screenTabItem, active && componentStyles.screenTabItemActive]}
          >
            <Ionicons
              color={active ? colors.greenDark : colors.muted}
              name={option.icon}
              size={20}
            />
            <Text
              numberOfLines={2}
              style={[componentStyles.screenTabLabel, active && componentStyles.screenTabLabelActive]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const ScreenTabBar = memo(ScreenTabBarComponent) as typeof ScreenTabBarComponent;