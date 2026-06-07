import React, { memo } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";

type SectionHeaderProps = {
  title: string;
};

function SectionHeaderComponent({ title }: SectionHeaderProps) {
  const { componentStyles } = useTheme();

  return (
    <View style={componentStyles.sectionHeaderBlock}>
      <Text accessibilityRole="header" style={componentStyles.sectionTitle}>
        {title}
      </Text>
    </View>
  );
}

export const SectionHeader = memo(SectionHeaderComponent);