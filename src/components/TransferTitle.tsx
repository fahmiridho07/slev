import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, View } from "react-native";
import { colors } from "../theme/colors";
import { componentStyles } from "../theme/styles/components";
import { AccountMark } from "./AccountMark";

type TransferTitleProps = {
  fromLabel: string;
  toLabel: string;
};

function TransferTitleComponent({
  fromLabel,
  toLabel
}: TransferTitleProps) {
  return (
    <View style={componentStyles.transferTitleRow}>
      <AccountMark label={fromLabel} size="small" />
      <Ionicons name="arrow-forward-outline" size={14} color={colors.muted} />
      <AccountMark label={toLabel} size="small" />
      <Text style={componentStyles.analyticsTitle}>{fromLabel} to {toLabel}</Text>
    </View>
  );
}

export const TransferTitle = memo(TransferTitleComponent);