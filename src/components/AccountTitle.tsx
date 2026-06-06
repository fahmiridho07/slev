import React, { memo } from "react";
import { Text, View } from "react-native";
import { MoneyAccount } from "../features/spendingMemory.types";
import { componentStyles } from "../theme/styles/components";
import { AccountMark } from "./AccountMark";

type AccountTitleProps = {
  kind?: MoneyAccount["kind"];
  label: string;
};

function AccountTitleComponent({
  kind,
  label
}: AccountTitleProps) {
  return (
    <View style={componentStyles.accountTitleRow}>
      <AccountMark kind={kind} label={label} />
      <Text style={componentStyles.analyticsTitle}>{label}</Text>
    </View>
  );
}

export const AccountTitle = memo(AccountTitleComponent);