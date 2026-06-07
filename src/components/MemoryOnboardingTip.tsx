import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { componentStyles } from "../theme/styles/components";

type MemoryOnboardingTipProps = {
  onDismiss: () => void;
};

function MemoryOnboardingTipComponent({ onDismiss }: MemoryOnboardingTipProps) {
  return (
    <View style={componentStyles.onboardingTip}>
      <View style={componentStyles.onboardingTipTitleRow}>
        <Ionicons name="hand-left-outline" size={18} color={colors.blue} />
        <Text style={componentStyles.onboardingTipTitle}>How list actions work</Text>
      </View>
      <Text style={componentStyles.onboardingTipBody}>
        Tap any row to edit. Swipe left on a row to delete.
      </Text>
      <Pressable
        accessibilityLabel="Dismiss memory list tip"
        accessibilityRole="button"
        onPress={onDismiss}
        style={componentStyles.onboardingTipAction}
      >
        <Text style={componentStyles.onboardingTipActionText}>Got it</Text>
      </Pressable>
    </View>
  );
}

export const MemoryOnboardingTip = memo(MemoryOnboardingTipComponent);