import React, { memo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SegmentedControl } from "../components";
import { AccountAnalysisPanel } from "../features/analysis/AccountAnalysisPanel";
import { BreakdownPanel } from "../features/analysis/BreakdownPanel";
import { PatternOverview } from "../features/analysis/PatternOverview";
import { TrendsPanel } from "../features/analysis/TrendsPanel";
import { PatternTabKey } from "../features/app.types";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../state/useFinance";
import { styles } from "../theme/styles/app";

function PatternsScreenComponent() {
  const actions = useActions();
  const { feedbackByPattern, netWorthTrend, patterns, projectedBalanceSnapshots } = useDerived();
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.heroPanel}>
        <Text style={styles.kickerDark}>Analysis</Text>
      </View>

      <SegmentedControl
        options={[
          { label: "Recap", value: "overview" },
          { label: "Spending", value: "breakdown" },
          { label: "Accounts", value: "accounts" }
        ]}
        selected={activePatternTab}
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