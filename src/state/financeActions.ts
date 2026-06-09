import { Share } from "react-native";
import { hapticSelection, hapticSuccess } from "../lib/haptics";
import { getCaptureValidationError, getShortcutValidationError } from "../features/capture/captureValidation";
import { CaptureFormValues } from "../features/capture/types";
import { getMemoryEditValidationError } from "../features/memory/memoryValidation";
import { getAccountValidationError } from "../features/budget/budgetValidation";
import { getImportJsonValidationError } from "../features/settings/dataValidation";
import { getBillValidationError, getCategoryValidationError } from "../features/settings/settingsValidation";
import { FormActionResult } from "../lib/formValidation";
import {
  EntryType,
  ExpenseCategory,
  MoneyAccount,
  PatternFeedbackResponse,
  SpendingContext
} from "../features/spendingMemory.types";

import {
  clearRecurringBills,
  deleteRecurringBill,
  listRecurringBills,
  saveRecurringBill
} from "../services/recurringBillsRepository";
import {
  getAccountDuplicateToast,
  getAccountKeepOneToast,

  getAccountRemovedToast,
  getAccountSavedToast,
  getBackupExportFailedToast,
  getBackupImportedToast,

  getBackupReadyToast,

  getBootFailedToast,
  getBillRemovedToast,
  getBillSavedToast,

  getCategoryDuplicateToast,
  getCategoryNeedNameToast,
  getCategoryRemovedToast,
  getCategorySavedToast,
  getClearAllToast,
  getExpenseSavedToast,

  getIncomeSavedToast,
  getMemoryNotFoundToast,
  getMemoryRemovedToast,
  getMemoryRestoredToast,
  getPatternFeedbackSavedToast,
  getMemoryUpdatedToast,
  getRefreshFailedToast,
  getResetFailedToast,
  getResetSuccessToast,
  getShortcutRemovedToast,
  getShortcutSavedToast,
  getCaptureNeedAmountToast,
  getCaptureNeedTransferAccountsToast,
  getTransferMovedToast,
  getTransferRemovedToast,
  getTransferUpdatedToast,
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
  saveMoneyTransfer,
  updateMoneyTransfer
} from "../services/accountRepository";
import {
  clearExpenseCategories,
  deleteExpenseCategory,
  listExpenseCategories,
  saveExpenseCategory
} from "../services/categoryRepository";
import { clearBalanceAnchor } from "../services/balanceAnchorRepository";
import {
  clearManualFinance,
  deleteManualTemplate,
  listManualTemplates,
  saveManualTemplate
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
  let reloadPromise: Promise<void> | null = null;

  async function performReload() {
    const [
      storedMoments,
      storedFeedback,
      storedManualTemplates,
      storedRecurringBills,
      storedAccounts,
      storedTransfers,
      storedExpenseCategories
    ] = await Promise.all([
      listSpendingMoments(),
      listPatternFeedback(),
      listManualTemplates(),
      listRecurringBills(),
      listMoneyAccounts(),
      listMoneyTransfers(),
      listExpenseCategories()
    ]);

    dispatch({
      type: "hydrate",
      payload: {
        moments: storedMoments,
        feedback: storedFeedback,
        manualTemplates: storedManualTemplates,
        recurringBills: storedRecurringBills,
        accounts: storedAccounts,
        transfers: storedTransfers,
        expenseCategories: storedExpenseCategories
      }
    });
  }

  async function reload() {
    if (reloadPromise) {
      return reloadPromise;
    }

    reloadPromise = performReload().finally(() => {
      reloadPromise = null;
    });

    return reloadPromise;
  }

  async function reloadOrNotify() {
    try {
      await reload();
    } catch {
      setMessage(getRefreshFailedToast());
    }
  }

  async function boot() {
    try {
      await runMigrations();
      await reload();
      dispatch({ type: "set_boot_error", error: null });
    } catch {
      dispatch({ type: "set_boot_error", error: getBootFailedToast() });
    } finally {
      dispatch({ type: "set_ready", ready: true });
    }
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
    const validationError = getCaptureValidationError(capture, categoryCount);
    if (validationError) {
      return { ok: false as const, validation: validationError };
    }

    const amount = parseAmountInput(capture.amountText);
    if (!amount) {
      return { ok: false as const };
    }

    if (capture.entryType === "transfer") {
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
    const validationError = getMemoryEditValidationError(input);
    if (validationError) {
      return { ok: false as const, validation: validationError };
    }

    const amount = parseAmountInput(input.amountText)!;

    const { data: updated, persisted, found } = await updateSpendingMoment(id, {
      amount,
      label: input.type === "expense" ? input.label : undefined,
      context: input.type === "expense" ? input.context : "Other",
      note: input.note,
      type: input.type,
      source: input.type === "income" ? input.source : undefined,
      accountLabel: input.accountLabel
    });
    if (!found) {
      return {
        ok: false as const,
        validation: { field: "amount" as const, message: getMemoryNotFoundToast() }
      };
    }
    if (!persisted) {
      return {
        ok: false as const,
        validation: { field: "amount" as const, message: getWriteFailureToast(STORAGE_KEYS.moments) }
      };
    }
    const moment = updated.find((item) => item.id === id);
    if (moment) {
      dispatch({ type: "replace_moment", moment });
    } else {
      dispatch({ type: "set_moments", moments: updated });
    }
    notifySuccess(getMemoryUpdatedToast());
    return { ok: true as const };
  }

  async function saveAsTemplate(capture: CaptureFormValues) {
    const validationError = getShortcutValidationError(capture);
    if (validationError) {
      return { ok: false as const, validation: validationError };
    }

    if (capture.entryType === "transfer") {
      return { ok: false as const };
    }

    const amount = parseAmountInput(capture.amountText);
    const templateLabel = capture.entryType === "income" ? capture.source.trim() : (capture.label.trim() || capture.context);

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
      return { ok: false as const };
    }
    dispatch({ type: "set_manual_templates", manualTemplates: updated });
    setMessage(getShortcutSavedToast(templateLabel));
    return { ok: true as const };
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

  async function updateTransfer(
    id: string,
    input: { amountText: string; fromAccount: string; note?: string; toAccount: string }
  ) {
    const amount = parseAmountInput(input.amountText);
    if (!amount) {
      return {
        ok: false as const,
        validation: { field: "amount" as const, message: getCaptureNeedAmountToast() }
      };
    }

    if (!input.fromAccount || !input.toAccount || input.fromAccount === input.toAccount) {
      return {
        ok: false as const,
        validation: { field: "transferAccounts" as const, message: getCaptureNeedTransferAccountsToast() }
      };
    }

    const { data: updated, persisted, found } = await updateMoneyTransfer(id, {
      amount,
      fromAccount: input.fromAccount,
      note: input.note,
      toAccount: input.toAccount
    });
    if (!found) {
      return {
        ok: false as const,
        validation: { field: "amount" as const, message: getMemoryNotFoundToast() }
      };
    }
    if (!persisted) {
      return {
        ok: false as const,
        validation: { field: "amount" as const, message: getWriteFailureToast(STORAGE_KEYS.transfers) }
      };
    }
    const transfer = updated.find((item) => item.id === id);
    if (transfer) {
      dispatch({ type: "set_transfers", transfers: updated });
    }
    notifySuccess(getTransferUpdatedToast());
    return { ok: true as const };
  }

  async function saveAccount(input: {
    id?: string;
    isIncomeHub: boolean;
    kind: MoneyAccount["kind"];
    label: string;
    openingBalance?: number;
    tier?: MoneyAccount["tier"];
  }): Promise<FormActionResult<"label">> {
    const validationError = getAccountValidationError(input.label);
    if (validationError) {
      return { ok: false, validation: validationError };
    }

    const { data: updated, persisted, reason } = await saveMoneyAccount(input);
    if (!persisted) {
      if (reason === "duplicate") {
        return { ok: false, validation: { field: "label", message: getAccountDuplicateToast() } };
      }
      notifyWriteFailure(STORAGE_KEYS.accounts);
      return { ok: false };
    }
    dispatch({ type: "set_accounts", accounts: updated });
    setMessage(getAccountSavedToast(input.label.trim()));
    return { ok: true };
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

  async function saveCategory(input: { id?: string; label: string }): Promise<FormActionResult<"label">> {
    const validationError = getCategoryValidationError(input.label);
    if (validationError) {
      return { ok: false, validation: validationError };
    }

    const { data: updated, persisted, reason } = await saveExpenseCategory(input);
    if (!persisted) {
      if (reason === "duplicate") {
        return { ok: false, validation: { field: "label", message: getCategoryDuplicateToast() } };
      }
      if (reason === "invalid") {
        return { ok: false, validation: { field: "label", message: getCategoryNeedNameToast() } };
      }
      notifyWriteFailure(STORAGE_KEYS.expenseCategories);
      return { ok: false };
    }
    dispatch({ type: "set_expense_categories", expenseCategories: updated });
    setMessage(getCategorySavedToast(input.label.trim()));
    return { ok: true };
  }

  async function removeCategory(category: ExpenseCategory) {
    const updatedCategories = await deleteExpenseCategory(category.id);
    if (!updatedCategories.persisted) {
      notifyWriteFailure(STORAGE_KEYS.expenseCategories);
      await reload();
      return;
    }

    dispatch({ type: "set_expense_categories", expenseCategories: updatedCategories.data });
    setMessage(getCategoryRemovedToast(category.label));
  }

  async function saveRecurringBillAction(input: {
    id?: string;
    label: string;
    amount: string;
    active: boolean;
    dueDay?: number | null;
  }): Promise<FormActionResult<"label" | "amount">> {
    const validationError = getBillValidationError(input);
    if (validationError) {
      return { ok: false, validation: validationError };
    }

    const amount = parseAmountInput(input.amount);
    if (!amount) {
      return { ok: false };
    }

    const { data: updated, persisted } = await saveRecurringBill({
      id: input.id,
      label: input.label,
      amount,
      active: input.active,
      dueDay: input.dueDay ?? null
    });
    if (!persisted) {
      notifyWriteFailure(STORAGE_KEYS.recurringBills);
      return { ok: false };
    }
    dispatch({ type: "set_recurring_bills", recurringBills: updated });
    notifySuccess(getBillSavedToast());
    return { ok: true };
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
      const skipWarning = formatSkippedExportWarning(skipped);
      const successMessage = getBackupReadyToast(skipWarning || undefined);

      try {
        await Share.share({
          message: JSON.stringify(backup, null, 2),
          title: getBackupShareTitle()
        });
      } catch {
        // Backup was created; a dismissed share sheet should not look like export failed.
      }

      setMessage(successMessage);
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

  async function importLocalBackup(jsonText: string): Promise<FormActionResult<"importJson">> {
    const validationError = getImportJsonValidationError(jsonText);
    if (validationError) {
      return { ok: false, validation: validationError };
    }

    const parsed = JSON.parse(jsonText) as unknown;
    const result = await importAllData(parsed);
    if (!result.ok) {
      return {
        ok: false,
        validation: {
          field: "importJson",
          message: getImportErrorToast(result.code, result.key)
        }
      };
    }

    dispatch({ type: "set_undo_toast", moment: null });
    await reload();
    hapticSuccess();
    setMessage(getBackupImportedToast());
    return { ok: true };
  }

  async function confirmClearAll() {
    const cleared = await Promise.all([
      clearSpendingMemory(),
      clearManualFinance(),
      clearBalanceAnchor(),
      clearRecurringBills(),
      clearAccountsAndTransfers(),
      clearExpenseCategories()
    ]);
    if (!cleared.every(Boolean)) {
      notifyWriteFailure(STORAGE_KEYS.moments);
      await reload();
      setClearConfirmVisible(false);
      return;
    }

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
    clearAll,
    clearUndoToast,
    confirmClearAll,
    exportLocalBackup,
    importLocalBackup,
    reload,
    reloadOrNotify,
    resetDamagedCollection,
    removeAccount,
    removeCategory,
    removeManualTemplate,
    removeMoment,
    undoRemoveMoment,
    removeRecurringBill,
    removeTransfer,
    updateTransfer,
    saveAccount,
    saveAsTemplate,
    saveCategory,
    saveRecurringBill: saveRecurringBillAction,
    saveMoment,
    setClearConfirmVisible,
    setMessage,
    updateMoment
  };
}