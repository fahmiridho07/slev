import {
  getAccountNeedNameToast,
  getBalanceNeedFieldsToast,
  getGoalNeedFieldsToast,
  getLimitNeedAmountToast,
  getPlanNeedFieldsToast
} from "../../i18n";
import { FormValidationError } from "../../lib/formValidation";
import { parseAmountInput } from "../../lib/formatMoney";

export type AccountFieldError = "label";

export function getAccountValidationError(label: string): FormValidationError<AccountFieldError> | null {
  if (!label.trim()) {
    return { field: "label", message: getAccountNeedNameToast() };
  }
  return null;
}

export type BalanceFieldError = "accountLabel" | "amount";

export function getBalanceSnapshotValidationError(input: {
  accountLabel: string;
  amount: string;
}): FormValidationError<BalanceFieldError> | null {
  const parsedAmount = parseAmountInput(input.amount);
  if (!input.accountLabel.trim() || !parsedAmount) {
    return {
      field: !input.accountLabel.trim() ? "accountLabel" : "amount",
      message: getBalanceNeedFieldsToast()
    };
  }
  return null;
}

export function getBalanceAnchorValidationError(
  amount: string
): FormValidationError<BalanceFieldError> | null {
  if (!parseAmountInput(amount)) {
    return { field: "amount", message: getBalanceNeedFieldsToast() };
  }
  return null;
}

export type GoalFieldError = "label" | "targetAmount";

export function getGoalValidationError(input: {
  label: string;
  targetAmount: string;
}): FormValidationError<GoalFieldError> | null {
  const parsedTarget = parseAmountInput(input.targetAmount);
  if (!input.label.trim() || !parsedTarget) {
    return {
      field: !input.label.trim() ? "label" : "targetAmount",
      message: getGoalNeedFieldsToast()
    };
  }
  return null;
}

export type PlanFieldError = "expectedIncome";

export function getPlanValidationError(input: {
  expectedIncome: string;
}): FormValidationError<PlanFieldError> | null {
  const parsedIncome = parseAmountInput(input.expectedIncome);
  if (!parsedIncome) {
    return { field: "expectedIncome", message: getPlanNeedFieldsToast() };
  }
  return null;
}

export type LimitFieldError = "amount";

export function getLimitValidationError(amountText: string): FormValidationError<LimitFieldError> | null {
  const limitAmount = parseAmountInput(amountText);
  if (!limitAmount) {
    return { field: "amount", message: getLimitNeedAmountToast() };
  }
  return null;
}