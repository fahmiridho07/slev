import React, { memo, useMemo } from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { ScreenHero, ScreenTabBar } from "../components";
import { AccountAnalysisPanel } from "../features/analysis/AccountAnalysisPanel";
import { BreakdownPanel } from "../features/analysis/BreakdownPanel";
import { PatternOverview } from "../features/analysis/PatternOverview";
import { TrendsPanel } from "../features/analysis/TrendsPanel";
import { PatternTabKey } from "../features/app.types";
import { formatCompactRupiah } from "../lib/spendingMemoryPatterns";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../state/useFinance";
import { useTheme } from "../hooks/useTheme";
import { formatString } from "../i18n";

type PatternsScreenProps = {
  activePatternTab: PatternTabKey;
  onPatternTabChange: (tab: PatternTabKey) => void;
  scrollContentStyle: StyleProp<ViewStyle>;
};

function PatternsScreenComponent({
  activePatternTab,
  onPatternTabChange,
  scrollContentStyle
}: PatternsScreenProps) {
  const { strings, styles } = useTheme();
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
  const hero = useMemo(() => {
    if (activePatternTab === "breakdown") {
      return {
        hint: formatString(strings.patterns.hero.breakdownHint, {
          amount: formatCompactRupiah(monthlySummary.income)
        }),
        kicker: strings.patterns.hero.breakdownKicker,
        value: formatCompactRupiah(monthlySummary.expense),
        valueTone: "danger" as const,
        variant: "info" as const
      };
    }
    if (activePatternTab === "accounts") {
      return {
        hint:
          netWorthTrend.length >= 2
            ? strings.patterns.hero.accountsHintWithTrend
            : strings.patterns.hero.accountsHintNoTrend,
        kicker: strings.patterns.hero.accountsKicker,
        value: formatCompactRupiah(latestBalanceTotal),
        valueTone: "balance" as const,
        variant: "info" as const
      };
    }
    return {
      hint:
        patterns.length > 0
          ? strings.patterns.hero.recapHintWithPatterns
          : strings.patterns.hero.recapHintEmpty,
      kicker: strings.patterns.hero.recapKicker,
      value:
        patterns.length > 0
          ? formatString(strings.patterns.hero.recapValue, { count: patterns.length })
          : undefined,
      valueTone: "default" as const,
      variant: "surface" as const
    };
  }, [
    activePatternTab,
    latestBalanceTotal,
    monthlySummary.expense,
    monthlySummary.income,
    netWorthTrend.length,
    patterns.length,
    strings.patterns.hero
  ]);

  return (
    <ScrollView contentContainerStyle={scrollContentStyle} keyboardShouldPersistTaps="handled">
      <ScreenHero hint={hero.hint} kicker={hero.kicker} value={hero.value} valueTone={hero.valueTone} variant={hero.variant} />

      <ScreenTabBar
        options={[
          { icon: "sparkles-outline", label: strings.patterns.tabs.recap, value: "overview" },
          { icon: "pie-chart-outline", label: strings.patterns.tabs.spending, value: "breakdown" },
          { icon: "card-outline", label: strings.patterns.tabs.accounts, value: "accounts" }
        ]}
        selected={activePatternTab}
        onSelect={onPatternTabChange}
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
        <View style={styles.cardStack}>
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