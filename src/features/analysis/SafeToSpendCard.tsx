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
import { getDailyPocketLabel, getIncomeHubLabel } from "../../lib/analysis";
import { getPurchaseCategoryMatch } from "../../lib/purchaseContext";
import { PurchaseVerdictPanel } from "./PurchaseVerdictPanel";
import { getPurchaseVerdictCopy, resolvePurchaseVerdictUi } from "../../lib/purchaseVerdict";
import { buildSafeToSpend, simulatePurchase, type SafeToSpendPace } from "../../lib/safeToSpend";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import type { AppStrings } from "../../i18n/types";
import { hapticSuccess, hapticWarning } from "../../lib/haptics";
import { shallowEqual, useActions, useFinanceDerived, useFinanceSelector } from "../../state/useFinance";
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
  const actions = useActions();
  const categoryLabels = useFinanceDerived((derived) => derived.categoryLabels);
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
  const [loggingPurchase, setLoggingPurchase] = useState(false);
  const lastExpenseContext = useFinanceSelector(
    (state) => state.moments.find((moment) => moment.type === "expense")?.context ?? "Other"
  );

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
  const purchaseCategoryMatch = useMemo(() => {
    if (purchaseAmount == null) {
      return null;
    }

    return getPurchaseCategoryMatch({
      amount: purchaseAmount,
      moments,
      strings
    });
  }, [moments, purchaseAmount, strings]);

  const purchaseVerdictUi = useMemo(
    () =>
      resolvePurchaseVerdictUi({
        insight: purchaseSimulation?.insight ?? null,
        strings
      }),
    [purchaseSimulation?.insight, strings]
  );

  const purchaseVerdict = useMemo(() => {
    if (purchaseSimulation == null) {
      return null;
    }

    const messages = getPurchaseVerdictCopy({
      categoryMatch: purchaseCategoryMatch,
      horizon: paydayDayOfMonth != null ? "payday" : "month_end",
      safe,
      simulation: purchaseSimulation,
      strings
    });

    return {
      contextNote: messages.contextNote ?? null,
      detail: messages.detail,
      footnote: messages.footnote ?? null,
      headline: messages.headline
    };
  }, [paydayDayOfMonth, purchaseCategoryMatch, purchaseSimulation, safe, strings]);

  const canLogPurchase =
    purchaseAmount != null &&
    purchaseAmount > 0 &&
    categoryLabels.length > 0 &&
    purchaseSimulation?.verdict !== "unaffordable";

  const logPurchaseContext = useMemo(() => {
    if (purchaseCategoryMatch && categoryLabels.includes(purchaseCategoryMatch.category)) {
      return purchaseCategoryMatch.category;
    }
    if (categoryLabels.includes(lastExpenseContext)) {
      return lastExpenseContext;
    }
    return categoryLabels.includes("Other") ? "Other" : categoryLabels[0] ?? "Other";
  }, [categoryLabels, lastExpenseContext, purchaseCategoryMatch]);

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
    setLoggingPurchase(false);
  }

  const handleLogPurchase = useCallback(async () => {
    if (!canLogPurchase || loggingPurchase) {
      return;
    }

    const incomeHub = getIncomeHubLabel(accounts);
    const dailyPocket = getDailyPocketLabel(accounts);
    const fallbackToAccount =
      dailyPocket === incomeHub
        ? accounts.find((account) => account.label !== incomeHub)?.label ?? dailyPocket
        : dailyPocket;

    setLoggingPurchase(true);
    const result = await actions.saveMoment(
      {
        accountLabel: dailyPocket,
        amountText: purchaseDraft,
        context: logPurchaseContext,
        entryType: "expense",
        fromAccount: incomeHub,
        label: "",
        note: "",
        occurredAtKey: null,
        source: "",
        toAccount: fallbackToAccount
      },
      categoryLabels.length
    );
    setLoggingPurchase(false);

    if (!result.ok) {
      hapticWarning();
      return;
    }

    hapticSuccess();
    closePurchaseSheet();
  }, [
    accounts,
    actions,
    canLogPurchase,
    categoryLabels.length,
    logPurchaseContext,
    loggingPurchase,
    purchaseDraft
  ]);

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
        <View style={componentStyles.purchaseSheetForm}>
          <ScrollView
            contentContainerStyle={componentStyles.purchaseSheet}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={componentStyles.purchaseSheetScroll}
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

            <View style={componentStyles.purchaseSheetContext}>
              <Ionicons color={colors.muted} name="time-outline" size={14} />
              <Text style={componentStyles.purchaseSheetContextText}>
                {formatString(copy.sheetContext, {
                  amount: formatRupiah(safe.safeDaily),
                  days: safe.daysLeft
                })}
              </Text>
            </View>

            {purchaseVerdict ? (
              <PurchaseVerdictPanel
                contextNote={purchaseVerdict.contextNote}
                detail={purchaseVerdict.detail}
                footnote={purchaseVerdict.footnote}
                headline={purchaseVerdict.headline}
                meterColor={meterColor}
                meterFillWidth={meterFillWidth}
                newSafeDaily={purchaseSimulation?.newSafeDaily ?? 0}
                onMeterTrackLayout={handleMeterTrackLayout}
                safeDaily={safe.safeDaily}
                showMeter={showMeter}
                ui={purchaseVerdictUi}
              />
            ) : null}

            {canLogPurchase ? (
              <Pressable
                accessibilityLabel={copy.purchaseVerdict.logExpenseA11y}
                accessibilityRole="button"
                accessibilityState={{ busy: loggingPurchase, disabled: loggingPurchase }}
                disabled={loggingPurchase}
                onPress={() => void handleLogPurchase()}
                style={componentStyles.purchaseLogButton}
              >
                <Ionicons color={colors.greenDark} name="add-circle-outline" size={18} />
                <Text style={componentStyles.textButtonLabel}>
                  {loggingPurchase ? copy.purchaseVerdict.loggingExpense : copy.purchaseVerdict.logExpense}
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </BottomSheet>
    </>
  );
}

export const SafeToSpendCard = memo(SafeToSpendCardComponent);