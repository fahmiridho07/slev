import React, { memo, useState } from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { BottomSheet, CaptureFab } from "../components";
import { HomeMoneyPulse } from "../features/analysis/HomeMoneyPulse";
import { UpcomingBillsPanel } from "../features/analysis/UpcomingBillsPanel";
import { CapturePanel } from "../features/capture/CapturePanel";
import { useLayoutInsets } from "../hooks/useLayoutInsets";
import { useTheme } from "../hooks/useTheme";
import { AppNavigation } from "../navigation/appNavigation";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../state/useFinance";

type HomeScreenProps = {
  navigation: AppNavigation;
  onOpenSettings: () => void;
  scrollContentStyle: StyleProp<ViewStyle>;
};

function HomeScreenComponent({ navigation, onOpenSettings, scrollContentStyle }: HomeScreenProps) {
  const { strings } = useTheme();
  const actions = useActions();
  const { tabBarHeight } = useLayoutInsets();
  const { allocationPlan, hasMonthlyPlan, latestBalanceTotal, monthlySummary, runwayMonths, upcomingBills } = useDerived();
  const { monthlyPlan, savingsGoals } = useFinanceSelector(
    (state) => ({
      monthlyPlan: state.monthlyPlan,
      savingsGoals: state.savingsGoals
    }),
    shallowEqual
  );
  const [captureOpen, setCaptureOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[scrollContentStyle, { paddingBottom: tabBarHeight + 88 }]}
        keyboardShouldPersistTaps="handled"
      >
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
          upcomingBills={upcomingBills}
          onLogPayment={(billId) => void actions.logRecurringBillPayment(billId)}
        />
      </ScrollView>

      <CaptureFab
        accessibilityLabel={strings.capture.fabLabel}
        bottom={tabBarHeight + 12}
        onPress={() => setCaptureOpen(true)}
      />

      <BottomSheet
        onClose={() => setCaptureOpen(false)}
        title={strings.capture.sheetTitle}
        visible={captureOpen}
      >
        <CapturePanel
          onOpenSettings={() => {
            setCaptureOpen(false);
            onOpenSettings();
          }}
          onSaved={() => setCaptureOpen(false)}
          sheet
        />
      </BottomSheet>
    </View>
  );
}

export const HomeScreen = memo(HomeScreenComponent);