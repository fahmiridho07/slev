import React, { createContext, useEffect, useMemo, useReducer, useRef } from "react";

import { getUpcomingBills, UpcomingBill } from "../lib/recurringBills";

import { getCategoryLabels } from "../services/categoryRepository";
import { createFinanceActions, FinanceActions } from "./financeActions";
import { financeReducer, initialFinanceState } from "./financeReducer";
import { createDerivedStore, DerivedStore } from "./derivedStore";
import { createFinanceStore, FinanceStore } from "./financeStore";

export type FinanceDerived = {
  categoryLabels: ReturnType<typeof getCategoryLabels>;
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

  const categoryLabels = useMemo(
    () => getCategoryLabels(state.expenseCategories),
    [state.expenseCategories]
  );
  const upcomingBills = useMemo(
    () => getUpcomingBills({ bills: state.recurringBills }),
    [state.recurringBills]
  );
  const derived = useMemo<FinanceDerived>(
    () => ({
      categoryLabels,
      upcomingBills
    }),
    [categoryLabels, upcomingBills]
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