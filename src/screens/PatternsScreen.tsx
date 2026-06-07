import React, { memo, useMemo } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { ScreenHero, ScreenTabBar, StickyTabScreen } from "../components";
import { AccountAnalysisPanel } from "../features/analysis/AccountAnalysisPanel";
import { BreakdownPanel } from "../features/analysis/BreakdownPanel";
import { PatternOverview } from "../features/analysis/PatternOverview";

import { PatternTabKey } from "../features/app.types";
import { buildPatternsTabHero } from "../lib/tabHero";
import { shallowEqual, useActions, useFinanceDerived, useFinanceSelector } from "../state/useFinance";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { useTheme } from "../hooks/useTheme";
type PatternsScreenProps = {
  activePatternTab: PatternTabKey;
  onOpenBalance: () => void;
  onOpenCapture: () => void;
  onPatternTabChange: (tab: PatternTabKey) => void;
  scrollContentStyle: StyleProp<ViewStyle>;
};

function PatternsScreenComponent({
  activePatternTab,
  onOpenBalance,
  onOpenCapture,
  onPatternTabChange,
  scrollContentStyle
}: PatternsScreenProps) {
  const { strings } = useTheme();
  const { refreshControl } = usePullToRefresh();
  const actions = useActions();
  const { feedbackByPattern, latestBalanceTotal, monthlySummary, netWorthTrend, patterns, projectedBalanceSnapshots } =
    useFinanceDerived(
      (derived) => ({
        feedbackByPattern: derived.feedbackByPattern,
        latestBalanceTotal: derived.latestBalanceTotal,
        monthlySummary: derived.monthlySummary,
        netWorthTrend: derived.netWorthTrend,
        patterns: derived.patterns,
        projectedBalanceSnapshots: derived.projectedBalanceSnapshots
      }),
      shallowEqual
    );
  const { accounts, balanceSnapshots, moments, transfers } = useFinanceSelector(
    (state) => ({
      accounts: state.accounts,
      balanceSnapshots: state.balanceSnapshots,
      moments: state.moments,
      transfers: state.transfers
    }),
    shallowEqual
  );
  const hero = useMemo(
    () =>
      buildPatternsTabHero({
        activeTab: activePatternTab,
        latestBalanceTotal,
        monthlySummary,
        netWorthTrendLength: netWorthTrend.length,
        patternCount: patterns.length,
        strings
      }),
    [activePatternTab, latestBalanceTotal, monthlySummary, netWorthTrend.length, patterns.length, strings]
  );

  return (
    <StickyTabScreen
      refreshControl={refreshControl}
      scrollContentStyle={scrollContentStyle}
      hero={
        <ScreenHero
          hint={hero.hint}
          kicker={hero.kicker}
          value={hero.value}
          valueTone={hero.valueTone}
          variant={hero.variant}
        />
      }
      tabBar={
        <ScreenTabBar
          options={[
            { icon: "sparkles-outline", label: strings.patterns.tabs.recap, value: "overview" },
            { icon: "pie-chart-outline", label: strings.patterns.tabs.spending, value: "breakdown" },
            { icon: "card-outline", label: strings.patterns.tabs.accounts, value: "accounts" }
          ]}
          selected={activePatternTab}
          onSelect={onPatternTabChange}
        />
      }
    >
      {activePatternTab === "overview" && (
        <PatternOverview
          feedbackByPattern={feedbackByPattern}
          moments={moments}
          onOpenCapture={onOpenCapture}
          patterns={patterns}
          onAnswer={(patternId, response) => void actions.answerPattern(patternId, response)}
        />
      )}
      {activePatternTab === "breakdown" && <BreakdownPanel moments={moments} />}
      {activePatternTab === "accounts" && (
        <AccountAnalysisPanel
          accounts={accounts}
          balanceSnapshots={balanceSnapshots}
          moments={moments}
          netWorthTrend={netWorthTrend}
          onDeleteTransfer={(id) => void actions.removeTransfer(id)}
          onOpenBalance={onOpenBalance}
          projectedBalanceSnapshots={projectedBalanceSnapshots}
          transfers={transfers}
        />
      )}
    </StickyTabScreen>
  );
}

export const PatternsScreen = memo(PatternsScreenComponent);