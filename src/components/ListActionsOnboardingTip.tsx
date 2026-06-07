import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";

type ListActionsOnboardingTipProps = {
  body?: string;
  onDismiss: () => void;
  title?: string;
};

function ListActionsOnboardingTipComponent({ body, onDismiss, title }: ListActionsOnboardingTipProps) {
  const { colors, componentStyles, strings } = useTheme();
  const resolvedTitle = title ?? strings.listHints.memory.title;
  const resolvedBody = body ?? strings.listHints.memory.body;

  return (
    <View style={componentStyles.onboardingTip}>
      <View style={componentStyles.onboardingTipTitleRow}>
        <Ionicons name="hand-left-outline" size={18} color={colors.blue} />
        <Text style={componentStyles.onboardingTipTitle}>{resolvedTitle}</Text>
      </View>
      <Text style={componentStyles.onboardingTipBody}>{resolvedBody}</Text>
      <Pressable
        accessibilityLabel={strings.common.gotIt}
        accessibilityRole="button"
        onPress={onDismiss}
        style={componentStyles.onboardingTipAction}
      >
        <Text style={componentStyles.onboardingTipActionText}>{strings.common.gotIt}</Text>
      </Pressable>
    </View>
  );
}

export const ListActionsOnboardingTip = memo(ListActionsOnboardingTipComponent);