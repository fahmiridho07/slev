import { BudgetTabKey } from "../features/app.types";

export type AppTabKey = "home" | "money" | "budget" | "settings";

export type AppNavigation = {
  openBudgetPlan: () => void;
  openCapture: () => void;
  openHome: () => void;
  openMoney: () => void;
  openSettings: () => void;
};

export type BudgetNavigationState = {
  activeTab: BudgetTabKey;
  setActiveTab: (tab: BudgetTabKey) => void;
};