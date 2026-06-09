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
    reduceMotionLabel: string;
    reduceMotionOff: string;
    reduceMotionOn: string;
    reduceMotionSystem: string;
    system: string;
  };
  boot: {
    failed: string;
    loadingFinance: string;
    preparing: string;
  };
  brand: {
    settings: string;
    tagline: string;
  };
  activity: {
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
    searchA11y: string;
    searchNoResults: string;
    searchPlaceholder: string;
    sectionTitle: string;
  };
  analysis: {
    accounts: {
      unassigned: string;
    };
    trends: {
      midpointPace: string;
    };
  };
  budget: {
    balance: {
      accountKindCash: string;
      accountKindOther: string;
      accountKindWallet: string;
      accountKindBank: string;
      accountPlaceholder: string;
      addAccount: string;
      deleteAccountBody: string;
      deleteAccountTitle: string;
      editAccount: string;
      editAccountA11y: string;
      ephemeral: string;
      ephemeralHint: string;
      ephemeralPocketMeta: string;
      incomeHub: string;
      incomeHubMeta: string;
      openingBalance: string;
      openingBalanceHint: string;
      pocket: string;
      saveAccount: string;
      tracked: string;
      trackedTotal: string;
      yourAccounts: string;
    };
  };
  capture: {
    addNote: string;
    billsReservedHint: string;
    amountA11y: string;
    amountPlaceholder: string;
    currencyPrefix: string;
    applyShortcutA11y: string;
    context: string;
    contextHints: {
      Bills: string;
      Coffee: string;
      custom: string;
      Groceries: string;
      Home: string;
      Meal: string;
      Other: string;
      Transport: string;
      Treat: string;
    };
    contextLabels: {
      Bills: string;
      Coffee: string;
      Groceries: string;
      Home: string;
      Meal: string;
      Other: string;
      Transport: string;
      Treat: string;
    };
    from: string;
    income: string;
    kicker: string;
    labelPlaceholder: string;
    noCategories: string;
    notePlaceholder: string;
    openSettings: string;
    paidFrom: string;
    quickAdd: string;
    receivedIn: string;
    reorderHint: string;
    removeShortcutA11y: string;
    repeatA11y: string;
    saveAsShortcut: string;
    saveAsShortcutA11y: string;
    savedBannerExpense: string;
    savedBannerExpenseNamed: string;
    savedBannerIncome: string;
    savedBannerIncomeNamed: string;
    savedBannerTransfer: string;
    savedButton: string;
    saveExpense: string;
    saveIncome: string;
    saveTransfer: string;
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
    closeSheet: string;
    delete: string;
    done: string;
    edit: string;
    expense: string;
    gotIt: string;
    import: string;
    income: string;
    openSettings: string;
    progressA11y: string;
    pullToRefresh: string;
    undo: string;
    paused: string;
    reset: string;
    save: string;
    selectAccount: string;
    swipeOrLongPressDelete: string;
    swipeToDelete: string;
  };
  dialogs: {
    categoryDeleteCustom: string;
    categoryDeleteDefault: string;
    categoryDeleteDefaultTitle: string;
    categoryDeleteTitle: string;
    clearAllBody: string;
    clearAllConfirm: string;
    clearAllTitle: string;
    activityDeleteBody: string;
    activityDeleteTitle: string;
  };
  home: {
    safeToSpend: {
      affordableUntilMonthEnd: string;
      affordableUntilPayday: string;
      billsExceedBalance: string;
      billsReserve: string;
      spendBuffer: string;
      checkPurchase: string;
      checkPurchaseA11y: string;
      compactBillsReserve: string;
      compactTypicalDaily: string;
      daysLeftChip: string;
      heroLabel: string;
      cannotAfford: string;
      paceEven: string;
      paceOver: string;
      paceUnder: string;
      paceUnknown: string;
      paydayHint: string;
      paydayHintAction: string;
      paydayHintA11y: string;
      safeDailyTile: string;
      spendableTile: string;
      dipsReserve: string;
      overPace: string;
      purchaseHint: string;
      purchasePlaceholder: string;
      sheetContext: string;
      sheetTitle: string;
      typicalDaily: string;
      typicalDailyUncertain: string;
    };
  };
  listHints: Record<ListActionsHintKey, ListHintCopy>;
  locale: {
    english: string;
    indonesian: string;
    label: string;
  };
  memory: {
    groups: {
      earlier: string;
      thisWeek: string;
      today: string;
      yesterday: string;
    };
    momentTitle: {
      income: string;
    };
    repeatHint: string;
  };
  patterns: {
    breakdown: {
      amountShare: string;
      expense: string;
      expenseEmpty: string;
      income: string;
      incomeByAccount: string;
      incomeEmpty: string;
      nextMonthA11y: string;
      previousMonthA11y: string;
      spendingByCategory: string;
      viewAll: string;
      viewLess: string;
      categoryDeltaDown: string;
      categoryDeltaUp: string;
      categoryNewThisMonth: string;
      drilldownEmpty: string;
      drilldownSummary: string;
      drilldownTitle: string;
      vsLastMonthDown: string;
      vsLastMonthFlat: string;
      vsLastMonthUp: string;
      topIncreaseAmount: string;
      topIncreasesTitle: string;
      viewEntriesA11y: string;
    };
    cashflow: {
      empty: string;
      expense: string;
      income: string;
      net: string;
      netLabel: string;
      netThisMonth: string;
    };
    chart: {
      a11ySummary: string;
      legendValue: string;
      title: string;
      titleMonth: string;
      totalAcross: string;
    };
    generated: {
      contextMoreVisibleDetailNoPrevious: string;
      contextMoreVisibleDetailWithPrevious: string;
      contextMoreVisibleRecap: string;
      contextMoreVisibleTitle: string;
      contextQuieterDetail: string;
      contextQuieterTitle: string;
      memoryBuildingDetail: string;
      memoryBuildingTitle: string;
      newRepeatDetail: string;
      newRepeatRecap: string;
      newRepeatTitle: string;
      quietStartDetail: string;
      quietStartTitle: string;
      smallSpendsDetail: string;
      smallSpendsRecap: string;
      smallSpendsTitle: string;
      steadyRhythmDetail: string;
      steadyRhythmRecap: string;
      steadyRhythmTitle: string;
      weekendShapeDetail: string;
      weekendShapeRecap: string;
      weekendShapeTitle: string;
    };
    groups: {
      repeatedLately: string;
      smallSpends: string;
      standsOut: string;
      weekendShape: string;
    };
    hero: {
      accountsHintNoTrend: string;
      accountsHintWithTrend: string;
      accountsKicker: string;
      breakdownHint: string;
      breakdownHintMonth: string;
      breakdownKicker: string;
      breakdownKickerMonth: string;
      recapHintEmpty: string;
      recapHintWithPatterns: string;
      recapKicker: string;
      recapValue: string;
    };
    recap: {
      expensesProgress: string;
      feedbackKeep: string;
      feedbackLessOften: string;
      feedbackLockedHint: string;
      feedbackSaved: string;
      feedbackNotSure: string;
    };
    recapEmpty: string;
    recapEmptyAction: string;
    tabs: {
      accounts: string;
      recap: string;
      spending: string;
    };
    tracker: {
      cashflow: string;
      cashflowEarlyBuilding: string;
      cashflowEarlyNew: string;
      cashflowEmptyMonth: string;
      expenseEarlyBuilding: string;
      expenseEarlyNew: string;
      expenseEmptyMonth: string;
      incomeEarlyBuilding: string;
      incomeEarlyNew: string;
      incomeEmptyMonth: string;
    };
    trends: {
      advancedTrends: string;
      collapseAdvancedTrends: string;
      currentPaceTitle: string;
      empty: string;
      expandAdvancedTrends: string;
      hideFullCashflow: string;
      showFullCashflow: string;
      spendingTrend: string;
      weeklyCashflow: string;
    };
  };
  settings: {
    bills: {
      active: string;
      add: string;
      amount: string;
      amountA11y: string;
      dayPlaceholder: string;
      dueDayMeta: string;
      deleteBody: string;
      deleteTitle: string;
      edit: string;
      editA11y: string;
      empty: string;
      intro: string;
      nameA11y: string;
      namePlaceholder: string;
      paused: string;
      save: string;
      title: string;
    };
    accountsTab: string;
    appearanceTab: string;
    billsTab: string;
    categories: {
      add: string;
      custom: string;
      default: string;
      edit: string;
      editA11y: string;
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
      importChooseFile: string;
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
    payday: {
      a11y: string;
      helper: string;
      label: string;
      placeholder: string;
    };
    buffer: {
      a11y: string;
      helper: string;
      label: string;
      placeholder: string;
    };
  };
  storage: {
    collections: Record<string, string>;
    exportSkippedMany: string;
    exportSkippedOne: string;
    writeFailureCorrupt: string;
    writeFailureGeneric: string;
  };
  tabs: {
    budget: string;
    home: string;
    money: string;
  };
  toasts: {
    account: {
      duplicate: string;
      keepOne: string;
      needName: string;
      removed: string;
      saved: string;
    };
    backup: {
      emptyBackup: string;
      exportFailed: string;
      imported: string;
      invalidBackup: string;
      invalidCollection: string;
      invalidJson: string;
      normalizeFailed: string;
      ready: string;
      restoreFailed: string;
      shareTitle: string;
    };
    balance: {
      needFields: string;
      saved: string;
    };
    bill: {
      needFields: string;
      removed: string;
      saved: string;
    };
    capture: {
      expenseSaved: string;
      expenseSavedFor: string;
      incomeSaved: string;
      incomeSavedFrom: string;
      needAmount: string;
      needAccount: string;
      needCategory: string;
      needTransferAccounts: string;
      templateReady: string;
      transferMoved: string;
    };
    category: {
      duplicate: string;
      needName: string;
      removed: string;
      saved: string;
    };
    clear: {
      cleared: string;
    };
    default: string;
    boot: {
      failed: string;
    };
    memory: {
      needAmount: string;
      notFound: string;
      removed: string;
      restored: string;
      updated: string;
    };
    refresh: {
      failed: string;
    };
    reset: {
      failed: string;
      success: string;
    };
    shortcut: {
      needLabel: string;
      removed: string;
      saved: string;
      transferUseChips: string;
    };
    transfer: {
      removed: string;
    };
    writeFailure: {
      corrupt: string;
      generic: string;
    };
  };
};

export type AppStringsExtras = Pick<
  AppStrings,
  "analysis" | "storage" | "toasts"
> & {
  budget: Pick<AppStrings["budget"], "balance">;
  memory: Pick<AppStrings["memory"], "groups" | "momentTitle" | "repeatHint">;
  patterns: Pick<
    AppStrings["patterns"],
    | "breakdown"
    | "cashflow"
    | "chart"
    | "generated"
    | "groups"
    | "recapEmpty"
    | "trends"
  >;
};