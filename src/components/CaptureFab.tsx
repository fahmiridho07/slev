import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Pressable } from "react-native";
import { useTheme } from "../hooks/useTheme";

type CaptureFabProps = {
  accessibilityLabel: string;
  bottom: number;
  onPress: () => void;
};

function CaptureFabComponent({ accessibilityLabel, bottom, onPress }: CaptureFabProps) {
  const { colors, styles } = useTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.captureFab, { bottom }]}
    >
      <Ionicons color={colors.surface} name="add" size={28} />
    </Pressable>
  );
}

export const CaptureFab = memo(CaptureFabComponent);