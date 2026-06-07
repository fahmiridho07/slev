import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import {
  AccountPicker,
  AccountTitle,
  DeleteConfirmDialog,
  EmptyState,
  ListActionRow,
  ListActionsOnboardingTip,
  SectionHeader,
  SegmentedControl
} from "../../components";
import { useListActionsHint } from "../../hooks/useListActionsHint";
import { formatString, type AppStrings } from "../../i18n";
import { formatAmountInput, formatSignedCompactRupiah } from "../../lib/formatMoney";
import {
  AccountDriftRow,
  getLatestBalanceSnapshots,
  getLatestBalanceTotal,
  summarizeBalanceByTier
} from "../../lib/financeEngine";
import { formatCompactRupiah, formatRupiah } from "../../lib/spendingMemoryPatterns";
import { AccountTier, BalanceSnapshot, MoneyAccount } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";

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
  accountDrift,
  accounts,
  balanceSnapshots,
  projectedBalanceSnapshots,
  onDeleteAccount,
  onSaveAccount,
  onSaveBalance
}: {
  accountDrift: AccountDriftRow[];
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  projectedBalanceSnapshots: BalanceSnapshot[];
  onDeleteAccount: (id: string) => void;
  onSaveAccount: (input: {
    id?: string;
    isIncomeHub: boolean;
    kind: MoneyAccount["kind"];
    label: string;
    tier?: MoneyAccount["tier"];
  }) => void;
  onSaveBalance: (input: { accountLabel: string; amount: string }) => void;
}) {
  const { colors, strings, styles } = useTheme();
  const balanceStrings = strings.budget.balance;
  const [accountLabel, setAccountLabel] = useState(accounts[0]?.label ?? "");
  const [amount, setAmount] = useState("");
  const [editingAccountId, setEditingAccountId] = useState<string | undefined>(undefined);
  const [accountDraftLabel, setAccountDraftLabel] = useState("");
  const [accountDraftKind, setAccountDraftKind] = useState<MoneyAccount["kind"]>("bank");
  const [accountDraftHub, setAccountDraftHub] = useState<"hub" | "pocket">("pocket");
  const [accountDraftTier, setAccountDraftTier] = useState<AccountTier>("tracked");
  const [pendingDeleteAccount, setPendingDeleteAccount] = useState<MoneyAccount | null>(null);
  const currentBalanceTotal = useMemo(() => getLatestBalanceTotal(projectedBalanceSnapshots), [projectedBalanceSnapshots]);
  const manualBalanceTotal = useMemo(() => getLatestBalanceTotal(balanceSnapshots), [balanceSnapshots]);
  const currentBalances = useMemo(() => getLatestBalanceSnapshots(projectedBalanceSnapshots), [projectedBalanceSnapshots]);
  const latestSnapshots = useMemo(() => getLatestBalanceSnapshots(balanceSnapshots), [balanceSnapshots]);
  const tierSummary = useMemo(
    () => summarizeBalanceByTier({ accounts, snapshots: projectedBalanceSnapshots }),
    [accounts, projectedBalanceSnapshots]
  );
  const balanceByLabel = useMemo(() => {
    const map = new Map<string, number>();
    currentBalances.forEach((snapshot) => map.set(snapshot.accountLabel, snapshot.amount));
    return map;
  }, [currentBalances]);

  useEffect(() => {
    const labels = accounts.map((account) => account.label);
    if (labels.length === 0) {
      setAccountLabel("");
    } else if (!labels.includes(accountLabel)) {
      setAccountLabel(labels[0]);
    }
  }, [accountLabel, accounts]);

  function editAccount(account: MoneyAccount) {
    setEditingAccountId(account.id);
    setAccountDraftLabel(account.label);
    setAccountDraftKind(account.kind);
    setAccountDraftHub(account.isIncomeHub ? "hub" : "pocket");
    setAccountDraftTier(account.tier ?? "tracked");
  }

  function resetAccountDraft() {
    setEditingAccountId(undefined);
    setAccountDraftLabel("");
    setAccountDraftKind("bank");
    setAccountDraftHub("pocket");
    setAccountDraftTier("tracked");
  }

  const renderAccountItem = useCallback(
    ({ item: account }: { item: MoneyAccount }) => {
      const balance = balanceByLabel.get(account.label);
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
        >
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsRowHeader}>
              <View style={styles.budgetTitleBlock}>
                <AccountTitle kind={account.kind} label={account.label} />
                <Text style={styles.settingCopy}>{accountMeta}</Text>
              </View>
              <Text style={styles.analyticsAmount}>
                {balance !== undefined ? formatCompactRupiah(balance) : balanceStrings.noActivity}
              </Text>
            </View>
          </View>
        </ListActionRow>
      );
    },
    [balanceByLabel, balanceStrings, strings, styles]
  );

  const renderBalanceItem = useCallback(
    ({ item: snapshot }: { item: BalanceSnapshot }) => (
      <View style={styles.analyticsRow}>
        <View style={styles.analyticsRowHeader}>
          <AccountTitle label={snapshot.accountLabel} />
          <Text style={styles.analyticsAmount}>{formatRupiah(snapshot.amount)}</Text>
        </View>
        <Text style={styles.settingCopy}>{balanceStrings.estimatedFromSnapshot}</Text>
      </View>
    ),
    [balanceStrings.estimatedFromSnapshot, styles]
  );

  const accountKeyExtractor = useCallback((account: MoneyAccount) => account.id, []);
  const balanceKeyExtractor = useCallback((snapshot: BalanceSnapshot) => snapshot.id, []);
  const { dismiss: dismissAccountsHint, visible: showAccountsHint } = useListActionsHint("balance_accounts", accounts.length > 0);

  return (
    <View style={styles.cardStack}>
      <View style={styles.settingsPanel}>
        <View style={styles.settingRow}>
          <Ionicons name="albums-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{balanceStrings.estimatedCurrentBalance}</Text>
            <Text style={styles.settingCopy}>
              {formatString(balanceStrings.estimatedCurrentBalanceCopy, {
                total: formatCompactRupiah(currentBalanceTotal)
              })}
            </Text>
            {tierSummary.ephemeralAccountCount > 0 && tierSummary.ephemeralTotal > 0 ? (
              <Text style={styles.settingCopy}>
                {formatString(balanceStrings.trackedEphemeralCopy, {
                  tracked: formatCompactRupiah(tierSummary.trackedTotal),
                  ephemeral: formatCompactRupiah(tierSummary.ephemeralTotal)
                })}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {accountDrift.length > 0 && (
        <View style={styles.settingsPanel}>
          <View style={styles.settingRow}>
            <Ionicons name="eye-outline" size={20} color={colors.greenDark} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>{balanceStrings.worthQuickLook}</Text>
              <Text style={styles.settingCopy}>{balanceStrings.driftCopy}</Text>
              <View style={styles.repeatBlock}>
                {accountDrift.map((row) => (
                  <Text key={`${row.label}-${row.latestSnapshotDate ?? "drift"}`} style={styles.settingCopy}>
                    {formatString(balanceStrings.driftRow, {
                      label: row.label,
                      difference: formatSignedCompactRupiah(row.difference)
                    })}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {latestSnapshots.length > 0 && (
        <View style={styles.settingsPanel}>
          <View style={styles.settingRow}>
            <Ionicons name="camera-outline" size={20} color={colors.greenDark} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>{balanceStrings.manualSnapshotBase}</Text>
              <Text style={styles.settingCopy}>
                {formatString(balanceStrings.manualSnapshotCopy, {
                  total: formatCompactRupiah(manualBalanceTotal)
                })}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.capturePanel}>
        <Text style={styles.microLabel}>{balanceStrings.balanceSnapshot}</Text>
        <AccountPicker
          accounts={accounts}
          label={strings.common.account}
          selected={accountLabel}
          onSelect={setAccountLabel}
        />
        <TextInput
          accessibilityLabel={balanceStrings.currentBalancePlaceholder}
          keyboardType="number-pad"
          onChangeText={(value) => setAmount(formatAmountInput(value))}
          placeholder={balanceStrings.currentBalancePlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={amount}
        />
        <Pressable
          accessibilityLabel={balanceStrings.saveSnapshotA11y}
          accessibilityRole="button"
          onPress={() => {
            onSaveBalance({ accountLabel, amount });
            setAmount("");
          }}
          style={styles.primaryButton}
        >
          <Ionicons name="camera-outline" size={18} color={colors.surface} />
          <Text style={styles.primaryButtonText}>{balanceStrings.saveSnapshot}</Text>
        </Pressable>
      </View>

      <View style={styles.capturePanel}>
        <Text style={styles.microLabel}>
          {editingAccountId ? balanceStrings.editAccount : balanceStrings.addAccount}
        </Text>
        <TextInput
          accessibilityLabel={balanceStrings.accountPlaceholder}
          onChangeText={setAccountDraftLabel}
          placeholder={balanceStrings.accountPlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={accountDraftLabel}
        />
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
        <View style={styles.editActions}>
          {editingAccountId && (
            <Pressable onPress={resetAccountDraft} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{strings.common.cancel}</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              onSaveAccount({
                id: editingAccountId,
                isIncomeHub: accountDraftHub === "hub",
                kind: accountDraftKind,
                label: accountDraftLabel,
                tier: accountDraftTier
              });
              resetAccountDraft();
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
      <SectionHeader title={balanceStrings.yourAccounts} />
      <View style={styles.listPanel}>
        <FlatList
          data={accounts}
          keyExtractor={accountKeyExtractor}
          renderItem={renderAccountItem}
          scrollEnabled={false}
        />
      </View>

      {currentBalances.length === 0 ? (
        <EmptyState text={balanceStrings.emptyAccounts} />
      ) : (
        <>
          <SectionHeader title={balanceStrings.currentAccountBalances} />
          <View style={styles.listPanel}>
            <FlatList
              data={currentBalances}
              keyExtractor={balanceKeyExtractor}
              renderItem={renderBalanceItem}
              scrollEnabled={false}
            />
          </View>
        </>
      )}
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
            setPendingDeleteAccount(null);
          }
        }}
        title={balanceStrings.deleteAccountTitle}
        visible={Boolean(pendingDeleteAccount)}
      />
    </View>
  );
}