import React, { memo } from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { SwipeActionRow } from "./SwipeActionRow";

type ListActionRowProps = {
  accessibilityLabel?: string;
  children: React.ReactNode;
  onDelete?: () => void;
  onPress?: () => void;
  style?: ViewStyle;
};

function ListActionRowComponent({
  accessibilityLabel,
  children,
  onDelete,
  onPress,
  style
}: ListActionRowProps) {
  const { componentStyles } = useTheme();
  const content = onPress ? (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[componentStyles.listActionPressable, style]}
    >
      {children}
    </Pressable>
  ) : (
    <View style={style}>{children}</View>
  );

  if (!onDelete) {
    return content;
  }

  return (
    <SwipeActionRow canDelete onDelete={onDelete}>
      {content}
    </SwipeActionRow>
  );
}

export const ListActionRow = memo(ListActionRowComponent);