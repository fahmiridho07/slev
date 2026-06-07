import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";

type ScreenHeroProps = {
  actionLabel?: string;
  hint?: string;
  kicker: string;
  onAction?: () => void;
  value?: string;
  valueTone?: "balance" | "danger" | "default" | "income";
  variant?: "info" | "mint" | "surface";
};

function ScreenHeroComponent({
  actionLabel,
  hint,
  kicker,
  onAction,
  value,
  valueTone = "default",
  variant = "mint"
}: ScreenHeroProps) {
  const { styles } = useTheme();
  const panelStyle =
    variant === "info" ? styles.heroPanelInfo : variant === "surface" ? styles.heroPanelSurface : styles.heroPanel;

  return (
    <View style={panelStyle}>
      <Text style={styles.kicker}>{kicker}</Text>
      {value ? (
        <Text
          style={[
            styles.heroValue,
            valueTone === "danger" && styles.pulseValueDanger,
            valueTone === "income" && styles.pulseValueIncome,
            valueTone === "balance" && styles.pulseValueBalance
          ]}
        >
          {value}
        </Text>
      ) : null}
      {hint ? <Text style={styles.heroHint}>{hint}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable accessibilityLabel={actionLabel} accessibilityRole="button" onPress={onAction} style={styles.heroActionButton}>
          <Text style={styles.heroActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const ScreenHero = memo(ScreenHeroComponent);