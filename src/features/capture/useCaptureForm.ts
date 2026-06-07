import { useCallback, useEffect, useRef, useState } from "react";
import { hapticWarning } from "../../lib/haptics";
import { CaptureValidationError } from "./captureValidation";
import { CaptureType } from "../app.types";
import {
  getDailyPocketLabel,
  getDefaultMomentAccount,
  getIncomeHubLabel,
  getTemplateLabel,
  RepeatSuggestion
} from "../../lib/analysis";
import { formatAmountInput } from "../../lib/formatMoney";
import { ManualTemplate, MoneyAccount, SpendingContext } from "../spendingMemory.types";
import { getTemplateReadyToast } from "../../i18n/toasts";
import { useActions, useDerived, useFinanceSelector } from "../../state/useFinance";
import { CaptureFormValues } from "./types";

function buildDefaultCapture(accounts: MoneyAccount[], context: SpendingContext): CaptureFormValues {
  const accountLabels = accounts.map((account) => account.label);
  const incomeHub = getIncomeHubLabel(accounts);
  const dailyPocket = getDailyPocketLabel(accounts);

  return {
    accountLabel: accountLabels.includes(dailyPocket) ? dailyPocket : accountLabels[0] ?? "Jago",
    amountText: "",
    context,
    entryType: "expense",
    fromAccount: accountLabels.includes(incomeHub) ? incomeHub : accountLabels[0] ?? "BRI",
    label: "",
    note: "",
    source: "",
    toAccount: accountLabels.includes(dailyPocket) && dailyPocket !== incomeHub
      ? dailyPocket
      : accounts.find((account) => account.label !== incomeHub)?.label ?? dailyPocket
  };
}

export function useCaptureForm() {
  const actions = useActions();
  const { categoryLabels } = useDerived();
  const accounts = useFinanceSelector((state) => state.accounts);
  const lastExpenseContext = useFinanceSelector(
    (state) => state.moments.find((moment) => moment.type === "expense")?.context ?? "Other"
  );

  const [form, setForm] = useState<CaptureFormValues>(() => buildDefaultCapture([], "Other"));
  const [fieldError, setFieldError] = useState<CaptureValidationError | null>(null);
  const bootstrappedRef = useRef(false);

  const clearFieldError = useCallback((field?: CaptureValidationError["field"]) => {
    setFieldError((current) => {
      if (!current) {
        return current;
      }
      if (!field || current.field === field) {
        return null;
      }
      return current;
    });
  }, []);

  useEffect(() => {
    if (bootstrappedRef.current || accounts.length === 0) {
      return;
    }

    setForm((current) => {
      const hasDraft = Boolean(
        current.amountText.trim()
        || current.label.trim()
        || current.note.trim()
        || current.source.trim()
      );
      bootstrappedRef.current = true;

      if (hasDraft) {
        return current;
      }

      const context = categoryLabels.includes(lastExpenseContext)
        ? lastExpenseContext
        : categoryLabels.includes("Other")
          ? "Other"
          : categoryLabels[0] ?? "Other";

      return buildDefaultCapture(accounts, context);
    });
  }, [accounts, categoryLabels, lastExpenseContext]);

  useEffect(() => {
    if (categoryLabels.length === 0) {
      return;
    }

    setForm((current) => {
      if (categoryLabels.includes(current.context)) {
        return current;
      }

      return {
        ...current,
        context: categoryLabels.includes("Other") ? "Other" : categoryLabels[0]
      };
    });
  }, [categoryLabels]);

  useEffect(() => {
    if (accounts.length === 0) {
      return;
    }

    const accountLabels = accounts.map((account) => account.label);
    const incomeHub = getIncomeHubLabel(accounts);
    const dailyPocket = getDailyPocketLabel(accounts);
    const fallbackToAccount =
      dailyPocket === incomeHub
        ? accounts.find((account) => account.label !== incomeHub)?.label ?? dailyPocket
        : dailyPocket;

    setForm((current) => {
      const nextAccountLabel = accountLabels.includes(current.accountLabel) ? current.accountLabel : dailyPocket;
      const nextFromAccount = accountLabels.includes(current.fromAccount) ? current.fromAccount : incomeHub;
      const nextToAccount =
        accountLabels.includes(current.toAccount) && current.toAccount !== incomeHub
          ? current.toAccount
          : fallbackToAccount;

      if (
        nextAccountLabel === current.accountLabel
        && nextFromAccount === current.fromAccount
        && nextToAccount === current.toAccount
      ) {
        return current;
      }

      return {
        ...current,
        accountLabel: nextAccountLabel,
        fromAccount: nextFromAccount,
        toAccount: nextToAccount
      };
    });
  }, [accounts]);

  const changeAmountText = useCallback((value: string) => {
    clearFieldError("amount");
    setForm((current) => ({ ...current, amountText: formatAmountInput(value) }));
  }, [clearFieldError]);

  const changeEntryType = useCallback(
    (nextType: CaptureType) => {
      clearFieldError();
      setForm((current) => {
        const incomeHub = getIncomeHubLabel(accounts);
        const dailyPocket = getDailyPocketLabel(accounts);

        if (nextType === "income") {
          return { ...current, entryType: nextType, accountLabel: incomeHub };
        }
        if (nextType === "expense") {
          return { ...current, entryType: nextType, accountLabel: dailyPocket };
        }
        return {
          ...current,
          entryType: nextType,
          fromAccount: incomeHub,
          toAccount:
            dailyPocket === incomeHub
              ? accounts.find((account) => account.label !== incomeHub)?.label ?? dailyPocket
              : dailyPocket
        };
      });
    },
    [accounts, clearFieldError]
  );

  const applyRepeat = useCallback(
    (suggestion: RepeatSuggestion) => {
      setForm((current) => ({
        ...current,
        entryType: "expense",
        label: suggestion.label,
        context: suggestion.context,
        accountLabel: suggestion.accountLabel ?? getDailyPocketLabel(accounts),
        amountText: current.amountText.trim() ? current.amountText : formatAmountInput(String(suggestion.amount))
      }));
    },
    [accounts]
  );

  const applyTemplate = useCallback(
    (template: ManualTemplate) => {
      setForm({
        accountLabel: template.accountLabel ?? getDefaultMomentAccount(template.type, accounts),
        amountText: template.amount > 0 ? formatAmountInput(String(template.amount)) : "",
        context: template.context,
        entryType: template.type,
        fromAccount: form.fromAccount,
        label: template.type === "expense" ? template.label ?? "" : "",
        note: template.note ?? "",
        source: template.type === "income" ? template.source ?? "" : "",
        toAccount: form.toAccount
      });
      actions.setMessage(getTemplateReadyToast(getTemplateLabel(template)));
    },
    [accounts, actions, form.fromAccount, form.toAccount]
  );

  const resetAfterSave = useCallback(
    (expenseContext?: SpendingContext) => {
      const dailyPocket = getDailyPocketLabel(accounts);
      setForm({
        accountLabel: dailyPocket,
        amountText: "",
        context: expenseContext ?? form.context,
        entryType: "expense",
        fromAccount: form.fromAccount,
        label: "",
        note: "",
        source: "",
        toAccount: form.toAccount
      });
    },
    [accounts, form.context, form.fromAccount, form.toAccount]
  );

  const resetNoteOnly = useCallback(() => {
    setForm((current) => ({ ...current, note: "" }));
  }, []);

  const save = useCallback(async () => {
    const result = await actions.saveMoment(form, categoryLabels.length);
    if (!result.ok) {
      hapticWarning();
      if ("validation" in result && result.validation) {
        setFieldError(result.validation);
      }
      return false;
    }
    setFieldError(null);

    if (result.resetNote) {
      resetAfterSave(form.context);
      return true;
    }

    resetAfterSave(result.expenseContext);
    return true;
  }, [actions, categoryLabels.length, form, resetAfterSave]);

  const saveTemplate = useCallback(async () => {
    await actions.saveAsTemplate(form);
  }, [actions, form]);

  const patch = useCallback((patchValues: Partial<CaptureFormValues>) => {
    if ("fromAccount" in patchValues || "toAccount" in patchValues) {
      clearFieldError("transferAccounts");
    }
    if ("context" in patchValues) {
      clearFieldError("category");
    }
    setForm((current) => ({ ...current, ...patchValues }));
  }, [clearFieldError]);

  return {
    fieldError,
    form,
    patch,
    changeAmountText,
    changeEntryType,
    applyRepeat,
    applyTemplate,
    save,
    saveTemplate,
    resetNoteOnly
  };
}