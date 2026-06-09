import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import {
  AccountTitle,
  BottomSheet,
  DeleteConfirmDialog,
  ListActionRow,
  ListActionsOnboardingTip,
  SectionHeader,
  SegmentedControl
} from "../../components";
import { useListActionsHint } from "../../hooks/useListActionsHint";
import { formatString, type AppStrings } from "../../i18n";
import { getAccountBalances, getTrackedTotalBalance } from "../../lib/accountLedger";
import { formatAmountInput } from "../../lib/formatMoney";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { AccountTier, MoneyAccount, MoneyTransfer, SpendingMoment } from "../spendingMemory.types";
import { hapticSelection, hapticWarning } from "../../lib/haptics";
import { FormValidationError } from "../../lib/formValidation";
import { useTheme } from "../../hooks/useTheme";
import { AccountFieldError } from "./budgetValidation";
import { AccountEditForm } from "./AccountEditForm";

function formatBalance(amount: number): string {
  return amount < 0 ? `-${formatRupiah(Math.abs(amount))}` : formatRupiah(amount);
}

function getAccountKindLabel(kind: MoneyAccount["kind"], strings: AppStrings) {
  switch (kind) {
    case "bank":
      return strings.budget.balance.accountKindBank;
    case "wallet":
      return strings.budget.balance.accountKindWallet;
    case "cash":
      return strings.budget.balance.accountKindCash;
    default:
      return strings.budget.balance.accountKindOther;
  }
}

export function BalancePanel({
  accounts,
  moments,
  transfers,
  onDeleteAccount,
  onSaveAccount
}: {
  accounts: MoneyAccount[];
  moments: SpendingMoment[];
  transfers: MoneyTransfer[];
  onDeleteAccount: (id: string) => void;
  onSaveAccount: (input: {
    id?: string;
    isIncomeHub: boolean;
    kind: MoneyAccount["kind"];
    label: string;
    openingBalance?: number;
    tier?: MoneyAccount["tier"];
  }) => Promise<{ ok: boolean; validation?: FormValidationError<AccountFieldError> }>;
}) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const balanceStrings = strings.budget.balance;
  const [editingAccount, setEditingAccount] = useState<MoneyAccount | null>(null);
  const [accountDraftLabel, setAccountDraftLabel] = useState("");
  const [accountDraftOpening, setAccountDraftOpening] = useState("");
  const [accountDraftKind, setAccountDraftKind] = useState<MoneyAccount["kind"]>("bank");
  const [accountDraftHub, setAccountDraftHub] = useState<"hub" | "pocket">("pocket");
  const [accountDraftTier, setAccountDraftTier] = useState<AccountTier>("tracked");
  const [pendingDeleteAccount, setPendingDeleteAccount] = useState<MoneyAccount | null>(null);
  const [accountFieldError, setAccountFieldError] = useState<FormValidationError<AccountFieldError> | null>(null);

  const balancesById = useMemo(() => {
    const map = new Map<string, number>();
    for (const { account, balance } of getAccountBalances(accounts, moments, transfers)) {
      map.set(account.id, balance);
    }
    return map;
  }, [accounts, moments, transfers]);

  const trackedTotal = useMemo(
    () => getTrackedTotalBalance(accounts, moments, transfers),
    [accounts, moments, transfers]
  );

  function editAccount(account: MoneyAccount) {
    hapticSelection();
    setEditingAccount(account);
  }

  function resetAddAccountDraft() {
    setAccountDraftLabel("");
    setAccountDraftOpening("");
    setAccountDraftKind("bank");
    setAccountDraftHub("pocket");
    setAccountDraftTier("tracked");
    setAccountFieldError(null);
  }

  const renderAccountItem = useCallback(
    ({ item: account }: { item: MoneyAccount }) => {
      const accountMeta = account.isIncomeHub
        ? balanceStrings.incomeHubMeta
        : account.tier === "ephemeral"
          ? balanceStrings.ephemeralPocketMeta
          : getAccountKindLabel(account.kind, strings);

      return (
        <ListActionRow
          accessibilityLabel={formatString(balanceStrings.editAccountA11y, { label: account.label })}
          onDelete={() => setPendingDeleteAccount(account)}
          onPress={() => editAccount(account)}
          rowKey={account.id}
        >
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsRowHeader}>
              <View style={styles.budgetTitleBlock}>
                <AccountTitle kind={account.kind} label={account.label} />
                <Text style={styles.settingCopy}>{accountMeta}</Text>
              </View>
              <Text style={styles.analyticsAmount}>{formatBalance(balancesById.get(account.id) ?? 0)}</Text>
            </View>
          </View>
        </ListActionRow>
      );
    },
    [balanceStrings, balancesById, strings, styles]
  );

  const accountKeyExtractor = useCallback((account: MoneyAccount) => account.id, []);
  const { dismiss: dismissAccountsHint, visible: showAccountsHint } = useListActionsHint("balance_accounts", accounts.length > 0);

  return (
    <View style={styles.cardStack}>
      <View style={styles.capturePanel}>
        <Text style={componentStyles.microLabel}>{balanceStrings.addAccount}</Text>
        <TextInput
          accessibilityLabel={
            accountFieldError?.field === "label"
              ? `${balanceStrings.accountPlaceholder}. ${accountFieldError.message}`
              : balanceStrings.accountPlaceholder
          }
          onChangeText={(value) => {
            setAccountFieldError((current) => (current?.field === "label" ? null : current));
            setAccountDraftLabel(value);
          }}
          placeholder={balanceStrings.accountPlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={accountDraftLabel}
        />
        {accountFieldError?.field === "label" && (
          <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
            {accountFieldError.message}
          </Text>
        )}
        <Text style={componentStyles.microLabel}>{balanceStrings.openingBalance}</Text>
        <TextInput
          accessibilityLabel={balanceStrings.openingBalance}
          keyboardType="numeric"
          onChangeText={(value) => setAccountDraftOpening(formatAmountInput(value))}
          placeholder="0"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={accountDraftOpening}
        />
        <Text style={styles.settingCopy}>{balanceStrings.openingBalanceHint}</Text>
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
        <View style={componentStyles.editActions}>
          <Pressable
            onPress={() => {
              void (async () => {
                const openingDigits = accountDraftOpening.replace(/[^\d]/g, "");
                const result = await onSaveAccount({
                  isIncomeHub: accountDraftHub === "hub",
                  kind: accountDraftKind,
                  label: accountDraftLabel,
                  openingBalance: openingDigits ? Number.parseInt(openingDigits, 10) : 0,
                  tier: accountDraftTier
                });
                if (!result.ok) {
                  hapticWarning();
                  if (result.validation) {
                    setAccountFieldError(result.validation);
                  }
                  return;
                }
                resetAddAccountDraft();
              })();
            }}
            style={styles.smallPrimaryButton}
          >
            <Text style={styles.primaryButtonText}>{balanceStrings.saveAccount}</Text>
          </Pressable>
        </View>
      </View>

      {showAccountsHint && (
        <ListActionsOnboardingTip
          body={strings.listHints.balance_accounts.body}
          onDismiss={dismissAccountsHint}
          title={strings.listHints.balance_accounts.title}
        />
      )}
      <View style={styles.capturePanel}>
        <Text style={componentStyles.microLabel}>{balanceStrings.trackedTotal}</Text>
        <Text style={styles.analyticsAmount}>{formatBalance(trackedTotal)}</Text>
      </View>
      <SectionHeader title={balanceStrings.yourAccounts} />
      <View style={styles.listPanel}>
        <FlatList
          data={accounts}
          keyExtractor={accountKeyExtractor}
          renderItem={renderAccountItem}
          scrollEnabled={false}
        />
      </View>

      <BottomSheet
        onClose={() => setEditingAccount(null)}
        title={
          editingAccount
            ? formatString(balanceStrings.editAccountA11y, { label: editingAccount.label })
            : balanceStrings.editAccount
        }
        visible={Boolean(editingAccount)}
      >
        {editingAccount ? (
          <AccountEditForm
            key={editingAccount.id}
            account={editingAccount}
            onCancel={() => setEditingAccount(null)}
            onSaved={() => setEditingAccount(null)}
          />
        ) : null}
      </BottomSheet>
      <DeleteConfirmDialog
        body={
          pendingDeleteAccount
            ? formatString(balanceStrings.deleteAccountBody, { label: pendingDeleteAccount.label })
            : ""
        }
        onCancel={() => setPendingDeleteAccount(null)}
        onConfirm={() => {
          if (pendingDeleteAccount) {
            onDeleteAccount(pendingDeleteAccount.id);
            if (editingAccount?.id === pendingDeleteAccount.id) {
              setEditingAccount(null);
            }
            setPendingDeleteAccount(null);
          }
        }}
        title={balanceStrings.deleteAccountTitle}
        visible={Boolean(pendingDeleteAccount)}
      />
    </View>
  );
}