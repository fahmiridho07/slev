import { Ionicons } from "@expo/vector-icons";
import React, { memo, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { BottomSheet, numberPadInputAccessoryProps } from "../../components";
import { formatString } from "../../i18n";
import { formatAmountInput, parseAmountInput } from "../../lib/formatMoney";
import { buildSafeToSpend, simulatePurchase } from "../../lib/safeToSpend";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { shallowEqual, useFinanceSelector } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";

function SafeToSpendCardComponent() {
  const { colors, strings, styles } = useTheme();
  const copy = strings.home.safeToSpend;
  const { accounts, moments, recurringBills, transfers } = useFinanceSelector(
    (state) => ({
      accounts: state.accounts,
      moments: state.moments,
      recurringBills: state.recurringBills,
      transfers: state.transfers
    }),
    shallowEqual
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [purchaseDraft, setPurchaseDraft] = useState("");

  const safe = useMemo(
    () =>
      buildSafeToSpend({
        accounts,
        bills: recurringBills,
        moments,
        transfers,
        referenceDate: new Date()
      }),
    [accounts, moments, recurringBills, transfers]
  );

  const purchaseAmount = parseAmountInput(purchaseDraft);
  const purchaseSimulation =
    purchaseAmount !== null
      ? simulatePurchase({
          amount: purchaseAmount,
          safe
        })
      : null;
  const purchaseShortfall =
    purchaseSimulation && !purchaseSimulation.affordable
      ? Math.max(0, safe.typicalDaily * safe.daysLeft - purchaseSimulation.remainingBalance)
      : null;

  function getTypicalDailyToneColor(): string {
    if (safe.pace === "under") {
      return colors.greenDark;
    }
    if (safe.pace === "over") {
      return colors.amber;
    }
    return colors.muted;
  }

  function closePurchaseSheet() {
    setSheetOpen(false);
    setPurchaseDraft("");
  }

  return (
    <>
      <View style={styles.heroPanel}>
        <View style={styles.pulseTopRow}>
          <View style={[styles.pulseIconBadge, styles.pulseIconIncome]}>
            <Ionicons name="wallet-outline" size={17} color={colors.greenDark} />
          </View>
          <Text style={styles.pulseHeroLabel}>{copy.heroLabel}</Text>
        </View>
        <Text style={styles.pulseHeroValue}>{formatRupiah(safe.safeDaily)}</Text>

        {safe.spendableBalance < 0 ? (
          <Text style={styles.settingCopy}>
            {formatString(copy.billsExceedBalance, {
              amount: formatRupiah(Math.abs(safe.spendableBalance))
            })}
          </Text>
        ) : null}

        {safe.billsReserve > 0 ? (
          <Text style={styles.settingCopy}>
            {formatString(copy.billsReserve, { amount: formatRupiah(safe.billsReserve) })}
          </Text>
        ) : null}

        <View style={styles.repeatBlock}>
          <Text style={styles.settingCopy}>
            {formatString(copy.balanceAnchor, { amount: formatRupiah(safe.effectiveBalance) })}
          </Text>
        </View>

        <Text style={[styles.settingCopy, { color: getTypicalDailyToneColor() }]}>
          {formatString(copy.typicalDaily, { amount: formatRupiah(safe.typicalDaily) })}
        </Text>
        {!safe.confident ? (
          <Text style={styles.pulseHeroHint}>{copy.typicalDailyUncertain}</Text>
        ) : null}
        <Text style={styles.settingCopy}>
          {formatString(copy.daysLeft, { count: safe.daysLeft })}
        </Text>
        <Pressable
          accessibilityLabel={copy.checkPurchaseA11y}
          accessibilityRole="button"
          onPress={() => setSheetOpen(true)}
          style={styles.secondaryInlineButton}
        >
          <Ionicons name="help-circle-outline" size={16} color={colors.greenDark} />
          <Text style={styles.heroActionText}>{copy.checkPurchase}</Text>
        </Pressable>
      </View>

      <BottomSheet onClose={closePurchaseSheet} title={copy.sheetTitle} visible={sheetOpen}>
        <TextInput
          accessibilityLabel={copy.purchasePlaceholder}
          keyboardType="number-pad"
          {...numberPadInputAccessoryProps}
          onChangeText={(value) => setPurchaseDraft(formatAmountInput(value))}
          placeholder={copy.purchasePlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={purchaseDraft}
        />
        {purchaseSimulation ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[
              styles.settingCopy,
              purchaseSimulation.affordable ? { color: colors.greenDark } : { color: colors.amber }
            ]}
          >
            {purchaseSimulation.affordable
              ? formatString(copy.affordable, {
                  amount: formatRupiah(purchaseSimulation.newSafeDaily)
                })
              : formatString(copy.notAffordable, {
                  amount: formatRupiah(purchaseShortfall ?? 0)
                })}
          </Text>
        ) : null}
      </BottomSheet>
    </>
  );
}

export const SafeToSpendCard = memo(SafeToSpendCardComponent);