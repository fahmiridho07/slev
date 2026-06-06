import React, { createContext, useMemo, useReducer, useRef } from "react";
import { MonthlyPlan, PatternFeedbackResponse } from "../features/spendingMemory.types";
import { getRepeatSuggestions } from "../lib/analysis";
import {
  buildCurrentMonthSummary,
  getLatestBalanceTotal,
  getProjectedBalanceSnapshots
} from "../lib/financeEngine";
import { generateSpendingPatterns } from "../lib/spendingMemoryPatterns";
import { getCategoryLabels } from "../services/categoryRepository";
import { createFinanceActions, FinanceActions } from "./financeActions";
import { financeReducer, FinanceState, initialFinanceState } from "./financeReducer";

export type FinanceDerived = {
  categoryLabels: ReturnType<typeof getCategoryLabels>;
  feedbackByPattern: Map<string, PatternFeedbackResponse>;
  latestBalanceTotal: number;
  monthlyPlan: MonthlyPlan | null;
  monthlySummary: ReturnType<typeof buildCurrentMonthSummary>;
  patterns: ReturnType<typeof generateSpendingPatterns>;
  projectedBalanceSnapshots: ReturnType<typeof getProjectedBalanceSnapshots>;
  repeatSuggestions: ReturnType<typeof getRepeatSuggestions>;
};

export const ActionsContext = createContext<FinanceActions | null>(null);
export const DerivedContext = createContext<FinanceDerived | null>(null);
export const StateContext = createContext<FinanceState | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialFinanceState);
  const stateRef = useRef(state);
  stateRef.current = state;

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
  const monthlyPlan = useMemo(() => state.monthlyPlan, [state.monthlyPlan]);

  const derived = useMemo<FinanceDerived>(
    () => ({
      categoryLabels,
      feedbackByPattern,
      latestBalanceTotal,
      monthlyPlan,
      monthlySummary,
      patterns,
      projectedBalanceSnapshots,
      repeatSuggestions
    }),
    [
      categoryLabels,
      feedbackByPattern,
      latestBalanceTotal,
      monthlyPlan,
      monthlySummary,
      patterns,
      projectedBalanceSnapshots,
      repeatSuggestions
    ]
  );

  return (
    <StateContext.Provider value={state}>
      <DerivedContext.Provider value={derived}>
        <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
      </DerivedContext.Provider>
    </StateContext.Provider>
  );
}