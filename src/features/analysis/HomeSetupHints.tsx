import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { formatString } from "../../i18n";
import { SettingsTabKey } from "../app.types";
import { MoneyAccount, MoneyTransfer, RecurringBill, SpendingMoment } from "../spendingMemory.types";
import { getPrimaryHomeSetupHint } from "../../lib/homeSetup";
import { useTheme } from "../../hooks/useTheme";

type HomeSetupHintsProps = {
  accounts: MoneyAccount[];
  moments: SpendingMoment[];
  onOpenSettings: (tab?: SettingsTabKey) => void;
  paydayDayOfMonth: number | null;
  recurringBills: RecurringBill[];
  transfers: MoneyTransfer[];
};

export function HomeSetupHints({
  accounts,
  moments,
  onOpenSettings,
  paydayDayOfMonth,
  recurringBills,
  transfers
}: HomeSetupHintsProps) {
  const { strings, styles } = useTheme();
  const setupStrings = strings.home.setup;
  const safeCopy = strings.home.safeToSpend;
  const hint = useMemo(
    () =>
      getPrimaryHomeSetupHint({
        accounts,
        moments,
        paydayDayOfMonth,
        recurringBills,
        transfers
      }),
    [accounts, moments, paydayDayOfMonth, recurringBills, transfers]
  );

  if (!hint) {
    return null;
  }

  if (hint.type === "payday") {
    return (
      <View style={styles.homeBalanceHint}>
        <Text style={styles.homeBalanceHintText}>
          {safeCopy.paydayHint}{" "}
          <Text
            accessibilityLabel={safeCopy.paydayHintA11y}
            accessibilityRole="link"
            onPress={() => onOpenSettings("accounts")}
            style={styles.homeBalanceHintAction}
          >
            {safeCopy.paydayHintAction}
          </Text>
        </Text>
      </View>
    );
  }

  if (hint.type === "opening_balance") {
    return (
      <View style={styles.homeBalanceHint}>
        <Text style={styles.homeBalanceHintText}>
          {setupStrings.openingBalanceHint}{" "}
          <Text
            accessibilityLabel={setupStrings.openingBalanceA11y}
            accessibilityRole="link"
            onPress={() => onOpenSettings("accounts")}
            style={styles.homeBalanceHintAction}
          >
            {setupStrings.openingBalanceAction}
          </Text>
        </Text>
      </View>
    );
  }

  if (hint.type === "bills") {
    return (
      <View style={styles.homeBalanceHint}>
        <Text style={styles.homeBalanceHintText}>
          {setupStrings.billsHint}{" "}
          <Text
            accessibilityLabel={setupStrings.billsA11y}
            accessibilityRole="link"
            onPress={() => onOpenSettings("bills")}
            style={styles.homeBalanceHintAction}
          >
            {setupStrings.billsAction}
          </Text>
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.homeBalanceHint}>
      <Text style={styles.homeBalanceHintText}>
        {formatString(setupStrings.overdueBillsHint, { count: hint.count ?? 0 })}{" "}
        <Text
          accessibilityLabel={setupStrings.overdueBillsA11y}
          accessibilityRole="link"
          onPress={() => onOpenSettings("bills")}
          style={styles.homeBalanceHintAction}
        >
          {setupStrings.overdueBillsAction}
        </Text>
      </Text>
    </View>
  );
}