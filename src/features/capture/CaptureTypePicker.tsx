import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { CaptureType } from "../app.types";
import { useTheme } from "../../hooks/useTheme";

type CaptureTypeOption = {
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: CaptureType;
};

export function CaptureTypePicker({
  selected,
  onSelect
}: {
  selected: CaptureType;
  onSelect: (value: CaptureType) => void;
}) {
  const { colors, strings, styles } = useTheme();

  const captureTypeOptions = useMemo<CaptureTypeOption[]>(
    () => [
      {
        hint: strings.capture.type.expenseHint,
        icon: "card-outline",
        label: strings.capture.type.expenseLabel,
        value: "expense"
      },
      {
        hint: strings.capture.type.incomeHint,
        icon: "arrow-down-circle-outline",
        label: strings.capture.type.incomeLabel,
        value: "income"
      },
      {
        hint: strings.capture.type.transferHint,
        icon: "swap-horizontal-outline",
        label: strings.capture.type.transferLabel,
        value: "transfer"
      }
    ],
    [strings.capture.type]
  );

  return (
    <View style={styles.captureTypeBlock}>
      <Text style={styles.captureTypeLead}>{strings.capture.type.lead}</Text>
      <Text style={styles.captureTypeCopy}>{strings.capture.type.copy}</Text>
      <View style={styles.captureTypeGrid}>
        {captureTypeOptions.map((option) => {
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