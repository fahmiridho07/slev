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
  budget: {
    hero: {
      balanceHint: string;
      balanceKicker: string;
      flexibleRemaining: string;
      flexibleSpent: string;
      goalsEmptyHint: string;
      goalsEmptyKicker: string;
      goalsHint: string;
      goalsKicker: string;
      noPlanAction: string;
      noPlanHint: string;
      noPlanKicker: string;
    };
    plan: {
      allocationDetails: string;
      categoryLimitsOptional: string;
    };
    tabs: {
      balance: string;
      goals: string;
      plan: string;
    };
  };
  capture: {
    addNote: string;
    amountA11y: string;
    context: string;
    fabLabel: string;
    fewerOptions: string;
    from: string;
    income: string;
    kicker: string;
    labelPlaceholder: string;
    moreOptions: string;
    noCategories: string;
    notePlaceholder: string;
    openSettings: string;
    paidFrom: string;
    quickAdd: string;
    receivedIn: string;
    saveAsShortcut: string;
    saveAsShortcutA11y: string;
    saveExpense: string;
    saveIncome: string;
    saveTransfer: string;
    sheetTitle: string;
    sourcePlaceholder: string;
    to: string;
    type: {
      copy: string;
      expenseHint: string;
      expenseLabel: string;
      incomeHint: string;
      incomeLabel: string;
      lead: string;
      transferHint: string;
      transferLabel: string;
    };
  };
  common: {
    account: string;
    active: string;
    amount: string;
    back: string;
    cancel: string;
    clear: string;
    delete: string;
    expense: string;
    gotIt: string;
    import: string;
    income: string;
    openSettings: string;
    paused: string;
    reset: string;
    save: string;
  };
  dialogs: {
    categoryDeleteCustom: string;
    categoryDeleteDefault: string;
    categoryDeleteDefaultTitle: string;
    categoryDeleteTitle: string;
    clearAllBody: string;
    clearAllConfirm: string;
    clearAllTitle: string;
    memoryDeleteBody: string;
    memoryDeleteTitle: string;
  };
  home: {
    bills: {
      comingUp: string;
      dueInDays: string;
      dueToday: string;
      dueTomorrow: string;
      empty: string;
      horizonTotal: string;
      logPayment: string;
    };
    pulse: {
      estBalance: string;
      monthlySavingsTarget: string;
      netLeft: string;
      runwayHint: string;
      runwayMonths: string;
      safeToSpendToday: string;
      savedTowardGoals: string;
      setMonthlyPlan: string;
      setMonthlyPlanA11y: string;
      setMonthlyPlanHint: string;
      spending: string;
    };
  };
  listHints: Record<ListActionsHintKey, ListHintCopy>;
  locale: {
    english: string;
    indonesian: string;
    label: string;
  };
  memory: {
    deleteTitle: string;
    edit: {
      amount: string;
      label: string;
      note: string;
      paidFrom: string;
      receivedIn: string;
      save: string;
      source: string;
    };
    editSheetTitle: string;
    editSheetTitleNamed: string;
    emptyAction: string;
    emptyText: string;
    heroHintEmpty: string;
    heroHintWithCount: string;
    heroKicker: string;
    searchNoResults: string;
    searchPlaceholder: string;
    searchA11y: string;
  };
  patterns: {
    hero: {
      accountsHintNoTrend: string;
      accountsHintWithTrend: string;
      accountsKicker: string;
      breakdownHint: string;
      breakdownKicker: string;
      recapHintEmpty: string;
      recapHintWithPatterns: string;
      recapKicker: string;
      recapValue: string;
    };
    recap: {
      feedbackKeep: string;
      feedbackLessOften: string;
      feedbackNotSure: string;
    };
    tabs: {
      accounts: string;
      recap: string;
      spending: string;
    };
  };
  settings: {
    bills: {
      active: string;
      add: string;
      amount: string;
      amountA11y: string;
      dayPlaceholder: string;
      deleteBody: string;
      deleteTitle: string;
      edit: string;
      editA11y: string;
      empty: string;
      intro: string;
      nameA11y: string;
      namePlaceholder: string;
      paused: string;
      rowMeta: string;
      save: string;
      title: string;
    };
    billsTab: string;
    categories: {
      add: string;
      custom: string;
      default: string;
      edit: string;
      empty: string;
      nameA11y: string;
      placeholder: string;
      save: string;
    };
    data: {
      backupCopy: string;
      backupTitle: string;
      clearAll: string;
      export: string;
      healthCopy: string;
      healthTitle: string;
      import: string;
      importA11y: string;
      importPlaceholder: string;
      resetBody: string;
      resetConfirm: string;
      resetThis: string;
      resetTitle: string;
      resetTitleFallback: string;
    };
    dataTab: string;
    categoriesTab: string;
    heroHint: string;
    heroKicker: string;
    heroValue: string;
    importBody: string;
    importConfirm: string;
    importTitle: string;
  };
  tabs: {
    analysis: string;
    budget: string;
    home: string;
    memory: string;
  };
};