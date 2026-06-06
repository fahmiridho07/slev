import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { MoneyAccount } from "../features/spendingMemory.types";
import { componentStyles } from "../theme/styles/components";
import { AccountMark } from "./AccountMark";

type AccountPickerProps = {
  accounts: MoneyAccount[];
  label: string;
  selected: string;
  onSelect: (value: string) => void;
};

function AccountPickerComponent({
  accounts,
  label,
  selected,
  onSelect
}: AccountPickerProps) {
  return (
    <View style={componentStyles.accountPickerBlock}>
      <Text style={componentStyles.microLabel}>{label}</Text>
      <View style={componentStyles.accountChipRow}>
        {accounts.map((account) => {
          const active = selected === account.label;
          return (
            <Pressable
              accessibilityRole="button"
              key={account.id}
              onPress={() => onSelect(account.label)}
              style={[componentStyles.accountChip, active && componentStyles.accountChipActive]}
            >
              <AccountMark kind={account.kind} label={account.label} size="small" />
              <Text style={[componentStyles.accountChipText, active && componentStyles.accountChipTextActive]}>{account.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const AccountPicker = memo(AccountPickerComponent);