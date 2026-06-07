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
  onOpenSettings,
  upcomingBills,
  onLogPayment
}: {
  onOpenSettings: () => void;
  upcomingBills: UpcomingBill[];
  onLogPayment: (billId: string) => void;
}) {
  const { colors, componentStyles, strings, styles } = useTheme();
  function formatDueHint(daysUntil: number): string {
    if (daysUntil === 0) return strings.home.bills.dueToday;
    if (daysUntil === 1) return strings.home.bills.dueTomorrow;
    return formatString(strings.home.bills.dueInDays, { count: daysUntil });
  }

  function formatHorizonSummary(): string {
    const total = upcomingBills.reduce((sum, item) => sum + item.bill.amount, 0);
    const amount = formatCompactRupiah(total);

    if (upcomingBills.length === 1) {
      return formatString(strings.home.bills.horizonSingle, {
        amount,
        due: formatDueHint(upcomingBills[0].daysUntil)
      });
    }

    return formatString(strings.home.bills.horizonMultiple, {
      amount,
      count: upcomingBills.length
    });
  }

  if (upcomingBills.length === 0) {
    return (
      <View style={styles.capturePanel}>
        <Text style={componentStyles.microLabel}>{strings.home.bills.comingUp}</Text>
        <EmptyState
          actionLabel={strings.home.bills.emptyAction}
          onAction={onOpenSettings}
          text={strings.home.bills.empty}
        />
      </View>
    );
  }

  return (
    <View style={styles.cardStack}>
      <View style={styles.capturePanel}>
        <View style={styles.analyticsRowHeader}>
          <View>
            <Text style={componentStyles.microLabel}>{strings.home.bills.comingUp}</Text>
            <Text style={styles.settingCopy}>{strings.home.bills.horizonWindow}</Text>
          </View>
          <Text style={styles.settingCopy}>{formatHorizonSummary()}</Text>
        </View>
      </View>
      <View style={styles.listPanel}>
        {upcomingBills.map((item) => (
          <View key={`${item.bill.id}-${item.dueDate}`} style={styles.analyticsRow}>
            <View style={styles.analyticsRowHeader}>
              <Text style={componentStyles.analyticsTitle}>{item.bill.label}</Text>
              <Text style={styles.analyticsAmount}>{formatCompactRupiah(item.bill.amount)}</Text>
            </View>
            <Text style={styles.settingCopy}>
              {formatLocaleShortDate(item.dueDate)} · {formatDueHint(item.daysUntil)}
            </Text>
            <Pressable
              accessibilityLabel={formatString(strings.home.bills.logPaymentA11y, {
                amount: formatCompactRupiah(item.bill.amount),
                due: formatDueHint(item.daysUntil),
                label: item.bill.label
              })}
              accessibilityRole="button"
              onPress={() => onLogPayment(item.bill.id)}
              style={componentStyles.textButton}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.greenDark} />
              <Text style={componentStyles.textButtonLabel}>{strings.home.bills.logPayment}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}