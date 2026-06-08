import { Ionicons } from "@expo/vector-icons";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { BottomSheet, numberPadInputAccessoryProps } from "../../components";
import { formatString } from "../../i18n";
import { formatAmountInput, parseAmountInput } from "../../lib/formatMoney";
import { buildSafeToSpend, simulatePurchase } from "../../lib/safeToSpend";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { shallowEqual, useFinanceSelector } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";

function SafeToSpendCardComponent() {
  const { colors, componentStyles, reduceMotion, strings, styles } = useTheme();
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

  const verdictStyle =
    purchaseSimulation == null
      ? componentStyles.purchaseVerdictNeutral
      : purchaseSimulation.affordable
        ? componentStyles.purchaseVerdictSafe
        : componentStyles.purchaseVerdictWarn;
  const verdictColor =
    purchaseSimulation == null
      ? colors.muted
      : purchaseSimulation.affordable
        ? colors.greenDark
        : colors.amber;
  const verdictIcon: keyof typeof Ionicons.glyphMap =
    purchaseSimulation == null
      ? "information-circle-outline"
      : purchaseSimulation.affordable
        ? "checkmark-circle"
        : "alert-circle";
  const verdictText =
    purchaseSimulation == null
      ? copy.purchaseHint
      : purchaseSimulation.affordable
        ? formatString(copy.affordable, { amount: formatRupiah(purchaseSimulation.newSafeDaily) })
        : formatString(copy.notAffordable, { amount: formatRupiah(purchaseShortfall ?? 0) });

  const showMeter = purchaseSimulation != null && safe.safeDaily > 0;
  const meterFill =
    purchaseSimulation != null && safe.safeDaily > 0
      ? Math.max(0, Math.min(1, purchaseSimulation.newSafeDaily / safe.safeDaily))
      : 0;
  const meterWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      meterWidth.setValue(meterFill);
      return;
    }
    Animated.timing(meterWidth, {
      toValue: meterFill,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();
  }, [meterFill, reduceMotion, meterWidth]);

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
        <View style={componentStyles.sheetForm}>
          <ScrollView
            contentContainerStyle={componentStyles.purchaseSheet}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={componentStyles.sheetScroll}
          >
            <View style={componentStyles.purchaseAmountField}>
              <Text style={componentStyles.purchaseAmountPrefix}>
                {strings.capture.currencyPrefix}
              </Text>
              <TextInput
                accessibilityLabel={copy.purchasePlaceholder}
                autoFocus
                keyboardType="number-pad"
                {...numberPadInputAccessoryProps}
                onChangeText={(value) => setPurchaseDraft(formatAmountInput(value))}
                placeholder="0"
                placeholderTextColor={colors.muted}
                style={componentStyles.purchaseAmountInput}
                value={purchaseDraft}
              />
            </View>

            <View style={[componentStyles.purchaseVerdict, verdictStyle]}>
              <View style={componentStyles.purchaseVerdictRow}>
                <Ionicons color={verdictColor} name={verdictIcon} size={20} />
                <Text
                  accessibilityLiveRegion="polite"
                  style={[componentStyles.purchaseVerdictText, { color: verdictColor }]}
                >
                  {verdictText}
                </Text>
              </View>
              {showMeter ? (
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={componentStyles.purchaseMeterTrack}
                >
                  <Animated.View
                    style={[
                      componentStyles.purchaseMeterFill,
                      {
                        backgroundColor: verdictColor,
                        width: meterWidth.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"]
                        })
                      }
                    ]}
                  />
                </View>
              ) : null}
            </View>

            <Text style={componentStyles.purchaseContext}>
              {formatString(copy.sheetContext, {
                amount: formatRupiah(safe.safeDaily),
                days: safe.daysLeft
              })}
            </Text>
          </ScrollView>
        </View>
      </BottomSheet>
    </>
  );
}

export const SafeToSpendCard = memo(SafeToSpendCardComponent);