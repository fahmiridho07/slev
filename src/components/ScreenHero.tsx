import React, { memo } from "react";
import { Text, View } from "react-native";
import { styles } from "../theme/styles/app";

type ScreenHeroProps = {
  hint?: string;
  kicker: string;
  value?: string;
  valueTone?: "balance" | "danger" | "default" | "income";
};

function ScreenHeroComponent({ hint, kicker, value, valueTone = "default" }: ScreenHeroProps) {
  return (
    <View style={styles.heroPanel}>
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
    </View>
  );
}

export const ScreenHero = memo(ScreenHeroComponent);