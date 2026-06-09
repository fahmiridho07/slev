import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { dateKey } from "../../lib/analysis";
import { useTheme } from "../../hooks/useTheme";
import {
  buildCaptureQuickDateOptions,
  formatCaptureDateLabel,
  getTodayDateKey
} from "./captureDate";

type CaptureDatePickerProps = {
  occurredAtKey: string | null;
  onSelect: (key: string | null) => void;
};

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function CaptureDatePickerComponent({ occurredAtKey, onSelect }: CaptureDatePickerProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const quickOptions = useMemo(() => buildCaptureQuickDateOptions(), []);
  const selectedLabel = formatCaptureDateLabel(occurredAtKey);
  const pickerDate = occurredAtKey ? parseDateKey(occurredAtKey) : parseDateKey(getTodayDateKey());

  const handlePickerChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === "android") {
        setPickerOpen(false);
      }
      if (event.type === "dismissed" || !date) {
        return;
      }
      const nextKey = dateKey(date);
      onSelect(nextKey === getTodayDateKey() ? null : nextKey);
    },
    [onSelect]
  );

  return (
    <View style={styles.captureDateBlock}>
      <Text style={componentStyles.microLabel}>{strings.capture.dateLabel}</Text>
      <View style={componentStyles.contextWrapCompact}>
        {quickOptions.map((option) => {
          const active = occurredAtKey === option.key;
          return (
            <Pressable
              accessibilityLabel={option.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={option.key ?? "today"}
              onPress={() => onSelect(option.key)}
              style={[componentStyles.contextChip, active && componentStyles.contextChipActive]}
            >
              <Text style={[componentStyles.contextChipText, active && componentStyles.contextChipTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityLabel={strings.capture.pickAnotherDate}
        accessibilityRole="button"
        onPress={() => setPickerOpen((current) => !current)}
        style={styles.captureDatePickButton}
      >
        <Ionicons name="calendar-outline" size={16} color={colors.greenDark} />
        <Text style={componentStyles.textButtonLabel}>
          {selectedLabel ?? strings.capture.pickAnotherDate}
        </Text>
      </Pressable>

      {pickerOpen ? (
        <DateTimePicker
          display={Platform.OS === "ios" ? "inline" : "default"}
          maximumDate={new Date()}
          mode="date"
          onChange={handlePickerChange}
          value={pickerDate}
        />
      ) : null}
    </View>
  );
}

export const CaptureDatePicker = memo(CaptureDatePickerComponent);