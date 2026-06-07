import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { EmptyState, ObservationPanel, SectionHeader } from "../../components";
import { MonthlySummary } from "../app.types";
import { getAllocationActionCopy, getAllocationRowCopy } from "../../lib/analysis";
import { formatSignedCompactRupiah } from "../../lib/formatMoney";
import { buildAllocationPlan, getLatestBalanceSnapshots } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { BalanceSnapshot, MoneyAccount, MoneyTransfer, MonthlyPlan } from "../spendingMemory.types";
import { styles } from "../../theme/styles/app";
import { getAllocationFillStyle } from "../../theme/styles/fillStyles";

export function AllocationPanel({
  accounts,
  balanceSnapshots,
  monthlyPlan,
  monthlySummary,
  projectedBalanceSnapshots,
  transfers,
  onOpenBalance,
}: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  monthlyPlan: MonthlyPlan | null;
  monthlySummary: MonthlySummary;
  projectedBalanceSnapshots: BalanceSnapshot[];
  transfers: MoneyTransfer[];
  onOpenBalance: () => void;
}) {
  const currentBalances = useMemo(() => getLatestBalanceSnapshots(projectedBalanceSnapshots), [projectedBalanceSnapshots]);
  const allocation = useMemo(
    () =>
      buildAllocationPlan({
        accounts,
        hasBalanceEvidence: balanceSnapshots.length > 0 || monthlySummary.income > 0 || monthlySummary.expense > 0 || transfers.length > 0,
        latestSnapshots: currentBalances,
        monthlyPlan,
        monthlySummary
      }),
    [accounts, currentBalances, monthlyPlan, monthlySummary]
  );
  const actionCopy = getAllocationActionCopy(allocation);

  return (
    <View style={styles.analyticsBlock}>
      <ObservationPanel
        pattern={{
          id: "allocation-next-action",
          group: "Repeated lately",
          title: actionCopy.title,
          detail: actionCopy.detail,
          tone: actionCopy.tone
        }}
      />

      {!monthlyPlan ? (
        <EmptyState
          text="Set a monthly plan to see your allocation."
        />
      ) : (
        <>
          <View style={styles.allocationGrid}>
            <View style={styles.allocationMetric}>
              <Text style={styles.microLabel}>Income</Text>
              <Text style={styles.allocationValue}>{formatCompactRupiah(allocation.incomeReceived)}</Text>
              <Text style={styles.settingCopy}>of {formatCompactRupiah(allocation.expectedIncome)}</Text>
            </View>
            <View style={styles.allocationMetric}>
              <Text style={styles.microLabel}>Daily room</Text>
              <Text style={styles.allocationValue}>{formatCompactRupiah(allocation.dailyFlexibleRoom)}</Text>
              <Text style={styles.settingCopy}>flexible until month end</Text>
            </View>
            <View style={styles.allocationMetric}>
              <Text style={styles.microLabel}>Pocket cash</Text>
              <Text style={styles.allocationValue}>{formatCompactRupiah(allocation.pocketBalance)}</Text>
              <Text style={styles.settingCopy}>{allocation.pocketCoverageDays} day coverage</Text>
            </View>
            <View style={styles.allocationMetric}>
              <Text style={styles.microLabel}>Net left</Text>
              <Text style={[styles.allocationValue, allocation.savingsGap > 0 && styles.expenseText]}>
                {formatSignedCompactRupiah(allocation.possibleSavings - (monthlyPlan.savingsTarget ?? 0))}
              </Text>
              <Text style={styles.settingCopy}>against target</Text>
            </View>
          </View>

          <View style={styles.listPanel}>
            <SectionHeader title="Monthly allocation" />
            {allocation.rows.map((row) => {
              const rowCopy = getAllocationRowCopy(row);
              return (
                <View key={row.key} style={styles.analyticsRow}>
                  <View style={styles.analyticsRowHeader}>
                    <Text style={styles.analyticsTitle}>{rowCopy.title}</Text>
                    <Text style={styles.analyticsAmount}>
                      {formatCompactRupiah(row.actual)} / {formatCompactRupiah(row.planned)}
                    </Text>
                  </View>
                  {row.planned > 0 && (
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, getAllocationFillStyle(row)]} />
                    </View>
                  )}
                  <Text style={styles.settingCopy}>{rowCopy.detail}</Text>
                </View>
              );
            })}
          </View>

          {balanceSnapshots.length === 0 && (
            <EmptyState
              text="Estimated from your logs. Add a snapshot to calibrate."
              actionLabel="Open Balance"
              onAction={onOpenBalance}
            />
          )}
        </>
      )}
    </View>
  );
}
