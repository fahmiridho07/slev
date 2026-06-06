import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, View } from "react-native";
import { SpendingPattern } from "../features/spendingMemory.types";
import { componentStyles } from "../theme/styles/components";
import { getPatternToneStyle, patternColor, patternIcon } from "./presentation";

type ObservationPanelProps = {
  pattern: SpendingPattern;
};

function ObservationPanelComponent({ pattern }: ObservationPanelProps) {
  return (
    <View style={[componentStyles.observationPanel, getPatternToneStyle(pattern.tone)]}>
      <View style={componentStyles.patternTitleRow}>
        <Ionicons name={patternIcon(pattern.tone)} size={18} color={patternColor(pattern.tone)} />
        <Text style={componentStyles.patternTitle}>{pattern.title}</Text>
      </View>
      <Text style={componentStyles.patternDetail}>{pattern.detail}</Text>
    </View>
  );
}

export const ObservationPanel = memo(ObservationPanelComponent);