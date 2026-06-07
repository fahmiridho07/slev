import { FinanceDerived } from "./FinanceProvider";

export type DerivedStore = {
  getDerived: () => FinanceDerived;
  subscribe: (listener: () => void) => () => void;
};

export type DerivedStoreApi = DerivedStore & {
  notify: () => void;
};

export function createDerivedStore(getDerived: () => FinanceDerived): DerivedStoreApi {
  const listeners = new Set<() => void>();

  return {
    getDerived,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    notify() {
      listeners.forEach((listener) => listener());
    }
  };
}