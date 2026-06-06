import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { AccountPicker, AccountTitle, DeleteConfirmDialog, EmptyState, SectionHeader, SegmentedControl } from "../../components";
import { formatAmountInput } from "../../lib/formatMoney";
import { getLatestBalanceSnapshots, getLatestBalanceTotal } from "../../lib/financeEngine";
import { formatCompactRupiah, formatRupiah } from "../../lib/spendingMemoryPatterns";
import { BalanceSnapshot, MoneyAccount } from "../spendingMemory.types";
import { colors } from "../../theme/colors";
import { styles } from "../../theme/styles/app";

export function BalancePanel({
  accounts,
  balanceSnapshots,
  projectedBalanceSnapshots,
  onDeleteAccount,
  onSaveAccount,
  onSaveBalance
}: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  projectedBalanceSnapshots: BalanceSnapshot[];
  onDeleteAccount: (id: string) => void;
  onSaveAccount: (input: {
    id?: string;
    isIncomeHub: boolean;
    kind: MoneyAccount["kind"];
    label: string;
  }) => void;
  onSaveBalance: (input: { accountLabel: string; amount: string }) => void;
}) {
  const [accountLabel, setAccountLabel] = useState(accounts[0]?.label ?? "");
  const [amount, setAmount] = useState("");
  const [editingAccountId, setEditingAccountId] = useState<string | undefined>(undefined);
  const [accountDraftLabel, setAccountDraftLabel] = useState("");
  const [accountDraftKind, setAccountDraftKind] = useState<MoneyAccount["kind"]>("bank");
  const [accountDraftHub, setAccountDraftHub] = useState<"hub" | "pocket">("pocket");
  const [pendingDeleteAccount, setPendingDeleteAccount] = useState<MoneyAccount | null>(null);
  const currentBalanceTotal = useMemo(() => getLatestBalanceTotal(projectedBalanceSnapshots), [projectedBalanceSnapshots]);
  const manualBalanceTotal = useMemo(() => getLatestBalanceTotal(balanceSnapshots), [balanceSnapshots]);
  const currentBalances = useMemo(() => getLatestBalanceSnapshots(projectedBalanceSnapshots), [projectedBalanceSnapshots]);
  const latestSnapshots = useMemo(() => getLatestBalanceSnapshots(balanceSnapshots), [balanceSnapshots]);

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
  }

  function resetAccountDraft() {
    setEditingAccountId(undefined);
    setAccountDraftLabel("");
    setAccountDraftKind("bank");
    setAccountDraftHub("pocket");
  }

  const renderAccountItem = useCallback(
    ({ item: account }: { item: MoneyAccount }) => (
      <View style={styles.analyticsRow}>
        <View style={styles.analyticsRowHeader}>
          <AccountTitle kind={account.kind} label={account.label} />
          <Text style={styles.analyticsAmount}>{account.isIncomeHub ? "Income hub" : account.kind}</Text>
        </View>
        <View style={styles.editActions}>
          <Pressable onPress={() => editAccount(account)} style={styles.textButton}>
            <Ionicons name="create-outline" size={16} color={colors.greenDark} />
            <Text style={styles.textButtonLabel}>Edit</Text>
          </Pressable>
          <Pressable onPress={() => setPendingDeleteAccount(account)} style={styles.textButton}>
            <Ionicons name="trash-outline" size={16} color={colors.coral} />
            <Text style={[styles.textButtonLabel, styles.deleteText]}>Delete</Text>
          </Pressable>
        </View>
      </View>
    ),
    []
  );

  const renderBalanceItem = useCallback(
    ({ item: snapshot }: { item: BalanceSnapshot }) => (
      <View style={styles.analyticsRow}>
        <View style={styles.analyticsRowHeader}>
          <AccountTitle label={snapshot.accountLabel} />
          <Text style={styles.analyticsAmount}>{formatRupiah(snapshot.amount)}</Text>
        </View>
        <Text style={styles.settingCopy}>Estimated from the latest snapshot and logged movements.</Text>
      </View>
    ),
    []
  );

  const accountKeyExtractor = useCallback((account: MoneyAccount) => account.id, []);
  const balanceKeyExtractor = useCallback((snapshot: BalanceSnapshot) => snapshot.id, []);

  return (
    <View style={styles.analyticsBlock}>
      <View style={styles.settingsPanel}>
        <View style={styles.settingRow}>
          <Ionicons name="albums-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Estimated current balance</Text>
            <Text style={styles.settingCopy}>
              {formatCompactRupiah(currentBalanceTotal)} from snapshots plus logged income, spending, and transfers.
            </Text>
          </View>
        </View>
        {latestSnapshots.length > 0 && (
          <View style={styles.settingRow}>
            <Ionicons name="camera-outline" size={20} color={colors.greenDark} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Manual snapshot base</Text>
              <Text style={styles.settingCopy}>{formatCompactRupiah(manualBalanceTotal)} from the latest saved snapshots.</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.capturePanel}>
        <Text style={styles.microLabel}>Balance snapshot</Text>
        <AccountPicker
          accounts={accounts}
          label="Account"
          selected={accountLabel}
          onSelect={setAccountLabel}
        />
        <TextInput keyboardType="number-pad" onChangeText={(value) => setAmount(formatAmountInput(value))} placeholder="Current balance" placeholderTextColor={colors.muted} style={styles.input} value={amount} />
        <Pressable
          onPress={() => {
            onSaveBalance({ accountLabel, amount });
            setAmount("");
          }}
          style={styles.primaryButton}
        >
          <Ionicons name="camera-outline" size={18} color={colors.surface} />
          <Text style={styles.primaryButtonText}>Save snapshot</Text>
        </Pressable>
      </View>

      <View style={styles.capturePanel}>
        <Text style={styles.microLabel}>{editingAccountId ? "Edit account" : "Add account or wallet"}</Text>
        <TextInput onChangeText={setAccountDraftLabel} placeholder="BRI, Jago, GoPay, Cash..." placeholderTextColor={colors.muted} style={styles.input} value={accountDraftLabel} />
        <SegmentedControl
          compact
          options={[
            { label: "Bank", value: "bank" },
            { label: "Wallet", value: "wallet" },
            { label: "Cash", value: "cash" },
            { label: "Other", value: "other" }
          ]}
          selected={accountDraftKind}
          onSelect={setAccountDraftKind}
        />
        <SegmentedControl
          compact
          options={[
            { label: "Income hub", value: "hub" },
            { label: "Pocket", value: "pocket" }
          ]}
          selected={accountDraftHub}
          onSelect={setAccountDraftHub}
        />
        <View style={styles.editActions}>
          {editingAccountId && (
            <Pressable onPress={resetAccountDraft} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              onSaveAccount({
                id: editingAccountId,
                isIncomeHub: accountDraftHub === "hub",
                kind: accountDraftKind,
                label: accountDraftLabel
              });
              resetAccountDraft();
            }}
            style={styles.smallPrimaryButton}
          >
            <Text style={styles.primaryButtonText}>Save account</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.listPanel}>
        <FlatList
          data={accounts}
          keyExtractor={accountKeyExtractor}
          renderItem={renderAccountItem}
          scrollEnabled={false}
        />
      </View>

      {currentBalances.length === 0 ? (
        <EmptyState text="Income, expenses, transfers, or snapshots will build account balances here." />
      ) : (
        <View style={styles.listPanel}>
          <SectionHeader title="Current account balances" />
          <FlatList
            data={currentBalances}
            keyExtractor={balanceKeyExtractor}
            renderItem={renderBalanceItem}
            scrollEnabled={false}
          />
        </View>
      )}
      <DeleteConfirmDialog
        body={
          pendingDeleteAccount
            ? `${pendingDeleteAccount.label} will be removed from account pickers. Existing memories stay saved.`
            : ""
        }
        onCancel={() => setPendingDeleteAccount(null)}
        onConfirm={() => {
          if (pendingDeleteAccount) {
            onDeleteAccount(pendingDeleteAccount.id);
            setPendingDeleteAccount(null);
          }
        }}
        title="Delete account?"
        visible={Boolean(pendingDeleteAccount)}
      />
    </View>
  );
}
