import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { hapticSelection } from "../lib/haptics";

type ScreenTabBarLayout = "equal" | "wrap";

type ScreenTabBarProps<T extends string> = {
  layout?: ScreenTabBarLayout;
  options: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: T;
  }[];
  selected: T;
  onSelect: (value: T) => void;
};

function ScreenTabBarComponent<T extends string>({
  layout = "equal",
  options,
  selected,
  onSelect
}: ScreenTabBarProps<T>) {
  const { colors, componentStyles } = useTheme();
  const isWrap = layout === "wrap";

  return (
    <View
      accessibilityRole="tablist"
      style={[componentStyles.screenTabBar, isWrap && componentStyles.screenTabBarWrap]}
    >
      {options.map((option, index) => {
        const active = option.value === selected;
        return (
          <Pressable
            accessibilityLabel={option.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={option.value}
            onPress={() => {
              if (!active) {
                hapticSelection();
              }
              onSelect(option.value);
            }}
            style={[
              componentStyles.screenTabItem,
              isWrap && componentStyles.screenTabItemWrap,
              isWrap && index >= 3 && componentStyles.screenTabItemWrapWide,
              active && componentStyles.screenTabItemActive
            ]}
          >
            <Ionicons
              color={active ? colors.greenDark : colors.muted}
              name={option.icon}
              size={20}
            />
            <Text
              numberOfLines={1}
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