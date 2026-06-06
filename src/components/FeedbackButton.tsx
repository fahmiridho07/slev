import React, { memo } from "react";
import { Pressable, Text } from "react-native";
import { componentStyles } from "../theme/styles/components";

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
  return (
    <Pressable onPress={onPress} style={[componentStyles.feedbackButton, active && componentStyles.feedbackButtonActive]}>
      <Text style={[componentStyles.feedbackText, active && componentStyles.feedbackTextActive]}>{label}</Text>
    </Pressable>
  );
}

export const FeedbackButton = memo(FeedbackButtonComponent);