import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { formatString } from "../i18n";
import { formatLocaleMonthYear } from "../i18n/localeDate";
import { useTheme } from "../hooks/useTheme";
import { hapticSelection } from "../lib/haptics";

type MonthPeriodPickerProps = {
  canGoBack: boolean;
  canGoForward: boolean;
  labelDate: Date;
  onNext: () => void;
  onPrevious: () => void;
};

function MonthPeriodPickerComponent({
  canGoBack,
  canGoForward,
  labelDate,
  onNext,
  onPrevious
}: MonthPeriodPickerProps) {
  const { colors, strings, styles } = useTheme();
  const pickerStrings = strings.patterns.breakdown;
  const label = formatLocaleMonthYear(labelDate);

  return (
    <View style={styles.monthPeriodPicker}>
      <Pressable
        accessibilityLabel={formatString(pickerStrings.previousMonthA11y, { month: label })}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canGoBack }}
        disabled={!canGoBack}
        onPress={() => {
          hapticSelection();
          onPrevious();
        }}
        style={[styles.monthPeriodButton, !canGoBack && styles.monthPeriodButtonDisabled]}
      >
        <Ionicons color={canGoBack ? colors.greenDark : colors.line} name="chevron-back" size={20} />
      </Pressable>

      <Text accessibilityRole="header" style={styles.monthPeriodLabel}>
        {label}
      </Text>

      <Pressable
        accessibilityLabel={formatString(pickerStrings.nextMonthA11y, { month: label })}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canGoForward }}
        disabled={!canGoForward}
        onPress={() => {
          hapticSelection();
          onNext();
        }}
        style={[styles.monthPeriodButton, !canGoForward && styles.monthPeriodButtonDisabled]}
      >
        <Ionicons color={canGoForward ? colors.greenDark : colors.line} name="chevron-forward" size={20} />
      </Pressable>
    </View>
  );
}

export const MonthPeriodPicker = memo(MonthPeriodPickerComponent);