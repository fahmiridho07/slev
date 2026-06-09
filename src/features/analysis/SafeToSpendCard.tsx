import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { BottomSheet, numberPadInputAccessoryProps } from "../../components";
import { SettingsTabKey } from "../app.types";
import { formatString } from "../../i18n";
import { HomeHintsSheet } from "./HomeHintsSheet";
import { formatAmountInput, parseAmountInput } from "../../lib/formatMoney";
import { getPurchasePresentation, getPurchaseVerdictCopy } from "../../lib/purchaseVerdict";
import { buildSafeToSpend, simulatePurchase, type SafeToSpendPace } from "../../lib/safeToSpend";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import type { AppStrings } from "../../i18n/types";
import { shallowEqual, useFinanceSelector } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";


function getPaceCopy(pace: SafeToSpendPace, copy: AppStrings["home"]["safeToSpend"]) {
  if (pace === "under") {
    return copy.paceUnder;
  }
  if (pace === "over") {
    return copy.paceOver;
  }
  if (pace === "even") {
    return copy.paceEven;
  }
  return copy.paceUnknown;
}

type SafeToSpendCardProps = {
  onOpenSettings: (tab?: SettingsTabKey) => void;
};

function SafeToSpendCardComponent({ onOpenSettings }: SafeToSpendCardProps) {
  const { colors, componentStyles, paydayDayOfMonth, reduceMotion, spendBuffer, strings, styles } = useTheme();
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
        referenceDate: new Date(),
        paydayDayOfMonth: paydayDayOfMonth ?? undefined,
        spendBuffer
      }),
    [accounts, moments, paydayDayOfMonth, recurringBills, spendBuffer, transfers]
  );

  const purchaseAmount = parseAmountInput(purchaseDraft);
  const purchaseSimulation =
    purchaseAmount !== null
      ? simulatePurchase({
          amount: purchaseAmount,
          safe
        })
      : null;
  const purchaseVerdict = useMemo(() => {
    if (purchaseSimulation == null) {
      return {
        detail: null as string | null,
        headline: copy.purchaseHint,
        icon: "information-circle-outline" as const,
        style: componentStyles.purchaseVerdictNeutral,
        textColor: colors.muted
      };
    }

    const presentation = getPurchasePresentation(purchaseSimulation.insight);
    const messages = getPurchaseVerdictCopy({
      horizon: paydayDayOfMonth != null ? "payday" : "month_end",
      safe,
      simulation: purchaseSimulation,
      strings
    });
    const style =
      presentation.tone === "safe"
        ? componentStyles.purchaseVerdictSafe
        : presentation.tone === "warn"
          ? componentStyles.purchaseVerdictWarn
          : presentation.tone === "caution"
            ? componentStyles.purchaseVerdictCaution
            : componentStyles.purchaseVerdictDanger;
    const textColor =
      presentation.tone === "safe"
        ? colors.greenDark
        : presentation.tone === "warn"
          ? colors.amber
          : colors.coral;
    const icon =
      presentation.tone === "safe"
        ? ("checkmark-circle" as const)
        : presentation.tone === "warn"
          ? ("alert-circle" as const)
          : presentation.tone === "caution"
            ? ("warning" as const)
            : ("close-circle" as const);

    return {
      detail: messages.detail,
      headline: messages.headline,
      icon,
      style,
      textColor
    };
  }, [
    colors.amber,
    colors.coral,
    colors.greenDark,
    colors.muted,
    componentStyles.purchaseVerdictCaution,
    componentStyles.purchaseVerdictDanger,
    componentStyles.purchaseVerdictNeutral,
    componentStyles.purchaseVerdictSafe,
    componentStyles.purchaseVerdictWarn,
    copy.purchaseHint,
    paydayDayOfMonth,
    purchaseSimulation,
    safe,
    strings
  ]);

  const showMeter = purchaseSimulation != null && safe.safeDaily > 0;
  const meterFill =
    purchaseSimulation != null && safe.safeDaily > 0
      ? Math.max(0, Math.min(1, purchaseSimulation.newSafeDaily / safe.safeDaily))
      : 0;
  const meterColor =
    purchaseSimulation == null
      ? colors.line
      : purchaseSimulation.newSafeDaily <= 0
        ? colors.coral
        : safe.typicalDaily > 0 && purchaseSimulation.newSafeDaily < safe.typicalDaily
          ? colors.amber
          : colors.green;
  const meterTrackWidthRef = useRef(0);
  const meterFillWidth = useRef(new Animated.Value(0)).current;

  const animateMeterFill = useCallback(
    (trackWidth: number, fillRatio: number) => {
      const targetWidth = trackWidth * fillRatio;
      if (reduceMotion) {
        meterFillWidth.setValue(targetWidth);
        return;
      }
      Animated.timing(meterFillWidth, {
        toValue: targetWidth,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false
      }).start();
    },
    [meterFillWidth, reduceMotion]
  );

  useEffect(() => {
    if (meterTrackWidthRef.current > 0) {
      animateMeterFill(meterTrackWidthRef.current, meterFill);
    }
  }, [animateMeterFill, meterFill]);

  const handleMeterTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const trackWidth = event.nativeEvent.layout.width;
      if (trackWidth <= 0 || trackWidth === meterTrackWidthRef.current) {
        return;
      }
      meterTrackWidthRef.current = trackWidth;
      animateMeterFill(trackWidth, meterFill);
    },
    [animateMeterFill, meterFill]
  );

  const paceChipStyle =
    safe.pace === "under"
      ? styles.homeBalanceChipPositive
      : safe.pace === "over"
        ? styles.homeBalanceChipWarning
        : styles.homeBalanceChipNeutral;
  const paceChipTextStyle =
    safe.pace === "under"
      ? styles.homeBalanceChipTextPositive
      : safe.pace === "over"
        ? styles.homeBalanceChipTextWarning
        : styles.homeBalanceChipTextNeutral;
  function closePurchaseSheet() {
    setSheetOpen(false);
    setPurchaseDraft("");
  }

  return (
    <>
      <View style={styles.homeBalanceCard}>
        <View style={styles.homeHintsAnchor}>
          <HomeHintsSheet
            accounts={accounts}
            moments={moments}
            onOpenSettings={onOpenSettings}
            paydayDayOfMonth={paydayDayOfMonth}
            recurringBills={recurringBills}
            safe={safe}
            transfers={transfers}
          />
        </View>

        <View style={styles.pulseTopRow}>
          <View style={[styles.pulseIconBadge, styles.pulseIconIncome]}>
            <Ionicons name="wallet-outline" size={17} color={colors.greenDark} />
          </View>
          <Text style={styles.homeBalanceLabel}>{copy.heroLabel}</Text>
        </View>

        <Text style={styles.homeBalanceValue}>{formatRupiah(safe.effectiveBalance)}</Text>

        <View style={styles.homeBalanceChipRow}>
          <View style={[styles.homeBalanceChip, paceChipStyle]}>
            <Text style={[styles.homeBalanceChipText, paceChipTextStyle]}>{getPaceCopy(safe.pace, copy)}</Text>
          </View>
          <View style={styles.homeBalanceChipNeutral}>
            <Text style={[styles.homeBalanceChipText, styles.homeBalanceChipTextNeutral]}>
              {formatString(copy.daysLeftChip, { count: safe.daysLeft })}
            </Text>
          </View>
        </View>

        {safe.spendableBalance < 0 ? (
          <Text style={styles.heroWarningText}>
            {formatString(copy.billsExceedBalance, {
              amount: formatRupiah(Math.abs(safe.spendableBalance))
            })}
          </Text>
        ) : null}

        <View style={styles.monthCashflowTiles}>
          <View style={[styles.monthCashflowTile, styles.monthCashflowTileIncome]}>
            <View style={styles.pulseTopRow}>
              <View style={[styles.pulseIconBadge, styles.pulseIconIncome]}>
                <Ionicons color={colors.greenDark} name="shield-checkmark-outline" size={15} />
              </View>
              <Text style={styles.monthCashflowTileLabel}>{copy.safeDailyTile}</Text>
            </View>
            <Text numberOfLines={1} style={styles.monthCashflowTileValue}>
              {formatRupiah(safe.safeDaily)}
            </Text>
          </View>

          <View style={[styles.monthCashflowTile, styles.homeBalanceTileSpendable]}>
            <View style={styles.pulseTopRow}>
              <View style={[styles.pulseIconBadge, styles.pulseIconBalance]}>
                <Ionicons color={colors.blue} name="cash-outline" size={15} />
              </View>
              <Text style={styles.monthCashflowTileLabel}>{copy.spendableTile}</Text>
            </View>
            <Text numberOfLines={1} style={styles.monthCashflowTileValue}>
              {formatRupiah(safe.spendableBalance)}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel={copy.checkPurchaseA11y}
          accessibilityRole="button"
          onPress={() => setSheetOpen(true)}
          style={styles.homePurchaseCta}
        >
          <Ionicons color={colors.surface} name="help-circle-outline" size={18} />
          <Text style={styles.primaryButtonText}>{copy.checkPurchase}</Text>
        </Pressable>

      </View>

      <BottomSheet
        cardStyle={componentStyles.purchaseSheetCard}
        onClose={closePurchaseSheet}
        title={copy.sheetTitle}
        visible={sheetOpen}
      >
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

            <View style={[componentStyles.purchaseVerdict, purchaseVerdict.style]}>
              <View style={componentStyles.purchaseVerdictRow}>
                <Ionicons color={purchaseVerdict.textColor} name={purchaseVerdict.icon} size={20} />
                <View
                  accessibilityLiveRegion="polite"
                  style={componentStyles.purchaseVerdictCopy}
                >
                  <Text style={[componentStyles.purchaseVerdictText, { color: purchaseVerdict.textColor }]}>
                    {purchaseVerdict.headline}
                  </Text>
                  {purchaseVerdict.detail ? (
                    <Text style={[componentStyles.purchaseVerdictDetail, { color: purchaseVerdict.textColor }]}>
                      {purchaseVerdict.detail}
                    </Text>
                  ) : null}
                </View>
              </View>
              {showMeter ? (
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  onLayout={handleMeterTrackLayout}
                  style={componentStyles.purchaseMeterTrack}
                >
                  <Animated.View
                    style={[
                      componentStyles.purchaseMeterFill,
                      {
                        backgroundColor: meterColor,
                        width: meterFillWidth
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