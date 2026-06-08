import { PatternTabKey, SettingsTabKey } from "../features/app.types";
import { AppTabKey } from "../navigation/appNavigation";
import { parsePatternTab, parseSettingsTab } from "../services/uiPreferences";
import type { FinanceState } from "../state/financeReducer";

export type PlanningDataState = Pick<
  FinanceState,
  | "balanceSnapshots"
  | "budgetLimits"
  | "monthlyPlan"
  | "recurringBills"
  | "savingsGoals"
  | "transfers"
>;

export function hasExistingPlanningData(state: PlanningDataState): boolean {
  return (
    state.monthlyPlan != null ||
    state.budgetLimits.length > 0 ||
    state.savingsGoals.length > 0 ||
    state.recurringBills.length > 0 ||
    state.balanceSnapshots.length > 0 ||
    state.transfers.length > 0
  );
}

export function clampActiveTabForPlanning(tab: AppTabKey, planningEnabled: boolean): AppTabKey {
  if (!planningEnabled && tab === "budget") {
    return "home";
  }
  return tab;
}

export function clampPatternTabForPlanning(
  tab: PatternTabKey | undefined,
  planningEnabled: boolean
): PatternTabKey {
  const parsed = parsePatternTab(tab ?? "breakdown");
  if (!planningEnabled && parsed === "accounts") {
    return "breakdown";
  }
  return parsed;
}

export function clampSettingsTabForPlanning(
  tab: SettingsTabKey | undefined,
  planningEnabled: boolean
): SettingsTabKey {
  const parsed = parseSettingsTab(tab ?? (planningEnabled ? "bills" : "categories"));
  if (!planningEnabled && parsed === "bills") {
    return "categories";
  }
  return parsed;
}