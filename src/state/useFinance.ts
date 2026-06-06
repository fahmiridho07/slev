import { useCallback, useContext, useRef, useSyncExternalStore } from "react";
import {
  ActionsContext,
  DerivedContext,
  FinanceDerived,
  FinanceStoreContext
} from "./FinanceProvider";
import { FinanceActions } from "./financeActions";
import { FinanceState } from "./financeReducer";
import { shallowEqual } from "./shallowEqual";

export { shallowEqual };

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

export function useFinanceSelector<T>(
  selector: (state: FinanceState) => T,
  isEqual: (a: T, b: T) => boolean = Object.is
): T {
  const store = useContext(FinanceStoreContext);
  if (!store) {
    throw new Error("useFinanceSelector must be used within FinanceProvider");
  }

  const selectorRef = useRef(selector);
  const isEqualRef = useRef(isEqual);
  selectorRef.current = selector;
  isEqualRef.current = isEqual;

  const sliceRef = useRef<T | undefined>(undefined);

  const getSnapshot = useCallback(() => {
    const next = selectorRef.current(store.getState());
    const prev = sliceRef.current;
    if (prev === undefined || !isEqualRef.current(prev, next)) {
      sliceRef.current = next;
    }
    return sliceRef.current as T;
  }, [store]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}