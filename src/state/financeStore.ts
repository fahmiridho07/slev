import { FinanceState } from "./financeReducer";

export type FinanceStore = {
  getState: () => FinanceState;
  subscribe: (listener: () => void) => () => void;
};

export type FinanceStoreApi = FinanceStore & {
  notify: () => void;
};

export function createFinanceStore(getState: () => FinanceState): FinanceStoreApi {
  const listeners = new Set<() => void>();

  return {
    getState,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    notify() {
      listeners.forEach((listener) => listener());
    }
  };
}