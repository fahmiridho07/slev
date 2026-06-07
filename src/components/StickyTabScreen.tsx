import React, { memo } from "react";
import { RefreshControlProps, ScrollView, StyleProp, View, ViewStyle } from "react-native";
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

  return (
    <ScrollView
      contentContainerStyle={scrollContentStyle}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      stickyHeaderIndices={[1]}
    >
      {hero}
      <View style={styles.stickyTabHeader}>{tabBar}</View>
      {children}
    </ScrollView>
  );
}

export const StickyTabScreen = memo(StickyTabScreenComponent);