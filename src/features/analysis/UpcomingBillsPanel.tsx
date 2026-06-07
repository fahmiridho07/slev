import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { EmptyState } from "../../components";
import { useTheme } from "../../hooks/useTheme";
import { formatString } from "../../i18n";
import { formatLocaleShortDate } from "../../i18n/localeDate";
import { UpcomingBill } from "../../lib/recurringBills";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";

export function UpcomingBillsPanel({
  upcomingBills,
  onLogPayment
}: {
  upcomingBills: UpcomingBill[];
  onLogPayment: (billId: string) => void;
}) {
  const { colors, strings, styles } = useTheme();
  const horizonTotal = upcomingBills.reduce((sum, item) => sum + item.bill.amount, 0);

  function formatDueHint(daysUntil: number): string {
    if (daysUntil === 0) return strings.home.bills.dueToday;
    if (daysUntil === 1) return strings.home.bills.dueTomorrow;
    return formatString(strings.home.bills.dueInDays, { count: daysUntil });
  }

  if (upcomingBills.length === 0) {
    return (
      <View style={styles.capturePanel}>
        <Text style={styles.microLabel}>{strings.home.bills.comingUp}</Text>
        <EmptyState text={strings.home.bills.empty} />
      </View>
    );
  }

  return (
    <View style={styles.capturePanel}>
      <View style={styles.analyticsRowHeader}>
        <Text style={styles.microLabel}>{strings.home.bills.comingUp}</Text>
        <Text style={styles.settingCopy}>
          {formatString(strings.home.bills.horizonTotal, { amount: formatCompactRupiah(horizonTotal) })}
        </Text>
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
              {formatLocaleShortDate(item.dueDate)} · {formatDueHint(item.daysUntil)}
            </Text>
            <Pressable
              accessibilityLabel={strings.home.bills.logPayment}
              accessibilityRole="button"
              onPress={() => onLogPayment(item.bill.id)}
              style={styles.textButton}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.greenDark} />
              <Text style={styles.textButtonLabel}>{strings.home.bills.logPayment}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}