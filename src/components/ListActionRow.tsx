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
  const resolvedHint =
    accessibilityHint ?? (onDelete ? (onPress ? strings.common.swipeToDelete : strings.common.swipeToDelete) : undefined);

  if (!onDelete) {
    if (!onPress) {
      return <View style={style}>{children}</View>;
    }

    return (
      <Pressable
        accessibilityHint={resolvedHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={[componentStyles.listActionPressable, style]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <SwipeActionRow
      accessibilityHint={resolvedHint}
      accessibilityLabel={accessibilityLabel}
      canDelete
      foregroundStyle={style}
      onDelete={onDelete}
      onLongPress={onPress ? undefined : onDelete}
      onPress={onPress}
    >
      {children}
    </SwipeActionRow>
  );
}

export const ListActionRow = memo(ListActionRowComponent);