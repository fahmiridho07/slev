import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, View } from "react-native";
import { formatTime } from "../lib/analysis";
import { getTransferActivityTitle } from "../lib/activityFeed";
import { formatRupiah } from "../lib/spendingMemoryPatterns";
import { MoneyTransfer } from "../features/spendingMemory.types";
import { useTheme } from "../hooks/useTheme";

type TransferRowProps = {
  isLast?: boolean;
  transfer: MoneyTransfer;
};

function TransferRowComponent({ isLast = false, transfer }: TransferRowProps) {
  const { colors, componentStyles, strings } = useTheme();

  return (
    <View style={[componentStyles.momentRow, isLast && componentStyles.momentRowLast]}>
      <View style={componentStyles.momentIcon}>
        <Ionicons color={colors.blue} name="swap-horizontal-outline" size={18} />
      </View>
      <View style={componentStyles.momentText}>
        <Text style={componentStyles.momentTitle}>{getTransferActivityTitle(transfer)}</Text>
        <Text style={componentStyles.momentMeta}>
          {strings.capture.type.transferLabel} · {formatTime(transfer.occurredAt)}
          {transfer.note ? ` · ${transfer.note}` : ""}
        </Text>
      </View>
      <Text style={componentStyles.momentAmount}>{formatRupiah(transfer.amount)}</Text>
    </View>
  );
}

export const TransferRow = memo(TransferRowComponent);