import React, { memo } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useTheme } from "../hooks/useTheme";

type ProgressBarProps = {
  accessibilityLabel?: string;
  fillStyle: StyleProp<ViewStyle>;
  value: number;
};

function ProgressBarComponent({ accessibilityLabel, fillStyle, value }: ProgressBarProps) {
  const { styles } = useTheme();
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{
        max: 100,
        min: 0,
        now: Math.round(clamped * 100)
      }}
      style={styles.progressTrack}
    >
      <View style={[styles.progressFill, fillStyle]} />
    </View>
  );
}

export const ProgressBar = memo(ProgressBarComponent);