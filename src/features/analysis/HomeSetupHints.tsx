import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { formatString } from "../../i18n";
import { SettingsTabKey } from "../app.types";
import { MoneyAccount, MoneyTransfer, RecurringBill, SpendingMoment } from "../spendingMemory.types";
import { getHomeSetupHints, getPrimaryHomeSetupHint } from "../../lib/homeSetup";
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
  const hints = useMemo(
    () =>
      getHomeSetupHints({
        accounts,
        moments,
        paydayDayOfMonth,
        recurringBills,
        transfers
      }),
    [accounts, moments, paydayDayOfMonth, recurringBills, transfers]
  );
  const hint = useMemo(() => getPrimaryHomeSetupHint({
    accounts,
    moments,
    paydayDayOfMonth,
    recurringBills,
    transfers
  }), [accounts, moments, paydayDayOfMonth, recurringBills, transfers]);

  if (!hint) {
    return null;
  }

  const progressLabel =
    hints.length > 1
      ? formatString(setupStrings.progress, { current: 1, total: hints.length })
      : null;

  function renderHintBody(content: React.ReactNode) {
    return (
      <View style={styles.homeBalanceHint}>
        {progressLabel ? (
          <Text style={[styles.homeBalanceHintText, styles.homeBalanceHintProgress]}>{progressLabel}</Text>
        ) : null}
        <Text style={styles.homeBalanceHintText}>{content}</Text>
      </View>
    );
  }

  if (hint.type === "payday") {
    return renderHintBody(
      <>
        {safeCopy.paydayHint}{" "}
        <Text
          accessibilityLabel={safeCopy.paydayHintA11y}
          accessibilityRole="link"
          onPress={() => onOpenSettings("accounts")}
          style={styles.homeBalanceHintAction}
        >
          {safeCopy.paydayHintAction}
        </Text>
      </>
    );
  }

  if (hint.type === "opening_balance") {
    return renderHintBody(
      <>
        {setupStrings.openingBalanceHint}{" "}
        <Text
          accessibilityLabel={setupStrings.openingBalanceA11y}
          accessibilityRole="link"
          onPress={() => onOpenSettings("accounts")}
          style={styles.homeBalanceHintAction}
        >
          {setupStrings.openingBalanceAction}
        </Text>
      </>
    );
  }

  if (hint.type === "bills") {
    return renderHintBody(
      <>
        {setupStrings.billsHint}{" "}
        <Text
          accessibilityLabel={setupStrings.billsA11y}
          accessibilityRole="link"
          onPress={() => onOpenSettings("bills")}
          style={styles.homeBalanceHintAction}
        >
          {setupStrings.billsAction}
        </Text>
      </>
    );
  }

  return renderHintBody(
    <>
      {formatString(setupStrings.overdueBillsHint, { count: hint.count ?? 0 })}{" "}
      <Text
        accessibilityLabel={setupStrings.overdueBillsA11y}
        accessibilityRole="link"
        onPress={() => onOpenSettings("bills")}
        style={styles.homeBalanceHintAction}
      >
        {setupStrings.overdueBillsAction}
      </Text>
    </>
  );
}