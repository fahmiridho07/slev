import React, { memo } from "react";
import { Text, View } from "react-native";
import { componentStyles } from "../theme/styles/components";

type SectionHeaderProps = {
  title: string;
};

function SectionHeaderComponent({ title }: SectionHeaderProps) {
  return (
    <View style={componentStyles.sectionHeaderBlock}>
      <Text style={componentStyles.sectionTitle}>{title}</Text>
    </View>
  );
}

export const SectionHeader = memo(SectionHeaderComponent);