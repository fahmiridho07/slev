import React, { memo, useEffect, useRef } from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { SafeToSpendCard } from "../features/analysis/SafeToSpendCard";
import { CapturePanel } from "../features/capture/CapturePanel";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { useTheme } from "../hooks/useTheme";

type HomeScreenProps = {
  captureFocusRequest: number;
  onOpenSettings: () => void;
  scrollContentStyle: StyleProp<ViewStyle>;
};

function HomeScreenComponent({
  captureFocusRequest,
  onOpenSettings,
  scrollContentStyle
}: HomeScreenProps) {
  const { reduceMotion } = useTheme();
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
      <SafeToSpendCard />
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
    </ScrollView>
  );
}

export const HomeScreen = memo(HomeScreenComponent);