import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";

type EmptyStateProps = {
  actionLabel?: string;
  onAction?: () => void;
  text: string;
};

function EmptyStateComponent({
  actionLabel,
  onAction,
  text
}: EmptyStateProps) {
  const { colors, componentStyles } = useTheme();

  return (
    <View style={componentStyles.emptyState}>
      <Ionicons name="leaf-outline" size={22} color={colors.greenDark} />
      <Text style={componentStyles.emptyText}>{text}</Text>
      {actionLabel && onAction && (
        <Pressable accessibilityRole="button" onPress={onAction} style={componentStyles.emptyActionButton}>
          <Text style={componentStyles.emptyActionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export const EmptyState = memo(EmptyStateComponent);