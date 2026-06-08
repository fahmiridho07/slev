import React, { createContext, useEffect, useMemo, useReducer, useRef } from "react";

import { getUpcomingBills, UpcomingBill } from "../lib/recurringBills";
import {
  AllocationPlan,
  buildAllocationPlan,
  buildCurrentMonthSummary
} from "../lib/financeEngine";

import { getCategoryLabels } from "../services/categoryRepository";
import { createFinanceActions, FinanceActions } from "./financeActions";
import { financeReducer, initialFinanceState } from "./financeReducer";
import { createDerivedStore, DerivedStore } from "./derivedStore";
import { createFinanceStore, FinanceStore } from "./financeStore";

export type FinanceDerived = {
  allocationPlan: AllocationPlan;
  categoryLabels: ReturnType<typeof getCategoryLabels>;
  hasMonthlyPlan: boolean;
  monthlySummary: ReturnType<typeof buildCurrentMonthSummary>;
  upcomingBills: UpcomingBill[];
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

  const monthlySummary = useMemo(
    () => buildCurrentMonthSummary(state.moments, state.categoryModes),
    [state.moments, state.categoryModes]
  );
  const categoryLabels = useMemo(
    () => getCategoryLabels(state.expenseCategories),
    [state.expenseCategories]
  );
  const hasMonthlyPlan = Boolean(state.monthlyPlan);
  const upcomingBills = useMemo(
    () => getUpcomingBills({ bills: state.recurringBills }),
    [state.recurringBills]
  );
  const upcomingBillsReserve = useMemo(
    () => upcomingBills.reduce((sum, item) => sum + item.bill.amount, 0),
    [upcomingBills]
  );
  const allocationPlan = useMemo(
    () => {
      const hasBalanceEvidence =
        monthlySummary.income > 0
        || monthlySummary.expense > 0
        || state.transfers.length > 0;

      return buildAllocationPlan({
        accounts: state.accounts,
        hasBalanceEvidence,
        latestSnapshots: [],
        monthlyPlan: state.monthlyPlan,
        monthlySummary,
        upcomingBillsReserve
      });
    },
    [
      monthlySummary,
      state.accounts,
      state.monthlyPlan,
      state.transfers.length,
      upcomingBillsReserve
    ]
  );
  const derived = useMemo<FinanceDerived>(
    () => ({
      allocationPlan,
      categoryLabels,
      hasMonthlyPlan,
      monthlySummary,
      upcomingBills
    }),
    [
      allocationPlan,
      categoryLabels,
      hasMonthlyPlan,
      monthlySummary,
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