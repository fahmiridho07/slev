import { useCallback, useEffect, useMemo, useState } from "react";
import { applyItemOrder, keysFromItems } from "../lib/applyItemOrder";
import { MoneyAccount, SpendingContext } from "../features/spendingMemory.types";
import { getCapturePickerOrder, setCapturePickerOrder } from "../services/capturePickerOrder";

export function useCapturePickerOrder(categories: SpendingContext[], accounts: MoneyAccount[]) {
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [accountOrder, setAccountOrder] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void getCapturePickerOrder().then((stored) => {
      if (cancelled) {
        return;
      }
      setCategoryOrder(stored.categoryKeys);
      setAccountOrder(stored.accountKeys);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const orderedCategories = useMemo(
    () => applyItemOrder(categories, categoryOrder, (category) => category),
    [categories, categoryOrder]
  );
  const orderedAccounts = useMemo(
    () => applyItemOrder(accounts, accountOrder, (account) => account.label),
    [accountOrder, accounts]
  );

  const persistCategoryOrder = useCallback((nextCategories: SpendingContext[]) => {
    const nextKeys = keysFromItems(nextCategories, (category) => category);
    setCategoryOrder(nextKeys);
    void setCapturePickerOrder({
      categoryKeys: nextKeys,
      accountKeys: accountOrder
    });
  }, [accountOrder]);

  const persistAccountOrder = useCallback((nextAccounts: MoneyAccount[]) => {
    const nextKeys = keysFromItems(nextAccounts, (account) => account.label);
    setAccountOrder(nextKeys);
    void setCapturePickerOrder({
      categoryKeys: categoryOrder,
      accountKeys: nextKeys
    });
  }, [categoryOrder]);

  return {
    orderedAccounts,
    orderedCategories,
    ready,
    reorderAccounts: persistAccountOrder,
    reorderCategories: persistCategoryOrder
  };
}