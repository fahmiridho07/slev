import React, { memo } from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { SwipeActionRow } from "./SwipeActionRow";

type ListActionRowProps = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  children: React.ReactNode;
  onDelete?: () => void;
  onPress?: () => void;
  style?: ViewStyle;
};

function ListActionRowComponent({
  accessibilityHint,
  accessibilityLabel,
  children,
  onDelete,
  onPress,
  style
}: ListActionRowProps) {
  const { componentStyles, strings } = useTheme();
  const resolvedHint = accessibilityHint ?? (onDelete ? strings.common.swipeOrLongPressDelete : undefined);

  const content = onPress || onDelete ? (
    <Pressable
      accessibilityHint={resolvedHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onLongPress={onDelete}
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