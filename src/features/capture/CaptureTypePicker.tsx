import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { CaptureType } from "../app.types";
import { colors } from "../../theme/colors";
import { styles } from "../../theme/styles/app";

type CaptureTypeOption = {
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: CaptureType;
};

const CAPTURE_TYPE_OPTIONS: CaptureTypeOption[] = [
  {
    hint: "Spending you want to track",
    icon: "card-outline",
    label: "Expense",
    value: "expense"
  },
  {
    hint: "Salary, refund, or inflow",
    icon: "arrow-down-circle-outline",
    label: "Income",
    value: "income"
  },
  {
    hint: "Move money between accounts",
    icon: "swap-horizontal-outline",
    label: "Transfer",
    value: "transfer"
  }
];

export function CaptureTypePicker({
  selected,
  onSelect
}: {
  selected: CaptureType;
  onSelect: (value: CaptureType) => void;
}) {
  return (
    <View style={styles.captureTypeBlock}>
      <Text style={styles.captureTypeLead}>What are you logging?</Text>
      <Text style={styles.captureTypeCopy}>Tap the kind of money moment you want to save.</Text>
      <View style={styles.captureTypeGrid}>
        {CAPTURE_TYPE_OPTIONS.map((option) => {
          const active = option.value === selected;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={option.value}
              onPress={() => {
                if (!active) {
                  onSelect(option.value);
                }
              }}
              style={[styles.captureTypeTile, active && styles.captureTypeTileActive]}
            >
              <View style={[styles.captureTypeIconBadge, active && styles.captureTypeIconBadgeActive]}>
                <Ionicons
                  color={active ? colors.greenDark : colors.muted}
                  name={option.icon}
                  size={18}
                />
              </View>
              <Text style={[styles.captureTypeLabel, active && styles.captureTypeLabelActive]}>
                {option.label}
              </Text>
              <Text style={styles.captureTypeHint}>{option.hint}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}