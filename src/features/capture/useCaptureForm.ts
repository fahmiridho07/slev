import { useCallback, useEffect, useState } from "react";
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
import { useActions, useDerived, useFinanceState } from "../../state/useFinance";
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
  const { accounts, moments } = useFinanceState();

  const lastExpenseContext = moments.find((moment) => moment.type === "expense")?.context ?? "Other";
  const [form, setForm] = useState<CaptureFormValues>(() =>
    buildDefaultCapture(accounts, lastExpenseContext)
  );

  useEffect(() => {
    const lastExpense = moments.find((moment) => moment.type === "expense");
    if (lastExpense) {
      setForm((current) => ({ ...current, context: lastExpense.context }));
    }
  }, [moments]);

  useEffect(() => {
    if (categoryLabels.length > 0 && !categoryLabels.includes(form.context)) {
      setForm((current) => ({
        ...current,
        context: categoryLabels.includes("Other") ? "Other" : categoryLabels[0]
      }));
    }
  }, [categoryLabels, form.context]);

  useEffect(() => {
    const accountLabels = accounts.map((account) => account.label);
    const incomeHub = getIncomeHubLabel(accounts);
    const dailyPocket = getDailyPocketLabel(accounts);

    setForm((current) => ({
      ...current,
      accountLabel: accountLabels.includes(current.accountLabel) ? current.accountLabel : dailyPocket,
      fromAccount: accountLabels.includes(current.fromAccount) ? current.fromAccount : incomeHub,
      toAccount:
        accountLabels.includes(current.toAccount) && current.toAccount !== incomeHub
          ? current.toAccount
          : dailyPocket === incomeHub
            ? accounts.find((account) => account.label !== incomeHub)?.label ?? dailyPocket
            : dailyPocket
    }));
  }, [accounts]);

  const changeAmountText = useCallback((value: string) => {
    setForm((current) => ({ ...current, amountText: formatAmountInput(value) }));
  }, []);

  const changeEntryType = useCallback(
    (nextType: CaptureType) => {
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
    [accounts]
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
      actions.setMessage(`${getTemplateLabel(template)} ready to save.`);
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
    if (!result.ok) return;

    if (result.resetNote) {
      setForm((current) => ({ ...current, amountText: "", note: "" }));
      return;
    }

    resetAfterSave(result.expenseContext);
  }, [actions, categoryLabels.length, form, resetAfterSave]);

  const saveTemplate = useCallback(async () => {
    await actions.saveAsTemplate(form);
  }, [actions, form]);

  const patch = useCallback((patchValues: Partial<CaptureFormValues>) => {
    setForm((current) => ({ ...current, ...patchValues }));
  }, []);

  return {
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