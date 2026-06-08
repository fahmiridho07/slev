import { Ionicons } from "@expo/vector-icons";
import React, { memo, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { BottomSheet, numberPadInputAccessoryProps } from "../../components";
import { formatString } from "../../i18n";
import { formatRelativeTimeFromNow } from "../../i18n/localeDate";
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
  const { balanceAnchor, moments, recurringBills } = useFinanceSelector(
    (state) => ({
      balanceAnchor: state.balanceAnchor,
      moments: state.moments,
      recurringBills: state.recurringBills
    }),
    shallowEqual
  );
  const [balanceDraft, setBalanceDraft] = useState("");
  const [balanceFieldError, setBalanceFieldError] = useState<FormValidationError<BalanceFieldError> | null>(null);
  const [balanceEditOpen, setBalanceEditOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [purchaseDraft, setPurchaseDraft] = useState("");

  const safe = useMemo(
    () =>
      buildSafeToSpend({
        balanceAnchor,
        bills: recurringBills,
        moments,
        referenceDate: new Date()
      }),
    [balanceAnchor, moments, recurringBills]
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

  function openBalanceEdit() {
    setBalanceDraft(formatAmountInput(String(safe.effectiveBalance ?? 0)));
    setBalanceFieldError(null);
    setBalanceEditOpen(true);
  }

  function closeBalanceEdit() {
    setBalanceEditOpen(false);
    setBalanceDraft("");
    setBalanceFieldError(null);
  }

  async function handleSaveBalance() {
    const result = await actions.setBalanceAnchor({ amount: balanceDraft });
    if (!result.ok) {
      hapticWarning();
      if (result.validation) {
        setBalanceFieldError(result.validation);
      }
      return;
    }
    setBalanceFieldError(null);
    setBalanceDraft("");
    setBalanceEditOpen(false);
  }

  function closePurchaseSheet() {
    setSheetOpen(false);
    setPurchaseDraft("");
  }

  function renderBalanceInput(actionsRow: React.ReactNode) {
    return (
      <>
        <TextInput
          accessibilityLabel={
            balanceFieldError?.field === "amount"
              ? `${copy.setBalancePlaceholder}. ${balanceFieldError.message}`
              : copy.setBalancePlaceholder
          }
          keyboardType="number-pad"
          {...numberPadInputAccessoryProps}
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
        {actionsRow}
      </>
    );
  }

  if (safe.effectiveBalance === null) {
    return (
      <View style={styles.heroPanelInfo}>
        <Text style={styles.heroTitle}>{copy.setBalancePrompt}</Text>
        {renderBalanceInput(
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
        )}
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

        {safe.spendableBalance !== null && safe.spendableBalance < 0 ? (
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

        {balanceEditOpen ? (
          renderBalanceInput(
            <View style={componentStyles.editActions}>
              <Pressable
                accessibilityLabel={strings.common.cancel}
                accessibilityRole="button"
                onPress={closeBalanceEdit}
                style={styles.secondaryButton}
              >
                <Text style={componentStyles.secondaryButtonText}>{strings.common.cancel}</Text>
              </Pressable>
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
          )
        ) : (
          <View style={styles.repeatBlock}>
            <Pressable
              accessibilityLabel={copy.updateBalanceA11y}
              accessibilityRole="button"
              onPress={openBalanceEdit}
              style={styles.analyticsRowHeader}
            >
              <Text style={[styles.settingCopy, { flex: 1 }]}>
                {formatString(copy.balanceAnchor, { amount: formatRupiah(safe.effectiveBalance) })}
              </Text>
              <Ionicons name="pencil-outline" size={16} color={colors.greenDark} />
            </Pressable>
            {balanceAnchor ? (
              <Text style={styles.pulseHeroHint}>
                {formatString(copy.lastSetRelative, {
                  time: formatRelativeTimeFromNow(balanceAnchor.setAt)
                })}
              </Text>
            ) : null}
          </View>
        )}

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