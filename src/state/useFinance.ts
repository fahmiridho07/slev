import { useContext } from "react";
import { ActionsContext, DerivedContext, FinanceDerived, StateContext } from "./FinanceProvider";
import { FinanceActions } from "./financeActions";
import { FinanceState } from "./financeReducer";

export function useActions(): FinanceActions {
  const context = useContext(ActionsContext);
  if (!context) {
    throw new Error("useActions must be used within FinanceProvider");
  }
  return context;
}

export function useDerived(): FinanceDerived {
  const context = useContext(DerivedContext);
  if (!context) {
    throw new Error("useDerived must be used within FinanceProvider");
  }
  return context;
}

export function useFinanceState(): FinanceState {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useFinanceState must be used within FinanceProvider");
  }
  return context;
}

export function useFinance() {
  return {
    actions: useActions(),
    derived: useDerived(),
    state: useFinanceState()
  };
}