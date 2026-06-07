import type { ListActionsHintKey } from "../services/uiPreferences";

export type Locale = "en" | "id";

export type ListHintCopy = {
  body: string;
  title: string;
};

export type AppStrings = {
  appearance: {
    dark: string;
    label: string;
    light: string;
    system: string;
  };
  boot: {
    preparing: string;
  };
  brand: {
    settings: string;
    tagline: string;
  };
  capture: {
    fabLabel: string;
    sheetTitle: string;
  };
  common: {
    back: string;
    cancel: string;
    delete: string;
    gotIt: string;
    openSettings: string;
  };
  listHints: Record<ListActionsHintKey, ListHintCopy>;
  locale: {
    english: string;
    indonesian: string;
    label: string;
  };
  settings: {
    dataTab: string;
    billsTab: string;
    categoriesTab: string;
  };
  tabs: {
    analysis: string;
    budget: string;
    home: string;
    memory: string;
  };
};