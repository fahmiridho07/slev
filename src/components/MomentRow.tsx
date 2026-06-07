import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, View } from "react-native";
import { displayContext } from "../i18n/display";
import { formatTime, getMomentTitle } from "../lib/analysis";
import { formatMomentAmount } from "../lib/formatMoney";
import { SpendingMoment } from "../features/spendingMemory.types";
import { useTheme } from "../hooks/useTheme";
import { contextIcon } from "./presentation";

type MomentRowProps = {
  moment: SpendingMoment;
  repeatHint?: string;
};

function MomentRowComponent({ moment, repeatHint }: MomentRowProps) {
  const { colors, componentStyles, strings } = useTheme();
  const isIncome = moment.type === "income";

  return (
    <View style={componentStyles.momentRow}>
      <View style={[componentStyles.momentIcon, isIncome && componentStyles.incomeMomentIcon]}>
        <Ionicons
          name={isIncome ? "cash-outline" : contextIcon(moment.context)}
          size={18}
          color={isIncome ? colors.blue : colors.greenDark}
        />
      </View>
      <View style={componentStyles.momentText}>
        <Text style={componentStyles.momentTitle}>{getMomentTitle(moment)}</Text>
        <Text style={componentStyles.momentMeta}>
          {isIncome ? strings.common.income : displayContext(moment.context)} · {formatTime(moment.occurredAt)}
          {moment.accountLabel ? ` - ${moment.accountLabel}` : ""}
          {moment.note ? ` - ${moment.note}` : ""}
        </Text>
        {repeatHint && !isIncome && <Text style={componentStyles.repeatHint}>{repeatHint}</Text>}
      </View>
      <Text style={[componentStyles.momentAmount, isIncome && componentStyles.incomeText]}>{formatMomentAmount(moment)}</Text>
    </View>
  );
}

export const MomentRow = memo(MomentRowComponent);