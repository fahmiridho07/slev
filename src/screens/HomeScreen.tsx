import React, { memo } from "react";
import { ScrollView } from "react-native";
import { HomeMoneyPulse } from "../features/analysis/HomeMoneyPulse";
import { UpcomingBillsPanel } from "../features/analysis/UpcomingBillsPanel";
import { CapturePanel } from "../features/capture/CapturePanel";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../state/useFinance";
import { styles } from "../theme/styles/app";

type HomeScreenProps = {
  onOpenSettings: () => void;
};

function HomeScreenComponent({ onOpenSettings }: HomeScreenProps) {
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
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <HomeMoneyPulse
        dailyFlexibleRoom={allocationPlan.dailyFlexibleRoom}
        hasMonthlyPlan={hasMonthlyPlan}
        latestBalanceTotal={latestBalanceTotal}
        monthlyPlan={monthlyPlan}
        monthlySummary={monthlySummary}
        runwayMonths={runwayMonths}
        savingsGoals={savingsGoals}
      />
      <UpcomingBillsPanel
        upcomingBills={upcomingBills}
        onLogPayment={(billId) => void actions.logRecurringBillPayment(billId)}
      />
      <CapturePanel onOpenSettings={onOpenSettings} />
    </ScrollView>
  );
}

export const HomeScreen = memo(HomeScreenComponent);