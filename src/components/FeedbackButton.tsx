import React, { memo } from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "../hooks/useTheme";

type FeedbackButtonProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

function FeedbackButtonComponent({
  active,
  label,
  onPress
}: FeedbackButtonProps) {
  const { componentStyles } = useTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[componentStyles.feedbackButton, active && componentStyles.feedbackButtonActive]}
    >
      <Text style={[componentStyles.feedbackText, active && componentStyles.feedbackTextActive]}>{label}</Text>
    </Pressable>
  );
}

export const FeedbackButton = memo(FeedbackButtonComponent);