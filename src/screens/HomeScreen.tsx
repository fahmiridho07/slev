import React, { memo, useEffect, useRef } from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { SafeToSpendCard } from "../features/analysis/SafeToSpendCard";
import { CapturePanel } from "../features/capture/CapturePanel";
import { SettingsTabKey } from "../features/app.types";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { useTheme } from "../hooks/useTheme";

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
  const { reduceMotion, styles } = useTheme();
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
        <SafeToSpendCard onOpenSettings={onOpenSettings} />
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