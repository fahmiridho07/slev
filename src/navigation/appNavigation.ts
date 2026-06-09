import { SettingsTabKey } from "../features/app.types";

export type AppTabKey = "home" | "money" | "settings";

export type AppNavigation = {
  openCapture: () => void;
  openHome: () => void;
  openMoney: () => void;
  openSettings: (tab?: SettingsTabKey) => void;
};