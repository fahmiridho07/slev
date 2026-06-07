import React, { memo } from "react";
import { Text, View } from "react-native";
import { MoneyAccount } from "../features/spendingMemory.types";
import { useTheme } from "../hooks/useTheme";
import { AccountMark } from "./AccountMark";

type AccountTitleProps = {
  kind?: MoneyAccount["kind"];
  label: string;
};

function AccountTitleComponent({
  kind,
  label
}: AccountTitleProps) {
  const { componentStyles } = useTheme();

  return (
    <View style={componentStyles.accountTitleRow}>
      <AccountMark kind={kind} label={label} />
      <Text style={componentStyles.analyticsTitle}>{label}</Text>
    </View>
  );
}

export const AccountTitle = memo(AccountTitleComponent);