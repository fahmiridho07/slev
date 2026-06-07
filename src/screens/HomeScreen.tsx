import React, { memo, useEffect, useRef } from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { HomeMoneyPulse } from "../features/analysis/HomeMoneyPulse";
import { UpcomingBillsPanel } from "../features/analysis/UpcomingBillsPanel";
import { CapturePanel } from "../features/capture/CapturePanel";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { useTheme } from "../hooks/useTheme";
import { AppNavigation } from "../navigation/appNavigation";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../state/useFinance";

type HomeScreenProps = {
  captureFocusRequest: number;
  navigation: AppNavigation;
  onOpenSettings: () => void;
  scrollContentStyle: StyleProp<ViewStyle>;
};

function HomeScreenComponent({
  captureFocusRequest,
  navigation,
  onOpenSettings,
  scrollContentStyle
}: HomeScreenProps) {
  const { capturePanelPreference, reduceMotion } = useTheme();
  const { refreshControl } = usePullToRefresh();
  const actions = useActions();
  const { allocationPlan, hasMonthlyPlan, latestBalanceTotal, monthlySummary, runwayMonths, upcomingBills } = useDerived();
  const { monthlyPlan, savingsGoals } = useFinanceSelector(
    (state) => ({
      monthlyPlan: state.monthlyPlan,
      savingsGoals: state.savingsGoals
    }),
    shallowEqual
  );
  const scrollRef = useRef<ScrollView>(null);
  const captureOffsetRef = useRef(0);

  useEffect(() => {
    if (captureFocusRequest <= 0) {
      return;
    }

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        animated: !reduceMotion,
        y: Math.max(0, captureOffsetRef.current - 12)
      });
    });
  }, [captureFocusRequest, reduceMotion]);

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={scrollContentStyle}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      <View
        onLayout={(event) => {
          captureOffsetRef.current = event.nativeEvent.layout.y;
        }}
      >
        <CapturePanel
          compactTypePicker
          defaultExpanded={capturePanelPreference === "expanded"}
          focusAmountToken={captureFocusRequest}
          onOpenSettings={onOpenSettings}
        />
      </View>
      <HomeMoneyPulse
        dailyFlexibleRoom={allocationPlan.dailyFlexibleRoom}
        hasMonthlyPlan={hasMonthlyPlan}
        latestBalanceTotal={latestBalanceTotal}
        monthlyPlan={monthlyPlan}
        monthlySummary={monthlySummary}
        onOpenBudgetPlan={navigation.openBudgetPlan}
        runwayMonths={runwayMonths}
        savingsGoals={savingsGoals}
      />
      <UpcomingBillsPanel
        onOpenSettings={onOpenSettings}
        upcomingBills={upcomingBills}
        onLogPayment={(billId) => void actions.logRecurringBillPayment(billId)}
      />
    </ScrollView>
  );
}

export const HomeScreen = memo(HomeScreenComponent);