import React, { memo } from "react";
import { ScrollView, StyleProp, ViewStyle } from "react-native";
import { HomeMoneyPulse } from "../features/analysis/HomeMoneyPulse";
import { UpcomingBillsPanel } from "../features/analysis/UpcomingBillsPanel";
import { CapturePanel } from "../features/capture/CapturePanel";
import { AppNavigation } from "../navigation/appNavigation";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../state/useFinance";

type HomeScreenProps = {
  navigation: AppNavigation;
  onOpenSettings: () => void;
  scrollContentStyle: StyleProp<ViewStyle>;
};

function HomeScreenComponent({ navigation, onOpenSettings, scrollContentStyle }: HomeScreenProps) {
  const actions = useActions();
  const { allocationPlan, hasMonthlyPlan, latestBalanceTotal, monthlySummary, runwayMonths, upcomingBills } = useDerived();
  const { monthlyPlan, savingsGoals } = useFinanceSelector(
    (state) => ({
      monthlyPlan: state.monthlyPlan,
      savingsGoals: state.savingsGoals
    }),
    shallowEqual
  );

  return (
    <ScrollView contentContainerStyle={scrollContentStyle} keyboardShouldPersistTaps="handled">
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
      <CapturePanel onOpenSettings={onOpenSettings} />
      {upcomingBills.length > 0 && (
        <UpcomingBillsPanel
          upcomingBills={upcomingBills}
          onLogPayment={(billId) => void actions.logRecurringBillPayment(billId)}
        />
      )}
    </ScrollView>
  );
}

export const HomeScreen = memo(HomeScreenComponent);