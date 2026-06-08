import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { AccountTitle, DeleteConfirmDialog, EmptyState, ListActionRow, ObservationPanel, ProgressBar, SectionHeader, TransferTitle } from "../../components";
import { formatString } from "../../i18n";
import { AccountActivityRow, buildAccountActivity, dateKey, formatDate, formatReconciliationDifference, getReconciliationCopy, getReconciliationDetail, getPercentWidthStyle } from "../../lib/analysis";
import { formatSignedCompactRupiah } from "../../lib/formatMoney";
import { buildAccountReconciliation, getLatestBalanceSnapshots, NetWorthPoint } from "../../lib/financeEngine";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { BalanceSnapshot, MoneyAccount, MoneyTransfer, SpendingMoment, type PatternGroup } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
import { getReconciliationAmountStyle } from "../../theme/styles/fillStyles";
import { NetWorthTrendSection } from "./NetWorthTrendSection";

const RECENT_TRANSFER_LIMIT = 3;

export function AccountAnalysisPanel({
  accounts,
  balanceSnapshots,
  moments,
  netWorthTrend,
  onDeleteTransfer,
  onOpenBalance,
  projectedBalanceSnapshots,
  transfers
}: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  moments: SpendingMoment[];
  netWorthTrend: NetWorthPoint[];
  onDeleteTransfer: (id: string) => void;
  onOpenBalance: () => void;
  projectedBalanceSnapshots: BalanceSnapshot[];
  transfers: MoneyTransfer[];
}) {
  const { colors, strings, styles } = useTheme();
  const accountsStrings = strings.patterns.accounts;
  const currentBalances = useMemo(() => getLatestBalanceSnapshots(projectedBalanceSnapshots), [projectedBalanceSnapshots]);
  const accountActivity = useMemo(() => buildAccountActivity(moments), [moments]);
  const reconciliationRows = useMemo(
    () => buildAccountReconciliation({ accounts, balanceSnapshots, moments, transfers }),
    [accounts, balanceSnapshots, moments, transfers]
  );
  const recentTransfers = useMemo(() => transfers.slice(0, RECENT_TRANSFER_LIMIT), [transfers]);
  const [pendingDeleteTransfer, setPendingDeleteTransfer] = useState<MoneyTransfer | null>(null);
  const [showAccountMovement, setShowAccountMovement] = useState(accountActivity.length >= 2);
  const reconciliationCopy = getReconciliationCopy(reconciliationRows);
  const incomeHub = accounts.find((account) => account.isIncomeHub);
  const hubBalance = incomeHub
    ? currentBalances.find((snapshot) => snapshot.accountLabel === incomeHub.label)?.amount ?? 0
    : 0;
  const pocketBalance = currentBalances
    .filter((snapshot) => snapshot.accountLabel !== incomeHub?.label)
    .reduce((sum, snapshot) => sum + snapshot.amount, 0);
  const topSpendingAccount = accountActivity.find((row) => row.expense > 0);
  const hasSnapshots = balanceSnapshots.length > 0;

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
              expected: formatRupiah(row.expectedAmount),
              actual: formatRupiah(row.latestAmount)
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
          <Text style={styles.analyticsAmount}>{formatRupiah(row.expense)}</Text>
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
            income: formatRupiah(row.income),
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
            <Text style={styles.analyticsAmount}>{formatRupiah(transfer.amount)}</Text>
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
      <Text style={styles.settingCopy}>{accountsStrings.intro}</Text>

      <Pressable
        accessibilityLabel={accountsStrings.openBalanceAction}
        accessibilityRole="button"
        onPress={onOpenBalance}
        style={styles.accordionCard}
      >
        <Text style={styles.settingTitle}>{accountsStrings.openBalanceAction}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>

      <View style={styles.settingsPanel}>
        <View style={styles.settingRow}>
          <Ionicons name="swap-horizontal-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{accountsStrings.hubAndPockets}</Text>
            <Text style={styles.settingCopy}>
              {formatString(accountsStrings.hubPocketsCopy, {
                hub: formatRupiah(hubBalance),
                pockets: formatRupiah(pocketBalance)
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
                    amount: formatRupiah(topSpendingAccount.expense)
                  })
                : accountsStrings.spendingByAccountEmpty}
            </Text>
          </View>
        </View>
      </View>

      <NetWorthTrendSection netWorthTrend={netWorthTrend} onOpenBalance={onOpenBalance} />

      {hasSnapshots && (
        <>
          <ObservationPanel
            pattern={{
              id: "reconciliation-summary",
              group: strings.patterns.groups.standsOut as PatternGroup,
              title: reconciliationCopy.title,
              detail: reconciliationCopy.detail,
              tone: reconciliationCopy.tone
            }}
          />
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

      {!hasSnapshots && <EmptyState text={accountsStrings.reconciliationEmpty} />}

      {accountActivity.length > 0 && (
        <>
          {accountActivity.length >= 2 && (
            <Pressable
              accessibilityLabel={
                showAccountMovement
                  ? accountsStrings.hideAccountMovement
                  : accountsStrings.showAccountMovement
              }
              accessibilityRole="button"
              onPress={() => setShowAccountMovement((prev) => !prev)}
              style={styles.accordionCard}
            >
              <Text style={styles.settingTitle}>{accountsStrings.accountMovement}</Text>
              <Ionicons
                name={showAccountMovement ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.muted}
              />
            </Pressable>
          )}
          {(accountActivity.length < 2 || showAccountMovement) && (
            <>
              {accountActivity.length < 2 && <SectionHeader title={accountsStrings.accountMovement} />}
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
                amount: formatRupiah(pendingDeleteTransfer.amount),
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