import { Ionicons } from "@expo/vector-icons";
import React, { memo, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { BottomSheet } from "../../components";
import { formatString } from "../../i18n";
import { formatAmountInput, parseAmountInput } from "../../lib/formatMoney";
import { buildSafeToSpend, simulatePurchase } from "../../lib/safeToSpend";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { BalanceFieldError } from "../budget/budgetValidation";
import { shallowEqual, useActions, useFinanceSelector } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";

function SafeToSpendCardComponent() {
  const { colors, componentStyles, strings, styles } = useTheme();
  const copy = strings.home.safeToSpend;
  const actions = useActions();
  const { accounts, balanceSnapshots, moments, transfers } = useFinanceSelector(
    (state) => ({
      accounts: state.accounts,
      balanceSnapshots: state.balanceSnapshots,
      moments: state.moments,
      transfers: state.transfers
    }),
    shallowEqual
  );
  const [balanceDraft, setBalanceDraft] = useState("");
  const [balanceFieldError, setBalanceFieldError] = useState<FormValidationError<BalanceFieldError> | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [purchaseDraft, setPurchaseDraft] = useState("");

  const defaultAccountLabel = useMemo(() => {
    const incomeHub = accounts.find((account) => account.isIncomeHub);
    return incomeHub?.label ?? accounts[0]?.label ?? "";
  }, [accounts]);

  const safe = useMemo(
    () =>
      buildSafeToSpend({
        accounts,
        balanceSnapshots,
        moments,
        referenceDate: new Date(),
        transfers
      }),
    [accounts, balanceSnapshots, moments, transfers]
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

  async function handleSaveBalance() {
    const result = await actions.saveBalance({
      accountLabel: defaultAccountLabel,
      amount: balanceDraft
    });
    if (!result.ok) {
      hapticWarning();
      if (result.validation) {
        setBalanceFieldError(result.validation);
      }
      return;
    }
    setBalanceFieldError(null);
    setBalanceDraft("");
  }

  function closePurchaseSheet() {
    setSheetOpen(false);
    setPurchaseDraft("");
  }

  if (safe.effectiveBalance === null) {
    return (
      <View style={styles.heroPanelInfo}>
        <Text style={styles.heroTitle}>{copy.setBalancePrompt}</Text>
        <TextInput
          accessibilityLabel={
            balanceFieldError?.field === "amount"
              ? `${copy.setBalancePlaceholder}. ${balanceFieldError.message}`
              : copy.setBalancePlaceholder
          }
          keyboardType="number-pad"
          onChangeText={(value) => {
            setBalanceFieldError((current) => (current?.field === "amount" ? null : current));
            setBalanceDraft(formatAmountInput(value));
          }}
          placeholder={copy.setBalancePlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={balanceDraft}
        />
        {balanceFieldError?.field === "amount" && (
          <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
            {balanceFieldError.message}
          </Text>
        )}
        <Pressable
          accessibilityLabel={copy.saveBalanceA11y}
          accessibilityRole="button"
          onPress={() => {
            void handleSaveBalance();
          }}
          style={styles.smallPrimaryButton}
        >
          <Text style={styles.primaryButtonText}>{strings.common.save}</Text>
        </Pressable>
      </View>
    );
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
        <Text style={styles.pulseHeroValue}>{formatRupiah(safe.safeDaily ?? 0)}</Text>
        <Text style={styles.settingCopy}>
          {formatString(copy.balanceAnchor, { amount: formatRupiah(safe.effectiveBalance) })}
        </Text>
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