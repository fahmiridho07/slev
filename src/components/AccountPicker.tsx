import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { formatString } from "../i18n";
import { MoneyAccount } from "../features/spendingMemory.types";
import { useTheme } from "../hooks/useTheme";
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
  const { componentStyles, strings } = useTheme();

  return (
    <View style={componentStyles.accountPickerBlock}>
      <Text style={componentStyles.microLabel}>{label}</Text>
      <View style={componentStyles.accountChipRow}>
        {accounts.map((account) => {
          const active = selected === account.label;
          return (
            <Pressable
              accessibilityLabel={formatString(strings.common.selectAccount, { label: account.label })}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={account.id}
              onPress={() => onSelect(account.label)}
              style={[componentStyles.accountChip, active && componentStyles.accountChipActive]}
            >
              <AccountMark kind={account.kind} label={account.label} size="small" />
              <Text style={[componentStyles.accountChipText, active && componentStyles.accountChipTextActive]}>
                {account.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const AccountPicker = memo(AccountPickerComponent);