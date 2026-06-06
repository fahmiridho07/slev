import React, { createContext, useEffect, useMemo, useReducer, useRef } from "react";
import { PatternFeedbackResponse } from "../features/spendingMemory.types";
import { getRepeatSuggestions } from "../lib/analysis";
import {
  buildCurrentMonthSummary,
  getLatestBalanceTotal,
  getProjectedBalanceSnapshots
} from "../lib/financeEngine";
import { generateSpendingPatterns } from "../lib/spendingMemoryPatterns";
import { getCategoryLabels } from "../services/categoryRepository";
import { createFinanceActions, FinanceActions } from "./financeActions";
import { financeReducer, initialFinanceState } from "./financeReducer";
import { createFinanceStore, FinanceStore } from "./financeStore";

export type FinanceDerived = {
  categoryLabels: ReturnType<typeof getCategoryLabels>;
  feedbackByPattern: Map<string, PatternFeedbackResponse>;
  latestBalanceTotal: number;
  monthlySummary: ReturnType<typeof buildCurrentMonthSummary>;
  patterns: ReturnType<typeof generateSpendingPatterns>;
  projectedBalanceSnapshots: ReturnType<typeof getProjectedBalanceSnapshots>;
  repeatSuggestions: ReturnType<typeof getRepeatSuggestions>;
};

export const ActionsContext = createContext<FinanceActions | null>(null);
export const DerivedContext = createContext<FinanceDerived | null>(null);
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
  const derived = useMemo<FinanceDerived>(
    () => ({
      categoryLabels,
      feedbackByPattern,
      latestBalanceTotal,
      monthlySummary,
      patterns,
      projectedBalanceSnapshots,
      repeatSuggestions
    }),
    [
      categoryLabels,
      feedbackByPattern,
      latestBalanceTotal,
      monthlySummary,
      patterns,
      projectedBalanceSnapshots,
      repeatSuggestions
    ]
  );

  return (
    <FinanceStoreContext.Provider value={store}>
      <DerivedContext.Provider value={derived}>
        <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
      </DerivedContext.Provider>
    </FinanceStoreContext.Provider>
  );
}