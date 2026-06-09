import React, { memo, useEffect, useRef } from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { HomeSetupHints } from "../features/analysis/HomeSetupHints";
import { SafeToSpendCard } from "../features/analysis/SafeToSpendCard";
import { CapturePanel } from "../features/capture/CapturePanel";
import { SettingsTabKey } from "../features/app.types";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { useTheme } from "../hooks/useTheme";
import { shallowEqual, useFinanceSelector } from "../state/useFinance";

type HomeScreenProps = {
  captureFocusRequest: number;
  onOpenSettings: (tab?: SettingsTabKey) => void;
  scrollContentStyle: StyleProp<ViewStyle>;
};

function HomeScreenComponent({
  captureFocusRequest,
  onOpenSettings,
  scrollContentStyle
}: HomeScreenProps) {
  const { paydayDayOfMonth, reduceMotion, styles } = useTheme();
  const { accounts, moments, recurringBills, transfers } = useFinanceSelector(
    (state) => ({
      accounts: state.accounts,
      moments: state.moments,
      recurringBills: state.recurringBills,
      transfers: state.transfers
    }),
    shallowEqual
  );
  const { refreshControl } = usePullToRefresh();
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
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      <View style={styles.cardStack}>
        <SafeToSpendCard />
        <HomeSetupHints
          accounts={accounts}
          moments={moments}
          onOpenSettings={onOpenSettings}
          paydayDayOfMonth={paydayDayOfMonth}
          recurringBills={recurringBills}
          transfers={transfers}
        />
        <View
          onLayout={(event) => {
            captureOffsetRef.current = event.nativeEvent.layout.y;
          }}
        >
          <CapturePanel
            compactTypePicker
            focusAmountToken={captureFocusRequest}
            onOpenSettings={onOpenSettings}
          />
        </View>
      </View>
    </ScrollView>
  );
}

export const HomeScreen = memo(HomeScreenComponent);