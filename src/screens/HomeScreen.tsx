import React, { memo } from "react";
import { ScrollView } from "react-native";
import { HomeMoneyPulse } from "../features/analysis/HomeMoneyPulse";
import { CapturePanel } from "../features/capture/CapturePanel";
import { useDerived } from "../state/useFinance";
import { styles } from "../theme/styles/app";

type HomeScreenProps = {
  onOpenSettings: () => void;
};

function HomeScreenComponent({ onOpenSettings }: HomeScreenProps) {
  const { latestBalanceTotal, monthlyPlan, monthlySummary } = useDerived();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <HomeMoneyPulse
        latestBalanceTotal={latestBalanceTotal}
        monthlyPlan={monthlyPlan}
        monthlySummary={monthlySummary}
      />
      <CapturePanel onOpenSettings={onOpenSettings} />
    </ScrollView>
  );
}

export const HomeScreen = memo(HomeScreenComponent);