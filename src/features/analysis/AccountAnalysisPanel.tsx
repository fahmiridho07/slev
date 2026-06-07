import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { AccountTitle, DeleteConfirmDialog, EmptyState, ListActionRow, ObservationPanel, ProgressBar, SectionHeader, TransferTitle } from "../../components";
import { formatString } from "../../i18n";
import { AccountActivityRow, buildAccountActivity, dateKey, formatDate, formatReconciliationDifference, getReconciliationCopy, getReconciliationDetail, getPercentWidthStyle } from "../../lib/analysis";
import { formatSignedCompactRupiah } from "../../lib/formatMoney";
import { buildAccountReconciliation, getLatestBalanceSnapshots } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { BalanceSnapshot, MoneyAccount, MoneyTransfer, SpendingMoment, type PatternGroup } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
import { getReconciliationAmountStyle } from "../../theme/styles/fillStyles";

export function AccountAnalysisPanel({
  accounts,
  balanceSnapshots,
  moments,
  projectedBalanceSnapshots,
  transfers,
  onDeleteTransfer
}: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  moments: SpendingMoment[];
  projectedBalanceSnapshots: BalanceSnapshot[];
  transfers: MoneyTransfer[];
  onDeleteTransfer: (id: string) => void;
}) {
  const { colors, strings, styles } = useTheme();
  const accountsStrings = strings.patterns.accounts;
  const currentBalances = useMemo(() => getLatestBalanceSnapshots(projectedBalanceSnapshots), [projectedBalanceSnapshots]);
  const accountActivity = useMemo(() => buildAccountActivity(moments), [moments]);
  const reconciliationRows = useMemo(
    () => buildAccountReconciliation({ accounts, balanceSnapshots, moments, transfers }),
    [accounts, balanceSnapshots, moments, transfers]
  );
  const recentTransfers = useMemo(() => transfers.slice(0, 6), [transfers]);
  const [pendingDeleteTransfer, setPendingDeleteTransfer] = useState<MoneyTransfer | null>(null);
  const reconciliationCopy = getReconciliationCopy(reconciliationRows);
  const incomeHub = accounts.find((account) => account.isIncomeHub);
  const hubBalance = incomeHub
    ? currentBalances.find((snapshot) => snapshot.accountLabel === incomeHub.label)?.amount ?? 0
    : 0;
  const pocketBalance = currentBalances
    .filter((snapshot) => snapshot.accountLabel !== incomeHub?.label)
    .reduce((sum, snapshot) => sum + snapshot.amount, 0);
  const topSpendingAccount = accountActivity.find((row) => row.expense > 0);

  const renderReconciliationItem = useCallback(
    ({ item: row }: { item: (typeof reconciliationRows)[number] }) => (
      <View style={styles.analyticsRow}>
        <View style={styles.analyticsRowHeader}>
          <AccountTitle label={row.label} />
          <Text style={[styles.analyticsAmount, getReconciliationAmountStyle(row, colors)]}>
            {formatReconciliationDifference(row)}
          </Text>
        </View>
        <Text style={styles.settingCopy}>{getReconciliationDetail(row)}</Text>
        {row.expectedAmount !== null && row.latestAmount !== null && (
          <Text style={styles.settingCopy}>
            {formatString(accountsStrings.expectedActual, {
              expected: formatCompactRupiah(row.expectedAmount),
              actual: formatCompactRupiah(row.latestAmount)
            })}
          </Text>
        )}
      </View>
    ),
    [accountsStrings.expectedActual, colors, styles]
  );

  const renderActivityItem = useCallback(
    ({ item: row }: { item: AccountActivityRow }) => (
      <View style={styles.analyticsRow}>
        <View style={styles.analyticsRowHeader}>
          <AccountTitle label={row.label} />
          <Text style={styles.analyticsAmount}>{formatCompactRupiah(row.expense)}</Text>
        </View>
        <ProgressBar
          accessibilityLabel={formatString(strings.common.progressA11y, {
            label: row.label,
            percent: Math.round(row.share * 100)
          })}
          fillStyle={[styles.expenseFill, getPercentWidthStyle(row.share)]}
          value={row.share}
        />
        <Text style={styles.settingCopy}>
          {formatString(accountsStrings.incomeNetCopy, {
            income: formatCompactRupiah(row.income),
            net: formatSignedCompactRupiah(row.net)
          })}
        </Text>
      </View>
    ),
    [accountsStrings.incomeNetCopy, strings.common.progressA11y, styles]
  );

  const renderTransferItem = useCallback(
    ({ item: transfer }: { item: MoneyTransfer }) => (
      <ListActionRow
        accessibilityLabel={formatString(accountsStrings.deleteTransferA11y, {
          from: transfer.fromAccount,
          to: transfer.toAccount
        })}
        onDelete={() => setPendingDeleteTransfer(transfer)}
      >
        <View style={styles.analyticsRow}>
          <View style={styles.analyticsRowHeader}>
            <TransferTitle fromLabel={transfer.fromAccount} toLabel={transfer.toAccount} />
            <Text style={styles.analyticsAmount}>{formatCompactRupiah(transfer.amount)}</Text>
          </View>
          <Text style={styles.settingCopy}>
            {formatDate(dateKey(new Date(transfer.occurredAt)))}{transfer.note ? ` - ${transfer.note}` : ""}
          </Text>
        </View>
      </ListActionRow>
    ),
    [accountsStrings.deleteTransferA11y, styles]
  );

  const reconciliationKeyExtractor = useCallback((row: (typeof reconciliationRows)[number]) => row.label, []);
  const activityKeyExtractor = useCallback((row: AccountActivityRow) => row.label, []);
  const transferKeyExtractor = useCallback((transfer: MoneyTransfer) => transfer.id, []);

  return (
    <View style={styles.cardStack}>
      <View style={styles.settingsPanel}>
        <View style={styles.settingRow}>
          <Ionicons name="swap-horizontal-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{accountsStrings.hubAndPockets}</Text>
            <Text style={styles.settingCopy}>
              {formatString(accountsStrings.hubPocketsCopy, {
                hub: formatCompactRupiah(hubBalance),
                pockets: formatCompactRupiah(pocketBalance)
              })}
            </Text>
          </View>
        </View>
        <View style={styles.settingRow}>
          <Ionicons name="card-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{accountsStrings.mostActivePocket}</Text>
            <Text style={styles.settingCopy}>
              {topSpendingAccount
                ? formatString(accountsStrings.topSpendingCopy, {
                    label: topSpendingAccount.label,
                    amount: formatCompactRupiah(topSpendingAccount.expense)
                  })
                : accountsStrings.spendingByAccountEmpty}
            </Text>
          </View>
        </View>
      </View>

      <ObservationPanel
        pattern={{
          id: "reconciliation-summary",
          group: strings.patterns.groups.standsOut as PatternGroup,
          title: reconciliationCopy.title,
          detail: reconciliationCopy.detail,
          tone: reconciliationCopy.tone
        }}
      />

      {balanceSnapshots.length === 0 ? (
        <EmptyState text={accountsStrings.reconciliationEmpty} />
      ) : (
        <>
          <SectionHeader title={accountsStrings.balanceReconciliation} />
          <View style={styles.listPanel}>
            <FlatList
              data={reconciliationRows}
              keyExtractor={reconciliationKeyExtractor}
              renderItem={renderReconciliationItem}
              scrollEnabled={false}
            />
          </View>
        </>
      )}

      {accountActivity.length > 0 && (
        <>
          <SectionHeader title={accountsStrings.accountMovement} />
          <View style={styles.listPanel}>
            <FlatList
              data={accountActivity}
              keyExtractor={activityKeyExtractor}
              renderItem={renderActivityItem}
              scrollEnabled={false}
            />
          </View>
        </>
      )}

      {recentTransfers.length > 0 && (
        <>
          <SectionHeader title={accountsStrings.recentTransfers} />
          <View style={styles.listPanel}>
            <FlatList
              data={recentTransfers}
              keyExtractor={transferKeyExtractor}
              renderItem={renderTransferItem}
              scrollEnabled={false}
            />
          </View>
        </>
      )}
      <DeleteConfirmDialog
        body={
          pendingDeleteTransfer
            ? formatString(accountsStrings.deleteTransferBody, {
                amount: formatCompactRupiah(pendingDeleteTransfer.amount),
                from: pendingDeleteTransfer.fromAccount,
                to: pendingDeleteTransfer.toAccount
              })
            : ""
        }
        onCancel={() => setPendingDeleteTransfer(null)}
        onConfirm={() => {
          if (pendingDeleteTransfer) {
            onDeleteTransfer(pendingDeleteTransfer.id);
            setPendingDeleteTransfer(null);
          }
        }}
        title={accountsStrings.deleteTransferTitle}
        visible={Boolean(pendingDeleteTransfer)}
      />
    </View>
  );
}