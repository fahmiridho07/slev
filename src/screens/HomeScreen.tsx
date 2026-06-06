import React, { memo } from "react";
import { ScrollView } from "react-native";
import { HomeMoneyPulse } from "../features/analysis/HomeMoneyPulse";
import { CapturePanel } from "../features/capture/CapturePanel";
import { shallowEqual, useDerived, useFinanceSelector } from "../state/useFinance";
import { styles } from "../theme/styles/app";

type HomeScreenProps = {
  onOpenSettings: () => void;
};

function HomeScreenComponent({ onOpenSettings }: HomeScreenProps) {
  const { allocationPlan, hasMonthlyPlan, latestBalanceTotal, monthlySummary, runwayMonths } = useDerived();
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
      <CapturePanel onOpenSettings={onOpenSettings} />
    </ScrollView>
  );
}

export const HomeScreen = memo(HomeScreenComponent);