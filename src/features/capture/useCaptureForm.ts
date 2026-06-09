import { useCallback, useEffect, useRef, useState } from "react";
import { hapticWarning } from "../../lib/haptics";
import { CaptureValidationError, CaptureFieldError } from "./captureValidation";
import { CaptureType } from "../app.types";
import {
  getDailyPocketLabel,
  getDefaultMomentAccount,
  getIncomeHubLabel,
  getTemplateLabel
} from "../../lib/analysis";
import { formatAmountInput, parseAmountInput } from "../../lib/formatMoney";
import { CaptureSaveAck } from "./captureSaveAck";
import { ManualTemplate, MoneyAccount, SpendingContext } from "../spendingMemory.types";
import { getTemplateReadyToast } from "../../i18n/toasts";
import { useActions, useFinanceDerived, useFinanceSelector } from "../../state/useFinance";
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
    occurredAtKey: null,
    source: "",
    toAccount: accountLabels.includes(dailyPocket) && dailyPocket !== incomeHub
      ? dailyPocket
      : accounts.find((account) => account.label !== incomeHub)?.label ?? dailyPocket
  };
}

export function useCaptureForm() {
  const actions = useActions();
  const categoryLabels = useFinanceDerived((derived) => derived.categoryLabels);
  const accounts = useFinanceSelector((state) => state.accounts);
  const lastExpenseContext = useFinanceSelector(
    (state) => state.moments.find((moment) => moment.type === "expense")?.context ?? "Other"
  );

  const [form, setForm] = useState<CaptureFormValues>(() => buildDefaultCapture([], "Other"));
  const [fieldError, setFieldError] = useState<CaptureValidationError | null>(null);
  const [shortcutFieldError, setShortcutFieldError] = useState<CaptureValidationError | null>(null);
  const bootstrappedRef = useRef(false);
  const lastAccountByTypeRef = useRef<{ expense?: string; income?: string }>({});

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

  const clearShortcutFieldError = useCallback((field?: CaptureFieldError) => {
    setShortcutFieldError((current) => {
      if (!current) {
        return current;
      }
      if (!field || current.field === field) {
        return null;
      }
      return current;
    });
  }, []);

  const changeAmountText = useCallback((value: string) => {
    clearFieldError("amount");
    setForm((current) => ({ ...current, amountText: formatAmountInput(value) }));
  }, [clearFieldError]);

  const changeEntryType = useCallback(
    (nextType: CaptureType) => {
      clearFieldError();
      clearShortcutFieldError();
      setForm((current) => {
        const accountLabels = accounts.map((account) => account.label);
        const incomeHub = getIncomeHubLabel(accounts);
        const dailyPocket = getDailyPocketLabel(accounts);

        if (nextType === "income") {
          const remembered = lastAccountByTypeRef.current.income;
          return {
            ...current,
            entryType: nextType,
            accountLabel: remembered && accountLabels.includes(remembered) ? remembered : incomeHub
          };
        }
        if (nextType === "expense") {
          const remembered = lastAccountByTypeRef.current.expense;
          return {
            ...current,
            entryType: nextType,
            accountLabel: remembered && accountLabels.includes(remembered) ? remembered : dailyPocket
          };
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
    [accounts, clearFieldError, clearShortcutFieldError]
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
        occurredAtKey: null,
        source: template.type === "income" ? template.source ?? "" : "",
        toAccount: form.toAccount
      });
      actions.setMessage(getTemplateReadyToast(getTemplateLabel(template)));
    },
    [accounts, actions, form.fromAccount, form.toAccount]
  );

  const resetAfterSave = useCallback(
    (expenseContext?: SpendingContext) => {
      const accountLabels = accounts.map((account) => account.label);
      const dailyPocket = getDailyPocketLabel(accounts);
      const remembered = lastAccountByTypeRef.current.expense;
      const accountLabel =
        remembered && accountLabels.includes(remembered) ? remembered : dailyPocket;
      setForm({
        accountLabel,
        amountText: "",
        context: expenseContext ?? form.context,
        entryType: "expense",
        fromAccount: form.fromAccount,
        label: "",
        note: "",
        occurredAtKey: null,
        source: "",
        toAccount: form.toAccount
      });
    },
    [accounts, form.context, form.fromAccount, form.toAccount]
  );

  const resetNoteOnly = useCallback(() => {
    setForm((current) => ({ ...current, note: "" }));
  }, []);

  const save = useCallback(async (): Promise<CaptureSaveAck | null> => {
    const amount = parseAmountInput(form.amountText);
    const ack: CaptureSaveAck = {
      amount: amount ?? 0,
      context: form.entryType === "expense" ? form.context : undefined,
      entryType: form.entryType,
      fromAccount: form.fromAccount,
      label: form.label,
      occurredAtKey: form.occurredAtKey,
      source: form.source,
      toAccount: form.toAccount
    };
    const result = await actions.saveMoment(form, categoryLabels.length);
    if (!result.ok) {
      hapticWarning();
      if ("validation" in result && result.validation) {
        setFieldError(result.validation);
      }
      return null;
    }
    setFieldError(null);

    if (form.entryType === "expense" || form.entryType === "income") {
      lastAccountByTypeRef.current[form.entryType] = form.accountLabel;
    }

    if (result.resetNote) {
      resetAfterSave(form.context);
      return ack;
    }

    resetAfterSave(result.expenseContext);
    return ack;
  }, [actions, categoryLabels.length, form, resetAfterSave]);

  const saveTemplate = useCallback(async () => {
    const result = await actions.saveAsTemplate(form);
    if (!result.ok) {
      hapticWarning();
      if (result.validation) {
        setShortcutFieldError(result.validation);
      }
      return false;
    }
    setShortcutFieldError(null);
    return true;
  }, [actions, form]);

  const patch = useCallback((patchValues: Partial<CaptureFormValues>) => {
    if ("accountLabel" in patchValues) {
      clearFieldError("momentAccount");
    }
    if ("fromAccount" in patchValues || "toAccount" in patchValues) {
      clearFieldError("transferAccounts");
    }
    if ("context" in patchValues) {
      clearFieldError("category");
    }
    if ("label" in patchValues) {
      clearShortcutFieldError("shortcutLabel");
    }
    if ("source" in patchValues) {
      clearShortcutFieldError("shortcutLabel");
    }
    if ("occurredAtKey" in patchValues) {
      clearFieldError("occurredAt");
    }
    setForm((current) => ({ ...current, ...patchValues }));
  }, [clearFieldError, clearShortcutFieldError]);

  return {
    fieldError,
    shortcutFieldError,
    form,
    patch,
    changeAmountText,
    changeEntryType,
    applyTemplate,
    save,
    saveTemplate,
    resetNoteOnly
  };
}