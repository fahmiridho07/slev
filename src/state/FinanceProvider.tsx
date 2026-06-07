import React, { createContext, useEffect, useMemo, useReducer, useRef } from "react";
import { PatternFeedbackResponse } from "../features/spendingMemory.types";
import { getRepeatSuggestions } from "../lib/analysis";
import { getUpcomingBills, UpcomingBill } from "../lib/recurringBills";
import {
  AccountDriftRow,
  AllocationPlan,
  buildAccountDriftAlerts,
  buildAllocationPlan,
  buildCurrentMonthSummary,
  buildNetWorthTrend,
  getLatestBalanceSnapshots,
  getLatestBalanceTotal,
  getProjectedBalanceSnapshots,
  getRunwayMonths
} from "../lib/financeEngine";
import { generateSpendingPatterns } from "../lib/spendingMemoryPatterns";
import { getCategoryLabels } from "../services/categoryRepository";
import { createFinanceActions, FinanceActions } from "./financeActions";
import { financeReducer, initialFinanceState } from "./financeReducer";
import { createDerivedStore, DerivedStore } from "./derivedStore";
import { createFinanceStore, FinanceStore } from "./financeStore";

export type FinanceDerived = {
  accountDrift: AccountDriftRow[];
  allocationPlan: AllocationPlan;
  categoryLabels: ReturnType<typeof getCategoryLabels>;
  feedbackByPattern: Map<string, PatternFeedbackResponse>;
  hasMonthlyPlan: boolean;
  latestBalanceTotal: number;
  runwayMonths: number | null;
  monthlySummary: ReturnType<typeof buildCurrentMonthSummary>;
  patterns: ReturnType<typeof generateSpendingPatterns>;
  projectedBalanceSnapshots: ReturnType<typeof getProjectedBalanceSnapshots>;
  repeatSuggestions: ReturnType<typeof getRepeatSuggestions>;
  upcomingBills: UpcomingBill[];
  netWorthTrend: ReturnType<typeof buildNetWorthTrend>;
};

export const ActionsContext = createContext<FinanceActions | null>(null);
export const DerivedStoreContext = createContext<DerivedStore | null>(null);
export const FinanceStoreContext = createContext<FinanceStore | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialFinanceState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const store = useMemo(
    () => createFinanceStore(() => stateRef.current),
    []
  );

  useEffect(() => {
    store.notify();
  }, [state, store]);

  const actions = useMemo(
    () => createFinanceActions(dispatch, () => stateRef.current),
    []
  );

  const patterns = useMemo(
    () => generateSpendingPatterns(state.moments),
    [state.moments]
  );
  const repeatSuggestions = useMemo(
    () => getRepeatSuggestions(state.moments),
    [state.moments]
  );
  const monthlySummary = useMemo(
    () => buildCurrentMonthSummary(state.moments, state.categoryModes),
    [state.moments, state.categoryModes]
  );
  const projectedBalanceSnapshots = useMemo(
    () =>
      getProjectedBalanceSnapshots({
        accounts: state.accounts,
        balanceSnapshots: state.balanceSnapshots,
        moments: state.moments,
        transfers: state.transfers
      }),
    [state.accounts, state.balanceSnapshots, state.moments, state.transfers]
  );
  const accountDrift = useMemo(
    () =>
      buildAccountDriftAlerts({
        accounts: state.accounts,
        balanceSnapshots: state.balanceSnapshots,
        moments: state.moments,
        transfers: state.transfers
      }),
    [state.accounts, state.balanceSnapshots, state.moments, state.transfers]
  );
  const latestBalanceTotal = useMemo(
    () => getLatestBalanceTotal(projectedBalanceSnapshots),
    [projectedBalanceSnapshots]
  );
  const feedbackByPattern = useMemo(
    () => new Map(state.feedback.map((item) => [item.patternId, item.response])),
    [state.feedback]
  );
  const categoryLabels = useMemo(
    () => getCategoryLabels(state.expenseCategories),
    [state.expenseCategories]
  );
  const hasMonthlyPlan = Boolean(state.monthlyPlan);
  const runwayMonths = useMemo(
    () =>
      getRunwayMonths({
        latestBalanceTotal,
        moments: state.moments
      }),
    [latestBalanceTotal, state.moments]
  );
  const upcomingBills = useMemo(
    () => getUpcomingBills({ bills: state.recurringBills }),
    [state.recurringBills]
  );
  const upcomingBillsReserve = useMemo(
    () => upcomingBills.reduce((sum, item) => sum + item.bill.amount, 0),
    [upcomingBills]
  );
  const netWorthTrend = useMemo(
    () =>
      buildNetWorthTrend({
        balanceSnapshots: state.balanceSnapshots,
        projectedSnapshots:
          state.balanceSnapshots.length > 0 ? projectedBalanceSnapshots : undefined
      }),
    [projectedBalanceSnapshots, state.balanceSnapshots]
  );
  const allocationPlan = useMemo(
    () => {
      const currentBalances = getLatestBalanceSnapshots(projectedBalanceSnapshots);
      const hasBalanceEvidence =
        state.balanceSnapshots.length > 0
        || monthlySummary.income > 0
        || monthlySummary.expense > 0
        || state.transfers.length > 0;

      return buildAllocationPlan({
        accounts: state.accounts,
        hasBalanceEvidence,
        latestSnapshots: currentBalances,
        monthlyPlan: state.monthlyPlan,
        monthlySummary,
        upcomingBillsReserve
      });
    },
    [
      monthlySummary,
      projectedBalanceSnapshots,
      state.accounts,
      state.balanceSnapshots.length,
      state.monthlyPlan,
      state.transfers.length,
      upcomingBillsReserve
    ]
  );
  const derived = useMemo<FinanceDerived>(
    () => ({
      accountDrift,
      allocationPlan,
      categoryLabels,
      feedbackByPattern,
      hasMonthlyPlan,
      latestBalanceTotal,
      runwayMonths,
      monthlySummary,
      patterns,
      projectedBalanceSnapshots,
      repeatSuggestions,
      upcomingBills,
      netWorthTrend
    }),
    [
      accountDrift,
      allocationPlan,
      categoryLabels,
      feedbackByPattern,
      hasMonthlyPlan,
      latestBalanceTotal,
      netWorthTrend,
      runwayMonths,
      monthlySummary,
      patterns,
      projectedBalanceSnapshots,
      repeatSuggestions,
      upcomingBills
    ]
  );

  const derivedRef = useRef(derived);
  derivedRef.current = derived;
  const derivedStore = useMemo(
    () => createDerivedStore(() => derivedRef.current),
    []
  );

  useEffect(() => {
    derivedStore.notify();
  }, [derived, derivedStore]);

  return (
    <FinanceStoreContext.Provider value={store}>
      <DerivedStoreContext.Provider value={derivedStore}>
        <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
      </DerivedStoreContext.Provider>
    </FinanceStoreContext.Provider>
  );
}