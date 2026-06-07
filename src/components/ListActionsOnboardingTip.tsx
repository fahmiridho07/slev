import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { componentStyles } from "../theme/styles/components";

type ListActionsOnboardingTipProps = {
  body?: string;
  onDismiss: () => void;
  title?: string;
};

function ListActionsOnboardingTipComponent({
  body = "Tap any row to edit. Swipe left on a row to delete.",
  onDismiss,
  title = "How list actions work"
}: ListActionsOnboardingTipProps) {
  return (
    <View style={componentStyles.onboardingTip}>
      <View style={componentStyles.onboardingTipTitleRow}>
        <Ionicons name="hand-left-outline" size={18} color={colors.blue} />
        <Text style={componentStyles.onboardingTipTitle}>{title}</Text>
      </View>
      <Text style={componentStyles.onboardingTipBody}>{body}</Text>
      <Pressable
        accessibilityLabel="Dismiss list actions tip"
        accessibilityRole="button"
        onPress={onDismiss}
        style={componentStyles.onboardingTipAction}
      >
        <Text style={componentStyles.onboardingTipActionText}>Got it</Text>
      </Pressable>
    </View>
  );
}

export const ListActionsOnboardingTip = memo(ListActionsOnboardingTipComponent);