import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SegmentedControl } from "../components";
import { AccountAnalysisPanel } from "../features/analysis/AccountAnalysisPanel";
import { BreakdownPanel } from "../features/analysis/BreakdownPanel";
import { PatternOverview } from "../features/analysis/PatternOverview";
import { TrendsPanel } from "../features/analysis/TrendsPanel";
import { PatternTabKey } from "../features/app.types";
import { BalanceSnapshot, MoneyAccount, MoneyTransfer, PatternFeedbackResponse, SpendingMoment, SpendingPattern } from "../features/spendingMemory.types";
import { styles } from "../theme/styles/app";

export function PatternsScreen({
  accounts,
  balanceSnapshots,
  feedbackByPattern,
  moments,
  patterns,
  projectedBalanceSnapshots,
  transfers,
  onDeleteTransfer,
  onAnswer
}: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  feedbackByPattern: Map<string, PatternFeedbackResponse>;
  moments: SpendingMoment[];
  patterns: SpendingPattern[];
  projectedBalanceSnapshots: BalanceSnapshot[];
  transfers: MoneyTransfer[];
  onDeleteTransfer: (id: string) => void;
  onAnswer: (patternId: string, response: PatternFeedbackResponse) => void;
}) {
  const [activePatternTab, setActivePatternTab] = useState<PatternTabKey>("overview");

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.heroPanel}>
        <Text style={styles.kickerDark}>Analysis</Text>
        <Text style={styles.heroTitle}>Cashflow, pockets, and spending rhythm without bank access.</Text>
      </View>

      <SegmentedControl
        options={[
          { label: "Recap", value: "overview" },
          { label: "Category", value: "breakdown" },
          { label: "Accounts", value: "accounts" },
          { label: "Trend", value: "trends" }
        ]}
        selected={activePatternTab}
        onSelect={setActivePatternTab}
      />

      {activePatternTab === "overview" && (
        <PatternOverview
          feedbackByPattern={feedbackByPattern}
          moments={moments}
          patterns={patterns}
          onAnswer={onAnswer}
        />
      )}
      {activePatternTab === "breakdown" && <BreakdownPanel moments={moments} />}
      {activePatternTab === "accounts" && (
        <AccountAnalysisPanel
          accounts={accounts}
          balanceSnapshots={balanceSnapshots}
          moments={moments}
          projectedBalanceSnapshots={projectedBalanceSnapshots}
          transfers={transfers}
          onDeleteTransfer={onDeleteTransfer}
        />
      )}
      {activePatternTab === "trends" && <TrendsPanel moments={moments} />}
    </ScrollView>
  );
}
