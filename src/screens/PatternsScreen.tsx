import React, { memo, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { ScreenHero, SegmentedControl } from "../components";
import { AccountAnalysisPanel } from "../features/analysis/AccountAnalysisPanel";
import { BreakdownPanel } from "../features/analysis/BreakdownPanel";
import { PatternOverview } from "../features/analysis/PatternOverview";
import { TrendsPanel } from "../features/analysis/TrendsPanel";
import { PatternTabKey } from "../features/app.types";
import { formatCompactRupiah } from "../lib/spendingMemoryPatterns";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../state/useFinance";
import { styles } from "../theme/styles/app";

function PatternsScreenComponent() {
  const actions = useActions();
  const { feedbackByPattern, latestBalanceTotal, monthlySummary, netWorthTrend, patterns, projectedBalanceSnapshots } =
    useDerived();
  const { accounts, balanceSnapshots, moments, transfers } = useFinanceSelector(
    (state) => ({
      accounts: state.accounts,
      balanceSnapshots: state.balanceSnapshots,
      moments: state.moments,
      transfers: state.transfers
    }),
    shallowEqual
  );
  const [activePatternTab, setActivePatternTab] = useState<PatternTabKey>("overview");

  const hero = useMemo(() => {
    if (activePatternTab === "breakdown") {
      return {
        hint: `${formatCompactRupiah(monthlySummary.income)} income logged this month`,
        kicker: "Spending this month",
        value: formatCompactRupiah(monthlySummary.expense),
        valueTone: "danger" as const
      };
    }
    if (activePatternTab === "accounts") {
      return {
        hint: netWorthTrend.length >= 2 ? "Net-worth trend available below" : "Add balance snapshots for trends",
        kicker: "Estimated balance",
        value: formatCompactRupiah(latestBalanceTotal),
        valueTone: "balance" as const
      };
    }
    return {
      hint: patterns.length > 0 ? "Tap a pattern to leave quick feedback" : "Patterns appear after a few saved moments",
      kicker: "Spending recap",
      value: patterns.length > 0 ? `${patterns.length} pattern${patterns.length === 1 ? "" : "s"}` : undefined,
      valueTone: "default" as const
    };
  }, [activePatternTab, latestBalanceTotal, monthlySummary.expense, monthlySummary.income, netWorthTrend.length, patterns.length]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ScreenHero hint={hero.hint} kicker={hero.kicker} value={hero.value} valueTone={hero.valueTone} />

      <SegmentedControl
        options={[
          { label: "Recap", value: "overview" },
          { label: "Spending", value: "breakdown" },
          { label: "Accounts", value: "accounts" }
        ]}
        selected={activePatternTab}
        stretch
        onSelect={setActivePatternTab}
      />

      {activePatternTab === "overview" && (
        <PatternOverview
          feedbackByPattern={feedbackByPattern}
          moments={moments}
          patterns={patterns}
          onAnswer={(patternId, response) => void actions.answerPattern(patternId, response)}
        />
      )}
      {activePatternTab === "breakdown" && (
        <View style={styles.analyticsBlock}>
          <BreakdownPanel moments={moments} />
          <TrendsPanel moments={moments} netWorthTrend={netWorthTrend} />
        </View>
      )}
      {activePatternTab === "accounts" && (
        <AccountAnalysisPanel
          accounts={accounts}
          balanceSnapshots={balanceSnapshots}
          moments={moments}
          projectedBalanceSnapshots={projectedBalanceSnapshots}
          transfers={transfers}
          onDeleteTransfer={(id) => void actions.removeTransfer(id)}
        />
      )}
    </ScrollView>
  );
}

export const PatternsScreen = memo(PatternsScreenComponent);