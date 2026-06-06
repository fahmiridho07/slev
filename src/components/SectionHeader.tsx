import React, { memo } from "react";
import { Text } from "react-native";
import { componentStyles } from "../theme/styles/components";

type SectionHeaderProps = {
  title: string;
};

function SectionHeaderComponent({ title }: SectionHeaderProps) {
  return <Text style={componentStyles.sectionTitle}>{title}</Text>;
}

export const SectionHeader = memo(SectionHeaderComponent);