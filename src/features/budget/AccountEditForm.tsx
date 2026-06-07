import React, { memo, useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SegmentedControl } from "../../components";
import { hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useActions } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";
import { AccountTier, MoneyAccount } from "../spendingMemory.types";
import { AccountFieldError } from "./budgetValidation";

type AccountEditFormProps = {
  account: MoneyAccount;
  onCancel: () => void;
  onSaved: () => void;
};

function AccountEditFormComponent({ account, onCancel, onSaved }: AccountEditFormProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const balanceStrings = strings.budget.balance;
  const actions = useActions();
  const [accountDraftLabel, setAccountDraftLabel] = useState(account.label);
  const [accountDraftKind, setAccountDraftKind] = useState<MoneyAccount["kind"]>(account.kind);
  const [accountDraftHub, setAccountDraftHub] = useState<"hub" | "pocket">(account.isIncomeHub ? "hub" : "pocket");
  const [accountDraftTier, setAccountDraftTier] = useState<AccountTier>(account.tier ?? "tracked");
  const [fieldError, setFieldError] = useState<FormValidationError<AccountFieldError> | null>(null);

  const save = useCallback(async () => {
    const result = await actions.saveAccount({
      id: account.id,
      isIncomeHub: accountDraftHub === "hub",
      kind: accountDraftKind,
      label: accountDraftLabel,
      tier: accountDraftTier
    });
    if (!result.ok) {
      hapticWarning();
      if (result.validation) {
        setFieldError(result.validation);
      }
      return;
    }
    setFieldError(null);
    onSaved();
  }, [account.id, accountDraftHub, accountDraftKind, accountDraftLabel, accountDraftTier, actions, onSaved]);

  return (
    <View style={componentStyles.sheetForm}>
      <ScrollView
        contentContainerStyle={styles.repeatBlock}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={componentStyles.sheetScroll}
      >
        <TextInput
          accessibilityLabel={
            fieldError?.field === "label"
              ? `${balanceStrings.accountPlaceholder}. ${fieldError.message}`
              : balanceStrings.accountPlaceholder
          }
          onChangeText={(value) => {
            setFieldError((current) => (current?.field === "label" ? null : current));
            setAccountDraftLabel(value);
          }}
          placeholder={balanceStrings.accountPlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={accountDraftLabel}
        />
        {fieldError?.field === "label" && (
          <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
            {fieldError.message}
          </Text>
        )}
        <SegmentedControl
          compact
          options={[
            { label: balanceStrings.accountKindBank, value: "bank" },
            { label: balanceStrings.accountKindWallet, value: "wallet" },
            { label: balanceStrings.accountKindCash, value: "cash" },
            { label: balanceStrings.accountKindOther, value: "other" }
          ]}
          selected={accountDraftKind}
          onSelect={setAccountDraftKind}
        />
        <SegmentedControl
          compact
          options={[
            { label: balanceStrings.incomeHub, value: "hub" },
            { label: balanceStrings.pocket, value: "pocket" }
          ]}
          selected={accountDraftHub}
          onSelect={setAccountDraftHub}
        />
        <View style={styles.repeatBlock}>
          <SegmentedControl
            compact
            options={[
              { label: balanceStrings.tracked, value: "tracked" },
              { label: balanceStrings.ephemeral, value: "ephemeral" }
            ]}
            selected={accountDraftTier}
            onSelect={setAccountDraftTier}
          />
          <Text style={styles.settingCopy}>{balanceStrings.ephemeralHint}</Text>
        </View>
      </ScrollView>
      <View style={componentStyles.sheetFooter}>
        <View style={componentStyles.editActions}>
          <Pressable accessibilityLabel={strings.common.cancel} accessibilityRole="button" onPress={onCancel} style={styles.secondaryButton}>
            <Text style={componentStyles.secondaryButtonText}>{strings.common.cancel}</Text>
          </Pressable>
          <Pressable accessibilityLabel={balanceStrings.saveAccount} accessibilityRole="button" onPress={() => void save()} style={styles.smallPrimaryButton}>
            <Text style={styles.primaryButtonText}>{balanceStrings.saveAccount}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const AccountEditForm = memo(AccountEditFormComponent);