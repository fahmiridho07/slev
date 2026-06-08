import React, { memo, useRef } from "react";
import { RefreshControlProps, ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { ScrollToFormProvider } from "../hooks/scrollToForm";
import { useTheme } from "../hooks/useTheme";

type StickyTabScreenProps = {
  children: React.ReactNode;
  hero: React.ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  scrollContentStyle: StyleProp<ViewStyle>;
  tabBar: React.ReactNode;
};

function StickyTabScreenComponent({
  children,
  hero,
  refreshControl,
  scrollContentStyle,
  tabBar
}: StickyTabScreenProps) {
  const { styles } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  return (
    <ScrollToFormProvider scrollRef={scrollRef}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={scrollContentStyle}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
        stickyHeaderIndices={[1]}
      >
        {hero}
        <View style={styles.stickyTabHeader}>{tabBar}</View>
        {children}
      </ScrollView>
    </ScrollToFormProvider>
  );
}

export const StickyTabScreen = memo(StickyTabScreenComponent);