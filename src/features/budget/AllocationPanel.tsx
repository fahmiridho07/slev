import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { EmptyState, ObservationPanel, SectionHeader } from "../../components";
import { formatString } from "../../i18n";
import { MonthlySummary } from "../app.types";
import { getAllocationActionCopy, getAllocationRowCopy } from "../../lib/analysis";
import { formatSignedCompactRupiah } from "../../lib/formatMoney";
import { buildAllocationPlan, getLatestBalanceSnapshots } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { BalanceSnapshot, MoneyAccount, MoneyTransfer, MonthlyPlan, type PatternGroup } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
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
  const { colors, strings, styles } = useTheme();
  const allocationStrings = strings.budget.allocation;
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
          group: strings.patterns.groups.repeatedLately as PatternGroup,
          title: actionCopy.title,
          detail: actionCopy.detail,
          tone: actionCopy.tone
        }}
      />

      {!monthlyPlan ? (
        <EmptyState text={allocationStrings.setPlanEmpty} />
      ) : (
        <>
          <View style={styles.allocationGrid}>
            <View style={styles.allocationMetric}>
              <Text style={styles.microLabel}>{allocationStrings.income}</Text>
              <Text style={styles.allocationValue}>{formatCompactRupiah(allocation.incomeReceived)}</Text>
              <Text style={styles.settingCopy}>
                {formatString(allocationStrings.ofPlanned, { planned: formatCompactRupiah(allocation.expectedIncome) })}
              </Text>
            </View>
            <View style={styles.allocationMetric}>
              <Text style={styles.microLabel}>{allocationStrings.dailyRoom}</Text>
              <Text style={styles.allocationValue}>{formatCompactRupiah(allocation.dailyFlexibleRoom)}</Text>
              <Text style={styles.settingCopy}>{allocationStrings.flexibleUntilMonthEnd}</Text>
            </View>
            <View style={styles.allocationMetric}>
              <Text style={styles.microLabel}>{allocationStrings.pocketCash}</Text>
              <Text style={styles.allocationValue}>{formatCompactRupiah(allocation.pocketBalance)}</Text>
              <Text style={styles.settingCopy}>
                {formatString(allocationStrings.dayCoverage, { count: allocation.pocketCoverageDays })}
              </Text>
            </View>
            <View style={styles.allocationMetric}>
              <Text style={styles.microLabel}>{allocationStrings.netLeft}</Text>
              <Text style={[styles.allocationValue, allocation.savingsGap > 0 && styles.expenseText]}>
                {formatSignedCompactRupiah(allocation.possibleSavings - (monthlyPlan.savingsTarget ?? 0))}
              </Text>
              <Text style={styles.settingCopy}>{allocationStrings.againstTarget}</Text>
            </View>
          </View>

          <View style={styles.listPanel}>
            <SectionHeader title={allocationStrings.monthlyAllocation} />
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
                      <View style={[styles.progressFill, getAllocationFillStyle(row, colors)]} />
                    </View>
                  )}
                  <Text style={styles.settingCopy}>{rowCopy.detail}</Text>
                </View>
              );
            })}
          </View>

          {balanceSnapshots.length === 0 && (
            <EmptyState
              text={allocationStrings.estimatedFromLogs}
              actionLabel={allocationStrings.openBalance}
              onAction={onOpenBalance}
            />
          )}
        </>
      )}
    </View>
  );
}