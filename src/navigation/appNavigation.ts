import { BudgetTabKey } from "../features/app.types";

export type AppTabKey = "home" | "overview" | "budget" | "patterns" | "settings";

export type AppNavigation = {
  openBudgetPlan: () => void;
  openCapture: () => void;
  openHome: () => void;
  openOverview: () => void;
  openSettings: () => void;
};

export type BudgetNavigationState = {
  activeTab: BudgetTabKey;
  setActiveTab: (tab: BudgetTabKey) => void;
};