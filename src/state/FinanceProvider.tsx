import React, { createContext, useMemo, useReducer, useRef } from "react";
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
import { financeReducer, FinanceState, initialFinanceState } from "./financeReducer";

export type FinanceDerived = {
  categoryLabels: ReturnType<typeof getCategoryLabels>;
  feedbackByPattern: Map<string, PatternFeedbackResponse>;
  latestBalanceTotal: number;
  monthlySummary: ReturnType<typeof buildCurrentMonthSummary>;
  patterns: ReturnType<typeof generateSpendingPatterns>;
  projectedBalanceSnapshots: ReturnType<typeof getProjectedBalanceSnapshots>;
  repeatSuggestions: ReturnType<typeof getRepeatSuggestions>;
};

export type FinanceContextValue = {
  actions: FinanceActions;
  derived: FinanceDerived;
  state: FinanceState;
};

export const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialFinanceState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const actions = useMemo(
    () => createFinanceActions(dispatch, () => stateRef.current),
    []
  );

  const derived = useMemo<FinanceDerived>(() => {
    const patterns = generateSpendingPatterns(state.moments);
    const repeatSuggestions = getRepeatSuggestions(state.moments);
    const monthlySummary = buildCurrentMonthSummary(state.moments, state.categoryModes);
    const projectedBalanceSnapshots = getProjectedBalanceSnapshots({
      accounts: state.accounts,
      balanceSnapshots: state.balanceSnapshots,
      moments: state.moments,
      transfers: state.transfers
    });
    const latestBalanceTotal = getLatestBalanceTotal(projectedBalanceSnapshots);
    const feedbackByPattern = new Map(
      state.feedback.map((item) => [item.patternId, item.response])
    );
    const categoryLabels = getCategoryLabels(state.expenseCategories);

    return {
      categoryLabels,
      feedbackByPattern,
      latestBalanceTotal,
      monthlySummary,
      patterns,
      projectedBalanceSnapshots,
      repeatSuggestions
    };
  }, [state]);

  const value = useMemo(
    () => ({ actions, derived, state }),
    [actions, derived, state]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}