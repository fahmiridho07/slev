import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AccountTitle, DeleteConfirmDialog, EmptyState, ObservationPanel, SectionHeader, TransferTitle } from "../../components";
import { buildAccountActivity, dateKey, formatDate, formatReconciliationDifference, getReconciliationCopy, getReconciliationDetail, getPercentWidthStyle } from "../../lib/analysis";
import { formatSignedCompactRupiah } from "../../lib/formatMoney";
import { buildAccountReconciliation, getLatestBalanceSnapshots } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { BalanceSnapshot, MoneyAccount, MoneyTransfer, SpendingMoment } from "../spendingMemory.types";
import { colors } from "../../theme/colors";
import { styles } from "../../theme/styles/app";
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

  return (
    <View style={styles.analyticsBlock}>
      <View style={styles.settingsPanel}>
        <View style={styles.settingRow}>
          <Ionicons name="swap-horizontal-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Hub and pockets</Text>
            <Text style={styles.settingCopy}>
              Hub {formatCompactRupiah(hubBalance)} - daily pockets {formatCompactRupiah(pocketBalance)}.
            </Text>
          </View>
        </View>
        <View style={styles.settingRow}>
          <Ionicons name="card-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Most active spending pocket</Text>
            <Text style={styles.settingCopy}>
              {topSpendingAccount
                ? `${topSpendingAccount.label} has ${formatCompactRupiah(topSpendingAccount.expense)} spending logged this month.`
              : "Spending by account appears after entries include an account."}
            </Text>
          </View>
        </View>
      </View>

      <ObservationPanel
        pattern={{
          id: "reconciliation-summary",
          group: "Stands out this week",
          title: reconciliationCopy.title,
          detail: reconciliationCopy.detail,
          tone: reconciliationCopy.tone
        }}
      />

      {balanceSnapshots.length === 0 ? (
        <EmptyState text="Reconciliation starts after the first manual snapshot. Current balance can still be estimated from income and spending." />
      ) : (
        <View style={styles.listPanel}>
          <SectionHeader title="Balance reconciliation" />
          {reconciliationRows.map((row) => (
            <View key={row.label} style={styles.analyticsRow}>
              <View style={styles.analyticsRowHeader}>
                <AccountTitle label={row.label} />
                <Text style={[styles.analyticsAmount, getReconciliationAmountStyle(row)]}>
                  {formatReconciliationDifference(row)}
                </Text>
              </View>
              <Text style={styles.settingCopy}>{getReconciliationDetail(row)}</Text>
              {row.expectedAmount !== null && row.latestAmount !== null && (
                <Text style={styles.settingCopy}>
                  Expected {formatCompactRupiah(row.expectedAmount)} - actual {formatCompactRupiah(row.latestAmount)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {accountActivity.length > 0 && (
        <View style={styles.listPanel}>
          <SectionHeader title="Account movement this month" />
          {accountActivity.map((row) => (
            <View key={row.label} style={styles.analyticsRow}>
              <View style={styles.analyticsRowHeader}>
                <AccountTitle label={row.label} />
                <Text style={styles.analyticsAmount}>{formatCompactRupiah(row.expense)}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.expenseFill, getPercentWidthStyle(row.share)]} />
              </View>
              <Text style={styles.settingCopy}>
                Income {formatCompactRupiah(row.income)} - net {formatSignedCompactRupiah(row.net)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {recentTransfers.length > 0 && (
        <View style={styles.listPanel}>
          <SectionHeader title="Recent transfers" />
          {recentTransfers.map((transfer) => (
            <View key={transfer.id} style={styles.analyticsRow}>
              <View style={styles.analyticsRowHeader}>
                <TransferTitle fromLabel={transfer.fromAccount} toLabel={transfer.toAccount} />
                <Text style={styles.analyticsAmount}>{formatCompactRupiah(transfer.amount)}</Text>
              </View>
              <Text style={styles.settingCopy}>
                {formatDate(dateKey(new Date(transfer.occurredAt)))}{transfer.note ? ` - ${transfer.note}` : ""}
              </Text>
              <View style={styles.editActions}>
                <Pressable onPress={() => setPendingDeleteTransfer(transfer)} style={styles.textButton}>
                  <Ionicons name="trash-outline" size={16} color={colors.coral} />
                  <Text style={[styles.textButtonLabel, styles.deleteText]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
      <DeleteConfirmDialog
        body={
          pendingDeleteTransfer
            ? `${formatCompactRupiah(pendingDeleteTransfer.amount)} from ${pendingDeleteTransfer.fromAccount} to ${pendingDeleteTransfer.toAccount} will be removed.`
            : ""
        }
        onCancel={() => setPendingDeleteTransfer(null)}
        onConfirm={() => {
          if (pendingDeleteTransfer) {
            onDeleteTransfer(pendingDeleteTransfer.id);
            setPendingDeleteTransfer(null);
          }
        }}
        title="Delete transfer?"
        visible={Boolean(pendingDeleteTransfer)}
      />
    </View>
  );
}
