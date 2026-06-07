import React, { memo } from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "../hooks/useTheme";

type FeedbackButtonProps = {
  active: boolean;
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

function FeedbackButtonComponent({
  active,
  disabled = false,
  label,
  onPress
}: FeedbackButtonProps) {
  const { componentStyles } = useTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled}
      onPress={onPress}
      style={[
        componentStyles.feedbackButton,
        active && componentStyles.feedbackButtonActive,
        disabled && componentStyles.feedbackButtonDisabled
      ]}
    >
      <Text style={[componentStyles.feedbackText, active && componentStyles.feedbackTextActive]}>{label}</Text>
    </Pressable>
  );
}

export const FeedbackButton = memo(FeedbackButtonComponent);