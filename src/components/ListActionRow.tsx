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
  rowKey?: string;
  style?: ViewStyle;
};

function ListActionRowComponent({
  accessibilityHint,
  accessibilityLabel,
  children,
  onDelete,
  onPress,
  rowKey,
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
      key={rowKey}
      accessibilityHint={resolvedHint}
      accessibilityLabel={accessibilityLabel}
      canDelete
      foregroundStyle={style}
      onDelete={onDelete}
      onLongPress={onPress ? undefined : onDelete}
      onPress={onPress}
      rowKey={rowKey ?? accessibilityLabel ?? "list-action-row"}
    >
      {children}
    </SwipeActionRow>
  );
}

export const ListActionRow = memo(ListActionRowComponent);