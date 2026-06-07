import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { formatString } from "../i18n";
import { MoneyAccount } from "../features/spendingMemory.types";
import { useTheme } from "../hooks/useTheme";
import { AccountMark } from "./AccountMark";
import { ReorderableChipGrid } from "./ReorderableChipGrid";

type AccountPickerProps = {
  accounts: MoneyAccount[];
  label: string;
  onReorder?: (accounts: MoneyAccount[]) => void;
  reorderable?: boolean;
  reorderHint?: string;
  selected: string;
  onSelect: (value: string) => void;
};

function AccountPickerComponent({
  accounts,
  label,
  onReorder,
  reorderable = false,
  reorderHint,
  selected,
  onSelect
}: AccountPickerProps) {
  const { componentStyles, strings, styles } = useTheme();

  return (
    <View style={componentStyles.accountPickerBlock}>
      <Text style={componentStyles.microLabel}>{label}</Text>
      {reorderable && reorderHint ? <Text style={styles.captureReorderHint}>{reorderHint}</Text> : null}
      {reorderable && onReorder ? (
        <ReorderableChipGrid
          chipAccessibilityLabel={(account) =>
            formatString(strings.common.selectAccount, { label: account.label })
          }
          chipStyle={(active, dragging, hover) => [
            componentStyles.accountChip,
            active && componentStyles.accountChipActive,
            dragging && componentStyles.chipDragging,
            hover && componentStyles.chipDropTarget
          ]}
          getKey={(account) => account.label}
          items={accounts}
          onReorder={onReorder}
          onSelect={(account) => onSelect(account.label)}
          renderChip={(account, active) => (
            <>
              <AccountMark kind={account.kind} label={account.label} size="small" />
              <Text style={[componentStyles.accountChipText, active && componentStyles.accountChipTextActive]}>
                {account.label}
              </Text>
            </>
          )}
          selectedKey={selected}
          wrapStyle={componentStyles.accountChipRow}
        />
      ) : (
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
      )}
    </View>
  );
}

export const AccountPicker = memo(AccountPickerComponent);