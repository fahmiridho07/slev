import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { EmptyState, SectionHeader, SegmentedControl } from "../../components";
import { getPercentWidthStyle } from "../../lib/analysis";
import { buildMonthlyBreakdown } from "../../lib/financeEngine";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { EntryType, SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
import { MonthlySpendingChart } from "./MonthlySpendingChart";

export function BreakdownPanel({ moments }: { moments: SpendingMoment[] }) {
  const { styles } = useTheme();
  const [breakdownType, setBreakdownType] = useState<EntryType>("expense");
  const rows = useMemo(() => buildMonthlyBreakdown(moments, breakdownType), [breakdownType, moments]);

  return (
    <View style={styles.analyticsBlock}>
      <SegmentedControl
        compact
        options={[
          { label: "Expense", value: "expense" },
          { label: "Income", value: "income" }
        ]}
        selected={breakdownType}
        onSelect={setBreakdownType}
      />
      {rows.length === 0 ? (
        <EmptyState text={breakdownType === "income" ? "Income breakdown appears after an income entry." : "Expense breakdown appears after a saved expense."} />
      ) : (
        <>
          {breakdownType === "expense" && <MonthlySpendingChart rows={rows} />}
          <SectionHeader title={breakdownType === "income" ? "Income by source" : "Spending by category"} />
          <View style={styles.listPanel}>
            {rows.map((row) => (
              <View key={row.key} style={styles.analyticsRow}>
                <View style={styles.analyticsRowHeader}>
                  <Text style={styles.analyticsTitle}>{row.label}</Text>
                  <Text style={styles.analyticsAmount}>{formatCompactRupiah(row.amount)} - {Math.round(row.share * 100)}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.breakdownFill, getPercentWidthStyle(row.share)]} />
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}
