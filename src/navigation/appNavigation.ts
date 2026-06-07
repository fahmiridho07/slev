import { BudgetTabKey } from "../features/app.types";

export type AppTabKey = "home" | "memory" | "budget" | "patterns" | "settings";

export type AppNavigation = {
  openBudgetPlan: () => void;
  openHome: () => void;
  openMemory: () => void;
  openSettings: () => void;
};

export type BudgetNavigationState = {
  activeTab: BudgetTabKey;
  setActiveTab: (tab: BudgetTabKey) => void;
};