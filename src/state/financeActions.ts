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
import { parseAmountInput } from "../lib/formatMoney";
import { formatRupiah } from "../lib/spendingMemoryPatterns";
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
import {
  clearSpendingMemory,
  deleteSpendingMoment,
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
        balanceSnapshots: storedBalanceSnapshots,
        accounts: storedAccounts,
        transfers: storedTransfers,
        expenseCategories: storedExpenseCategories
      }
    });
  }

  async function boot() {
    await reload();
    dispatch({ type: "set_ready", ready: true });
  }

  function setMessage(message: string) {
    dispatch({ type: "set_message", message });
  }

  function setClearConfirmVisible(visible: boolean) {
    dispatch({ type: "set_clear_confirm_visible", visible });
  }

  async function saveMoment(capture: CaptureFormValues, categoryCount: number) {
    const amount = parseAmountInput(capture.amountText);
    if (!amount) {
      setMessage("Enter an amount to save this memory.");
      return { ok: false as const };
    }

    if (capture.entryType === "expense" && categoryCount === 0) {
      setMessage("Add at least one expense category in Settings before saving an expense.");
      return { ok: false as const };
    }

    if (capture.entryType === "transfer") {
      if (!capture.fromAccount || !capture.toAccount || capture.fromAccount === capture.toAccount) {
        setMessage("Choose two different accounts for this transfer.");
        return { ok: false as const };
      }

      const updatedTransfers = await saveMoneyTransfer({
        amount,
        fromAccount: capture.fromAccount,
        note: capture.note,
        toAccount: capture.toAccount
      });
      dispatch({ type: "set_transfers", transfers: updatedTransfers });
      setMessage(`${formatRupiah(amount)} moved from ${capture.fromAccount} to ${capture.toAccount}.`);
      return { ok: true as const, resetNote: true };
    }

    const saved = await saveSpendingMoment({
      amount,
      label: capture.entryType === "expense" ? capture.label : undefined,
      context: capture.entryType === "expense" ? capture.context : "Other",
      note: capture.note,
      type: capture.entryType,
      source: capture.entryType === "income" ? capture.source : undefined,
      accountLabel: capture.accountLabel
    });
    dispatch({ type: "prepend_moment", moment: saved });
    setMessage(
      saved.type === "income"
        ? `${formatRupiah(saved.amount)} income saved${saved.source ? ` from ${saved.source}` : ""}.`
        : `${formatRupiah(saved.amount)} saved${saved.label ? ` for ${saved.label}` : ""}.`
    );
    return {
      ok: true as const,
      expenseContext: saved.type === "expense" ? saved.context : undefined
    };
  }

  async function removeMoment(id: string) {
    const updated = await deleteSpendingMoment(id);
    dispatch({ type: "set_moments", moments: updated });
    setMessage("Memory removed.");
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
      setMessage("Enter an amount before saving changes.");
      return;
    }

    const updated = await updateSpendingMoment(id, {
      amount,
      label: input.type === "expense" ? input.label : undefined,
      context: input.type === "expense" ? input.context : "Other",
      note: input.note,
      type: input.type,
      source: input.type === "income" ? input.source : undefined,
      accountLabel: input.accountLabel
    });
    dispatch({ type: "set_moments", moments: updated });
    setMessage("Memory updated.");
  }

  async function saveAsTemplate(capture: CaptureFormValues) {
    if (capture.entryType === "transfer") {
      setMessage("Transfer shortcuts can use the account chips directly.");
      return;
    }

    const amount = parseAmountInput(capture.amountText);
    const templateLabel = capture.entryType === "income" ? capture.source.trim() : (capture.label.trim() || capture.context);
    if (!templateLabel) {
      setMessage("Add a label or source before saving a shortcut.");
      return;
    }

    const updated = await saveManualTemplate({
      amount: amount ?? undefined,
      context: capture.entryType === "expense" ? capture.context : "Other",
      label: capture.entryType === "expense" ? templateLabel : undefined,
      note: capture.note,
      accountLabel: capture.accountLabel,
      source: capture.entryType === "income" ? capture.source : undefined,
      type: capture.entryType
    });
    dispatch({ type: "set_manual_templates", manualTemplates: updated });
    setMessage(`${templateLabel} shortcut saved.`);
  }

  async function removeManualTemplate(id: string) {
    const updated = await deleteManualTemplate(id);
    dispatch({ type: "set_manual_templates", manualTemplates: updated });
    setMessage("Shortcut removed.");
  }

  async function removeTransfer(id: string) {
    const updated = await deleteMoneyTransfer(id);
    dispatch({ type: "set_transfers", transfers: updated });
    setMessage("Transfer removed.");
  }

  async function saveAccount(input: {
    id?: string;
    isIncomeHub: boolean;
    kind: MoneyAccount["kind"];
    label: string;
  }) {
    if (!input.label.trim()) {
      setMessage("Add an account or wallet name.");
      return;
    }

    const updated = await saveMoneyAccount(input);
    dispatch({ type: "set_accounts", accounts: updated });
    setMessage(`${input.label.trim()} account saved.`);
  }

  async function removeAccount(id: string) {
    const updated = await deleteMoneyAccount(id);
    dispatch({ type: "set_accounts", accounts: updated });
    setMessage(updated.some((account) => account.id === id) ? "Keep at least one account for balances." : "Account removed.");
  }

  async function saveCategory(input: { id?: string; label: string }) {
    if (!input.label.trim()) {
      setMessage("Add a category name.");
      return;
    }

    const updated = await saveExpenseCategory(input);
    dispatch({ type: "set_expense_categories", expenseCategories: updated });
    setMessage(`${input.label.trim()} category saved.`);
  }

  async function removeCategory(category: ExpenseCategory) {
    const updatedCategories = await deleteExpenseCategory(category.id);
    const updatedLimits = await deleteBudgetLimit(category.label);
    const updatedModes = await deleteCategoryMode(category.label);
    dispatch({ type: "set_expense_categories", expenseCategories: updatedCategories });
    dispatch({ type: "set_budget_limits", budgetLimits: updatedLimits });
    dispatch({ type: "set_category_modes", categoryModes: updatedModes });
    setMessage(`${category.label} category removed.`);
  }

  async function saveCategoryBudget(category: SpendingContext, amountTextValue: string, period: BudgetPeriod) {
    const limitAmount = parseAmountInput(amountTextValue);
    if (!limitAmount) {
      setMessage("Enter an amount to save this limit.");
      return;
    }

    const updated = await saveBudgetLimit({ category, limitAmount, period });
    dispatch({ type: "set_budget_limits", budgetLimits: updated });
    setMessage(`${category} limit saved for ${period === "weekly" ? "the week" : "the month"}.`);
  }

  async function removeCategoryBudget(category: SpendingContext) {
    const updated = await deleteBudgetLimit(category);
    dispatch({ type: "set_budget_limits", budgetLimits: updated });
    setMessage(`${category} limit removed.`);
  }

  async function changeCategoryMode(category: SpendingContext, mode: CategoryModeValue) {
    const updated = await saveCategoryMode(category, mode);
    dispatch({ type: "set_category_modes", categoryModes: updated });
    setMessage(`${category} marked as ${mode}.`);
  }

  async function savePlan(input: {
    fixedCosts: string;
    flexibleBudget: string;
    note: string;
    expectedIncome: string;
    savingsTarget: string;
  }) {
    const currentMonthKey = getMonthKey(new Date());
    const saved = await saveMonthlyPlan({
      expectedIncome: parseAmountInput(input.expectedIncome) ?? 0,
      fixedCosts: parseAmountInput(input.fixedCosts) ?? 0,
      flexibleBudget: parseAmountInput(input.flexibleBudget) ?? 0,
      month: currentMonthKey,
      note: input.note,
      savingsTarget: parseAmountInput(input.savingsTarget) ?? 0
    });
    dispatch({ type: "set_monthly_plan", monthlyPlan: saved });
    setMessage("Monthly plan saved.");
  }

  async function saveGoal(input: {
    id?: string;
    label: string;
    savedAmount: string;
    targetAmount: string;
  }) {
    const targetAmount = parseAmountInput(input.targetAmount);
    if (!input.label.trim() || !targetAmount) {
      setMessage("Add a goal name and target amount.");
      return;
    }

    const updated = await saveSavingsGoal({
      id: input.id,
      label: input.label,
      savedAmount: parseAmountInput(input.savedAmount) ?? 0,
      targetAmount
    });
    dispatch({ type: "set_savings_goals", savingsGoals: updated });
    setMessage("Savings goal saved.");
  }

  async function removeSavingsGoal(id: string) {
    const updated = await deleteSavingsGoal(id);
    dispatch({ type: "set_savings_goals", savingsGoals: updated });
    setMessage("Savings goal removed.");
  }

  async function saveBalance(input: { accountLabel: string; amount: string }) {
    const amount = parseAmountInput(input.amount);
    if (!input.accountLabel.trim() || !amount) {
      setMessage("Add an account name and balance amount.");
      return;
    }

    const updated = await saveBalanceSnapshot({
      amount,
      accountLabel: input.accountLabel
    });
    dispatch({ type: "set_balance_snapshots", balanceSnapshots: updated });
    setMessage("Balance snapshot saved.");
  }

  async function answerPattern(patternId: string, response: PatternFeedbackResponse) {
    const updated = await savePatternFeedback(patternId, response);
    dispatch({ type: "set_feedback", feedback: updated });
  }

  function clearAll() {
    setClearConfirmVisible(true);
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
    setMessage("Local finance memory cleared.");
  }

  return {
    answerPattern,
    boot,
    changeCategoryMode,
    clearAll,
    confirmClearAll,
    reload,
    removeAccount,
    removeCategory,
    removeCategoryBudget,
    removeManualTemplate,
    removeMoment,
    removeSavingsGoal,
    removeTransfer,
    saveAccount,
    saveAsTemplate,
    saveBalance,
    saveCategory,
    saveCategoryBudget,
    saveGoal,
    saveMoment,
    savePlan,
    setClearConfirmVisible,
    setMessage,
    updateMoment
  };
}