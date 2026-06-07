import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { EmptyState } from "../../components";
import { UpcomingBill } from "../../lib/recurringBills";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { useTheme } from "../../hooks/useTheme";

function formatDueHint(daysUntil: number): string {
  if (daysUntil === 0) return "due today";
  if (daysUntil === 1) return "due tomorrow";
  return `due in ${daysUntil} days`;
}

function formatDueDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short"
  });
}

export function UpcomingBillsPanel({
  upcomingBills,
  onLogPayment
}: {
  upcomingBills: UpcomingBill[];
  onLogPayment: (billId: string) => void;
}) {
  const { colors, styles } = useTheme();
  const horizonTotal = upcomingBills.reduce((sum, item) => sum + item.bill.amount, 0);

  if (upcomingBills.length === 0) {
    return (
      <View style={styles.capturePanel}>
        <Text style={styles.microLabel}>Coming up</Text>
        <EmptyState text="No bills due in the next two weeks. Recurring bills can be added in Settings." />
      </View>
    );
  }

  return (
    <View style={styles.capturePanel}>
      <View style={styles.analyticsRowHeader}>
        <Text style={styles.microLabel}>Coming up</Text>
        <Text style={styles.settingCopy}>{formatCompactRupiah(horizonTotal)} in 14 days</Text>
      </View>
      <View style={styles.listPanel}>
        {upcomingBills.map((item, index) => (
          <View
            key={`${item.bill.id}-${item.dueDate}`}
            style={[
              styles.analyticsRow,
              index > 0 && styles.listPanelContinued,
              index < upcomingBills.length - 1 && styles.listPanelMiddle
            ]}
          >
            <View style={styles.analyticsRowHeader}>
              <Text style={styles.analyticsTitle}>{item.bill.label}</Text>
              <Text style={styles.analyticsAmount}>{formatCompactRupiah(item.bill.amount)}</Text>
            </View>
            <Text style={styles.settingCopy}>
              {formatDueDate(item.dueDate)} · {formatDueHint(item.daysUntil)}
            </Text>
            <Pressable onPress={() => onLogPayment(item.bill.id)} style={styles.textButton}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.greenDark} />
              <Text style={styles.textButtonLabel}>Log payment</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}