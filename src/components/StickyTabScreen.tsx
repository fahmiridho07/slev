import React, { memo } from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { useTheme } from "../hooks/useTheme";

type StickyTabScreenProps = {
  children: React.ReactNode;
  hero: React.ReactNode;
  scrollContentStyle: StyleProp<ViewStyle>;
  tabBar: React.ReactNode;
};

function StickyTabScreenComponent({
  children,
  hero,
  scrollContentStyle,
  tabBar
}: StickyTabScreenProps) {
  const { styles } = useTheme();

  return (
    <ScrollView
      contentContainerStyle={scrollContentStyle}
      keyboardShouldPersistTaps="handled"
      stickyHeaderIndices={[1]}
    >
      {hero}
      <View style={styles.stickyTabHeader}>{tabBar}</View>
      {children}
    </ScrollView>
  );
}

export const StickyTabScreen = memo(StickyTabScreenComponent);