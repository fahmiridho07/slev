import React, { memo } from "react";
import { ScrollView } from "react-native";
import { HomeMoneyPulse } from "../features/analysis/HomeMoneyPulse";
import { CapturePanel } from "../features/capture/CapturePanel";
import { useFinance } from "../state/useFinance";
import { styles } from "../theme/styles/app";

type HomeScreenProps = {
  onOpenSettings: () => void;
};

function HomeScreenComponent({ onOpenSettings }: HomeScreenProps) {
  const { derived, state } = useFinance();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <HomeMoneyPulse
        latestBalanceTotal={derived.latestBalanceTotal}
        monthlyPlan={state.monthlyPlan}
        monthlySummary={derived.monthlySummary}
      />
      <CapturePanel onOpenSettings={onOpenSettings} />
    </ScrollView>
  );
}

export const HomeScreen = memo(HomeScreenComponent);