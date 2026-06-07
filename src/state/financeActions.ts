import { Share } from "react-native";
import { hapticSelection, hapticSuccess } from "../lib/haptics";
import { CategoryModeValue } from "../features/app.types";
import { CaptureFormValues } from "../features/capture/types";
import {
  BudgetPeriod,
  EntryType,
  ExpenseCategory,
  MoneyAccount,
  PatternFeedbackResponse,
  SpendingContext
} from "../features/spendingMemory.types";
import { getMonthKey } from "../lib/analysis";
import {
  deleteRecurringBill,
  listRecurringBills,
  saveRecurringBill
} from "../services/recurringBillsRepository";
import {
  getAccountKeepOneToast,
  getAccountNeedNameToast,
  getAccountRemovedToast,
  getAccountSavedToast,
  getBackupExportFailedToast,
  getBackupImportedToast,
  getBackupInvalidJsonToast,
  getBackupReadyToast,
  getBalanceNeedFieldsToast,
  getBalanceSavedToast,
  getBillInvalidDayToast,
  getBillLoggedPartialToast,
  getBillLoggedToast,
  getBillNeedFieldsToast,
  getBillRemovedToast,
  getBillSavedToast,
  getBillUnavailableToast,
  getCaptureNeedAmountToast,
  getCaptureNeedCategoryToast,
  getCaptureNeedTransferAccountsToast,
  getCategoryNeedNameToast,
  getCategoryRemovedToast,
  getCategorySavedToast,
  getClearAllToast,
  getExpenseSavedToast,
  getGoalNeedFieldsToast,
  getGoalRemovedToast,
  getGoalSavedToast,
  getIncomeSavedToast,
  getLimitMarkedAsToast,
  getLimitNeedAmountToast,
  getLimitRemovedToast,
  getLimitSavedToast,
  getMemoryNeedAmountToast,
  getMemoryRemovedToast,
  getMemoryRestoredToast,
  getPatternFeedbackSavedToast,
  getMemoryUpdatedToast,
  getPlanSavedToast,
  getResetFailedToast,
  getResetSuccessToast,
  getShortcutNeedLabelToast,
  getShortcutRemovedToast,
  getShortcutSavedToast,
  getShortcutTransferUseChipsToast,
  getTransferMovedToast,
  getTransferRemovedToast,
  getWriteFailureToast,
  getBackupShareTitle,
  getImportErrorToast
} from "../i18n/toasts";
import { parseAmountInput } from "../lib/formatMoney";
import {
  clearAccountsAndTransfers,
  deleteMoneyAccount,
  deleteMoneyTransfer,
  listMoneyAccounts,
  listMoneyTransfers,
  saveMoneyAccount,
  saveMoneyTransfer
} from "../services/accountRepository";
import {
  clearBudgetLimits,
  deleteBudgetLimit,
  listBudgetLimits,
  saveBudgetLimit
} from "../services/budgetRepository";
import {
  clearExpenseCategories,
  deleteExpenseCategory,
  listExpenseCategories,
  saveExpenseCategory
} from "../services/categoryRepository";
import {
  clearManualFinance,
  deleteCategoryMode,
  deleteManualTemplate,
  deleteSavingsGoal,
  getMonthlyPlan,
  listBalanceSnapshots,
  listCategoryModes,
  listManualTemplates,
  listSavingsGoals,
  saveBalanceSnapshot,
  saveCategoryMode,
  saveManualTemplate,
  saveMonthlyPlan,
  saveSavingsGoal
} from "../services/manualFinanceRepository";
import { exportAllDataWithReport, importAllData } from "../services/storageBackup";
import {
  formatSkippedExportWarning,
  getStorageKeyLabel,
  resetStorageKey
} from "../services/storageHealth";
import { runMigrations, STORAGE_KEYS } from "../services/storageSchema";
import {
  clearSpendingMemory,
  deleteSpendingMoment,
  restoreSpendingMoment,
  listPatternFeedback,
  listSpendingMoments,
  savePatternFeedback,
  saveSpendingMoment,
  updateSpendingMoment
} from "../services/spendingMemoryRepository";
import { FinanceAction, FinanceState } from "./financeReducer";

export type FinanceDispatch = (action: FinanceAction) => void;

export type FinanceActions = ReturnType<typeof createFinanceActions>;

export function createFinanceActions(
  dispatch: FinanceDispatch,
  getState: () => FinanceState
) {
  async function reload() {
    const currentMonthKey = getMonthKey(new Date());
    const [
      storedMoments,
      storedFeedback,
      storedBudgetLimits,
      storedCategoryModes,
      storedMonthlyPlan,
      storedManualTemplates,
      storedSavingsGoals,
      storedRecurringBills,
      storedBalanceSnapshots,
      storedAccounts,
      storedTransfers,
      storedExpenseCategories
    ] = await Promise.all([
      listSpendingMoments(),
      listPatternFeedback(),
      listBudgetLimits(),
      listCategoryModes(),
      getMonthlyPlan(currentMonthKey),
      listManualTemplates(),
      listSavingsGoals(),
      listRecurringBills(),
      listBalanceSnapshots(),
      listMoneyAccounts(),
      listMoneyTransfers(),
      listExpenseCategories()
    ]);

    dispatch({
      type: "hydrate",
      payload: {
        moments: storedMoments,
        feedback: storedFeedback,
        budgetLimits: storedBudgetLimits,
        categoryModes: storedCategoryModes,
        monthlyPlan: storedMonthlyPlan,
        manualTemplates: storedManualTemplates,
        savingsGoals: storedSavingsGoals,
        recurringBills: storedRecurringBills,
        balanceSnapshots: storedBalanceSnapshots,
        accounts: storedAccounts,
        transfers: storedTransfers,
        expenseCategories: storedExpenseCategories
      }
    });
  }

  async function boot() {
    await runMigrations();
    await reload();
    dispatch({ type: "set_ready", ready: true });
  }

  function setMessage(message: string) {
    dispatch({ type: "set_message", message });
  }

  function notifySuccess(message: string) {
    hapticSuccess();
    setMessage(message);
  }

  function notifyWriteFailure(storageKey: string) {
    setMessage(getWriteFailureToast(storageKey));
  }

  function setClearConfirmVisible(visible: boolean) {
    dispatch({ type: "set_clear_confirm_visible", visible });
  }

  async function saveMoment(capture: CaptureFormValues, categoryCount: number) {
    const amount = parseAmountInput(capture.amountText);
    if (!amount) {
      setMessage(getCaptureNeedAmountToast());
      return { ok: false as const };
    }

    if (capture.entryType === "expense" && categoryCount === 0) {
      setMessage(getCaptureNeedCategoryToast());
      return { ok: false as const };
    }

    if (capture.entryType === "transfer") {
      if (!capture.fromAccount || !capture.toAccount || capture.fromAccount === capture.toAccount) {
        setMessage(getCaptureNeedTransferAccountsToast());
        return { ok: false as const };
      }

      const { data: updatedTransfers, persisted } = await saveMoneyTransfer({
        amount,
        fromAccount: capture.fromAccount,
        note: capture.note,
        toAccount: capture.toAccount
      });
      if (!persisted) {
        notifyWriteFailure(STORAGE_KEYS.transfers);
        return { ok: false as const };
      }
      dispatch({ type: "set_transfers", transfers: updatedTransfers });
      setMessage(getTransferMovedToast(amount, capture.fromAccount, capture.toAccount));
      return { ok: true as const, resetNote: true };
    }

    const { data: saved, persisted } = await saveSpendingMoment({
      amount,
      label: capture.entryType === "expense" ? capture.label : undefined,
      context: capture.entryType === "expense" ? capture.context : "Other",
      note: capture.note,
      type: capture.entryType,
      source: capture.entryType === "income" ? capture.source : undefined,
      accountLabel: capture.accountLabel
    });
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.moments);
      return { ok: false as const };
    }
    dispatch({ type: "prepend_moment", moment: saved });
    setMessage(
      saved.type === "income"
        ? getIncomeSavedToast(saved.amount, saved.source)
        : getExpenseSavedToast(saved.amount, saved.label)
    );
    return {
      ok: true as const,
      expenseContext: saved.type === "expense" ? saved.context : undefined
    };
  }

  async function removeMoment(id: string) {
    const moment = getState().moments.find((entry) => entry.id === id);
    if (!moment) {
      return;
    }

    const { persisted } = await deleteSpendingMoment(id);
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.moments);
      return;
    }
    dispatch({ type: "remove_moment", id });
    dispatch({ type: "set_undo_toast", moment });
    setMessage(getMemoryRemovedToast());
  }

  function clearUndoToast() {
    dispatch({ type: "set_undo_toast", moment: null });
  }

  async function undoRemoveMoment() {
    const moment = getState().undoToast;
    if (!moment) {
      return;
    }

    const { persisted } = await restoreSpendingMoment(moment);
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.moments);
      return;
    }

    dispatch({ type: "prepend_moment", moment });
    dispatch({ type: "set_undo_toast", moment: null });
    setMessage(getMemoryRestoredToast());
  }

  async function updateMoment(
    id: string,
    input: {
      amountText: string;
      label: string;
      context: SpendingContext;
      note: string;
      type: EntryType;
      source: string;
      accountLabel: string;
    }
  ) {
    const amount = parseAmountInput(input.amountText);
    if (!amount) {
      setMessage(getMemoryNeedAmountToast());
      return;
    }

    const { data: updated, persisted } = await updateSpendingMoment(id, {
      amount,
      label: input.type === "expense" ? input.label : undefined,
      context: input.type === "expense" ? input.context : "Other",
      note: input.note,
      type: input.type,
      source: input.type === "income" ? input.source : undefined,
      accountLabel: input.accountLabel
    });
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.moments);
      return;
    }
    const moment = updated.find((item) => item.id === id);
    if (moment) {
      dispatch({ type: "replace_moment", moment });
    } else {
      dispatch({ type: "set_moments", moments: updated });
    }
    notifySuccess(getMemoryUpdatedToast());
  }

  async function saveAsTemplate(capture: CaptureFormValues) {
    if (capture.entryType === "transfer") {
      setMessage(getShortcutTransferUseChipsToast());
      return;
    }

    const amount = parseAmountInput(capture.amountText);
    const templateLabel = capture.entryType === "income" ? capture.source.trim() : (capture.label.trim() || capture.context);
    if (!templateLabel) {
      setMessage(getShortcutNeedLabelToast());
      return;
    }

    const { data: updated, persisted } = await saveManualTemplate({
      amount: amount ?? undefined,
      context: capture.entryType === "expense" ? capture.context : "Other",
      label: capture.entryType === "expense" ? templateLabel : undefined,
      note: capture.note,
      accountLabel: capture.accountLabel,
      source: capture.entryType === "income" ? capture.source : undefined,
      type: capture.entryType
    });
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.manualTemplates);
      return;
    }
    dispatch({ type: "set_manual_templates", manualTemplates: updated });
    setMessage(getShortcutSavedToast(templateLabel));
  }

  async function removeManualTemplate(id: string) {
    const { data: updated, persisted } = await deleteManualTemplate(id);
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.manualTemplates);
      return;
    }
    dispatch({ type: "set_manual_templates", manualTemplates: updated });
    setMessage(getShortcutRemovedToast());
  }

  async function removeTransfer(id: string) {
    const { data: updated, persisted } = await deleteMoneyTransfer(id);
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.transfers);
      return;
    }
    dispatch({ type: "set_transfers", transfers: updated });
    setMessage(getTransferRemovedToast());
  }

  async function saveAccount(input: {
    id?: string;
    isIncomeHub: boolean;
    kind: MoneyAccount["kind"];
    label: string;
    tier?: MoneyAccount["tier"];
  }) {
    if (!input.label.trim()) {
      setMessage(getAccountNeedNameToast());
      return;
    }

    const { data: updated, persisted } = await saveMoneyAccount(input);
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.accounts);
      return;
    }
    dispatch({ type: "set_accounts", accounts: updated });
    setMessage(getAccountSavedToast(input.label.trim()));
  }

  async function removeAccount(id: string) {
    const { data: updated, persisted } = await deleteMoneyAccount(id);
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.accounts);
      return;
    }
    dispatch({ type: "set_accounts", accounts: updated });
    setMessage(updated.some((account) => account.id === id) ? getAccountKeepOneToast() : getAccountRemovedToast());
  }

  async function saveCategory(input: { id?: string; label: string }) {
    if (!input.label.trim()) {
      setMessage(getCategoryNeedNameToast());
      return;
    }

    const { data: updated, persisted } = await saveExpenseCategory(input);
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.expenseCategories);
      return;
    }
    dispatch({ type: "set_expense_categories", expenseCategories: updated });
    setMessage(getCategorySavedToast(input.label.trim()));
  }

  async function removeCategory(category: ExpenseCategory) {
    const updatedCategories = await deleteExpenseCategory(category.id);
    const updatedLimits = await deleteBudgetLimit(category.label);
    const updatedModes = await deleteCategoryMode(category.label);
    if (!updatedCategories.persisted || !updatedLimits.persisted || !updatedModes.persisted) {
      notifyWriteFailure(STORAGE_KEYS.expenseCategories);
      await reload();
      return;
    }
    dispatch({ type: "set_expense_categories", expenseCategories: updatedCategories.data });
    dispatch({ type: "set_budget_limits", budgetLimits: updatedLimits.data });
    dispatch({ type: "set_category_modes", categoryModes: updatedModes.data });
    setMessage(getCategoryRemovedToast(category.label));
  }

  async function saveCategoryBudget(category: SpendingContext, amountTextValue: string, period: BudgetPeriod) {
    const limitAmount = parseAmountInput(amountTextValue);
    if (!limitAmount) {
      setMessage(getLimitNeedAmountToast());
      return;
    }

    const { data: updated, persisted } = await saveBudgetLimit({ category, limitAmount, period });
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.budgetLimits);
      return;
    }
    dispatch({ type: "set_budget_limits", budgetLimits: updated });
    setMessage(getLimitSavedToast(category, period));
  }

  async function removeCategoryBudget(category: SpendingContext) {
    const { data: updated, persisted } = await deleteBudgetLimit(category);
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.budgetLimits);
      return;
    }
    dispatch({ type: "set_budget_limits", budgetLimits: updated });
    setMessage(getLimitRemovedToast(category));
  }

  async function changeCategoryMode(category: SpendingContext, mode: CategoryModeValue) {
    const { data: updated, persisted } = await saveCategoryMode(category, mode);
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.categoryModes);
      return;
    }
    dispatch({ type: "set_category_modes", categoryModes: updated });
    setMessage(getLimitMarkedAsToast(category, mode));
  }

  async function savePlan(input: {
    fixedCosts: string;
    flexibleBudget: string;
    note: string;
    expectedIncome: string;
    savingsTarget: string;
  }) {
    const currentMonthKey = getMonthKey(new Date());
    const { data: saved, persisted } = await saveMonthlyPlan({
      expectedIncome: parseAmountInput(input.expectedIncome) ?? 0,
      fixedCosts: parseAmountInput(input.fixedCosts) ?? 0,
      flexibleBudget: parseAmountInput(input.flexibleBudget) ?? 0,
      month: currentMonthKey,
      note: input.note,
      savingsTarget: parseAmountInput(input.savingsTarget) ?? 0
    });
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.monthlyPlans);
      return;
    }
    dispatch({ type: "set_monthly_plan", monthlyPlan: saved });
    notifySuccess(getPlanSavedToast());
  }

  async function saveGoal(input: {
    id?: string;
    label: string;
    savedAmount: string;
    targetAmount: string;
  }) {
    const targetAmount = parseAmountInput(input.targetAmount);
    if (!input.label.trim() || !targetAmount) {
      setMessage(getGoalNeedFieldsToast());
      return;
    }

    const { data: updated, persisted } = await saveSavingsGoal({
      id: input.id,
      label: input.label,
      savedAmount: parseAmountInput(input.savedAmount) ?? 0,
      targetAmount
    });
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.savingsGoals);
      return;
    }
    dispatch({ type: "set_savings_goals", savingsGoals: updated });
    notifySuccess(getGoalSavedToast());
  }

  async function removeSavingsGoal(id: string) {
    const { data: updated, persisted } = await deleteSavingsGoal(id);
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.savingsGoals);
      return;
    }
    dispatch({ type: "set_savings_goals", savingsGoals: updated });
    setMessage(getGoalRemovedToast());
  }

  async function saveRecurringBillAction(input: {
    id?: string;
    label: string;
    amount: string;
    context: SpendingContext;
    accountLabel?: string;
    dayOfMonth: string;
    active: boolean;
    lastPaidMonth?: string;
  }) {
    const amount = parseAmountInput(input.amount);
    const dayOfMonth = Number.parseInt(input.dayOfMonth, 10);
    if (!input.label.trim() || !amount) {
      setMessage(getBillNeedFieldsToast());
      return;
    }
    if (!Number.isFinite(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      setMessage(getBillInvalidDayToast());
      return;
    }

    const { data: updated, persisted } = await saveRecurringBill({
      id: input.id,
      label: input.label,
      amount,
      context: input.context,
      accountLabel: input.accountLabel,
      dayOfMonth,
      active: input.active,
      lastPaidMonth: input.lastPaidMonth
    });
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.recurringBills);
      return;
    }
    dispatch({ type: "set_recurring_bills", recurringBills: updated });
    notifySuccess(getBillSavedToast());
  }

  async function removeRecurringBill(id: string) {
    const { data: updated, persisted } = await deleteRecurringBill(id);
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.recurringBills);
      return;
    }
    dispatch({ type: "set_recurring_bills", recurringBills: updated });
    setMessage(getBillRemovedToast());
  }

  async function logRecurringBillPayment(billId: string) {
    const bill = getState().recurringBills.find((item) => item.id === billId);
    if (!bill) {
      setMessage(getBillUnavailableToast());
      return;
    }

    const { data: saved, persisted } = await saveSpendingMoment({
      amount: bill.amount,
      label: bill.label,
      context: bill.context,
      accountLabel: bill.accountLabel,
      type: "expense"
    });
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.moments);
      return;
    }
    dispatch({ type: "prepend_moment", moment: saved });

    const currentMonthKey = getMonthKey(new Date());
    const { data: updatedBills, persisted: billPersisted } = await saveRecurringBill({
      id: bill.id,
      label: bill.label,
      amount: bill.amount,
      context: bill.context,
      accountLabel: bill.accountLabel,
      dayOfMonth: bill.dayOfMonth,
      active: bill.active,
      lastPaidMonth: currentMonthKey
    });
    if (!billPersisted) {
      notifyWriteFailure(STORAGE_KEYS.recurringBills);
      setMessage(getBillLoggedPartialToast(saved.amount));
      return;
    }
    dispatch({ type: "set_recurring_bills", recurringBills: updatedBills });
    setMessage(getBillLoggedToast(saved.amount, bill.label));
  }

  async function saveBalance(input: { accountLabel: string; amount: string }) {
    const amount = parseAmountInput(input.amount);
    if (!input.accountLabel.trim() || !amount) {
      setMessage(getBalanceNeedFieldsToast());
      return;
    }

    const { data: updated, persisted } = await saveBalanceSnapshot({
      amount,
      accountLabel: input.accountLabel
    });
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.balanceSnapshots);
      return;
    }
    dispatch({ type: "set_balance_snapshots", balanceSnapshots: updated });
    notifySuccess(getBalanceSavedToast());
  }

  async function answerPattern(patternId: string, response: PatternFeedbackResponse) {
    const { data: updated, persisted } = await savePatternFeedback(patternId, response);
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.patternFeedback);
      return;
    }
    dispatch({ type: "set_feedback", feedback: updated });
    hapticSelection();
    setMessage(getPatternFeedbackSavedToast());
  }

  function clearAll() {
    setClearConfirmVisible(true);
  }

  async function exportLocalBackup() {
    try {
      const { backup, skipped } = await exportAllDataWithReport();
      await Share.share({
        message: JSON.stringify(backup, null, 2),
        title: getBackupShareTitle()
      });
      const skipWarning = formatSkippedExportWarning(skipped);
      setMessage(getBackupReadyToast(skipWarning || undefined));
    } catch {
      setMessage(getBackupExportFailedToast());
    }
  }

  async function resetDamagedCollection(key: string) {
    const label = getStorageKeyLabel(key);
    const reset = await resetStorageKey(key);
    if (!reset) {
      setMessage(getResetFailedToast(label));
      return;
    }

    await reload();
    setMessage(getResetSuccessToast(label));
  }

  async function importLocalBackup(jsonText: string) {
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      const result = await importAllData(parsed);
      if (!result.ok) {
        setMessage(getImportErrorToast(result.code, result.key));
        return;
      }

      await reload();
      hapticSuccess();
      setMessage(getBackupImportedToast());
    } catch {
      setMessage(getBackupInvalidJsonToast());
    }
  }

  async function confirmClearAll() {
    await Promise.all([
      clearSpendingMemory(),
      clearBudgetLimits(),
      clearManualFinance(),
      clearAccountsAndTransfers(),
      clearExpenseCategories()
    ]);
    const [resetAccounts, resetCategories] = await Promise.all([
      listMoneyAccounts(),
      listExpenseCategories()
    ]);
    dispatch({
      type: "clear_all",
      payload: { accounts: resetAccounts, expenseCategories: resetCategories }
    });
    setMessage(getClearAllToast());
  }

  return {
    answerPattern,
    boot,
    changeCategoryMode,
    clearAll,
    clearUndoToast,
    confirmClearAll,
    exportLocalBackup,
    importLocalBackup,
    reload,
    resetDamagedCollection,
    removeAccount,
    removeCategory,
    removeCategoryBudget,
    removeManualTemplate,
    removeMoment,
    undoRemoveMoment,
    logRecurringBillPayment,
    removeRecurringBill,
    removeSavingsGoal,
    removeTransfer,
    saveAccount,
    saveAsTemplate,
    saveBalance,
    saveCategory,
    saveCategoryBudget,
    saveGoal,
    saveRecurringBill: saveRecurringBillAction,
    saveMoment,
    savePlan,
    setClearConfirmVisible,
    setMessage,
    updateMoment
  };
}