import React, { memo, useEffect, useMemo, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { ScreenHero, ScreenTabBar, StickyTabScreen } from "../components";
import { AccountAnalysisPanel } from "../features/analysis/AccountAnalysisPanel";
import { BreakdownPanel } from "../features/analysis/BreakdownPanel";
import { PatternTabKey } from "../features/app.types";
import { buildCurrentMonthSummary } from "../lib/financeEngine";
import { getMonthReferenceDate } from "../lib/spendingPeriod";
import { buildPatternsTabHero } from "../lib/tabHero";
import { shallowEqual, useActions, useFinanceDerived, useFinanceSelector } from "../state/useFinance";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { useTheme } from "../hooks/useTheme";

type PatternsScreenProps = {
  activePatternTab: PatternTabKey;
  onOpenBalance: () => void;
  onPatternTabChange: (tab: PatternTabKey) => void;
  scrollContentStyle: StyleProp<ViewStyle>;
};

function PatternsScreenComponent({
  activePatternTab,
  onOpenBalance,
  onPatternTabChange,
  scrollContentStyle
}: PatternsScreenProps) {
  const { strings } = useTheme();
  const actions = useActions();
  const { refreshControl } = usePullToRefresh();
  const [breakdownMonthOffset, setBreakdownMonthOffset] = useState(0);
  const { latestBalanceTotal, monthlySummary, netWorthTrend, projectedBalanceSnapshots } = useFinanceDerived(
    (derived) => ({
      latestBalanceTotal: derived.latestBalanceTotal,
      monthlySummary: derived.monthlySummary,
      netWorthTrend: derived.netWorthTrend,
      projectedBalanceSnapshots: derived.projectedBalanceSnapshots
    }),
    shallowEqual
  );
  const { accounts, balanceSnapshots, budgetLimits, categoryModes, moments, transfers } = useFinanceSelector(
    (state) => ({
      accounts: state.accounts,
      balanceSnapshots: state.balanceSnapshots,
      budgetLimits: state.budgetLimits,
      categoryModes: state.categoryModes,
      moments: state.moments,
      transfers: state.transfers
    }),
    shallowEqual
  );

  useEffect(() => {
    if (activePatternTab !== "breakdown") {
      setBreakdownMonthOffset(0);
    }
  }, [activePatternTab]);

  const breakdownReferenceDate = useMemo(
    () => getMonthReferenceDate(breakdownMonthOffset),
    [breakdownMonthOffset]
  );
  const breakdownSummary = useMemo(
    () => buildCurrentMonthSummary(moments, categoryModes, breakdownReferenceDate),
    [breakdownReferenceDate, categoryModes, moments]
  );
  const hero = useMemo(
    () =>
      buildPatternsTabHero({
        activeTab: activePatternTab,
        breakdownMonthOffset,
        breakdownReferenceDate,
        breakdownSummary,
        latestBalanceTotal,
        monthlySummary,
        netWorthTrendLength: netWorthTrend.length,
        strings
      }),
    [
      activePatternTab,
      breakdownMonthOffset,
      breakdownReferenceDate,
      breakdownSummary,
      latestBalanceTotal,
      monthlySummary,
      netWorthTrend.length,
      strings
    ]
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
            { icon: "pie-chart-outline", label: strings.patterns.tabs.spending, value: "breakdown" },
            { icon: "card-outline", label: strings.patterns.tabs.accounts, value: "accounts" }
          ]}
          selected={activePatternTab}
          onSelect={onPatternTabChange}
        />
      }
    >
      {activePatternTab === "breakdown" && (
        <BreakdownPanel
          budgetLimits={budgetLimits}
          moments={moments}
          monthOffset={breakdownMonthOffset}
          onMonthOffsetChange={setBreakdownMonthOffset}
        />
      )}
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