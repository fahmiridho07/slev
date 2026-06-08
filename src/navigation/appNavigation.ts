export type AppTabKey = "home" | "money" | "settings";

export type AppNavigation = {
  openCapture: () => void;
  openHome: () => void;
  openMoney: () => void;
  openSettings: () => void;
};