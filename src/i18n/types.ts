import type { ListActionsHintKey } from "../services/uiPreferences";

export type Locale = "en" | "id";

export type ListHintCopy = {
  body: string;
  title: string;
};

export type AppStrings = {
  appearance: {
    captureCompact: string;
    captureExpanded: string;
    capturePanelLabel: string;
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
    preparing: string;
  };
  brand: {
    settings: string;
    tagline: string;
  };
  analysis: {
    accounts: {
      unassigned: string;
    };
    allocation: {
      action: {
        flexibleOverPlan: { detail: string; title: string };
        hold: { detail: string; title: string };
        planExceedsIncome: { detail: string; title: string };
        setPlan: { detail: string; title: string };
        snapshotBalances: { detail: string; title: string };
        topUpPockets: { detail: string; title: string };
      };
      row: {
        fixedAbovePlan: string;
        fixedNoPlan: string;
        fixedRemaining: string;
        fixedTitle: string;
        flexibleAbovePlan: string;
        flexibleNoPlan: string;
        flexibleRemaining: string;
        flexibleTitle: string;
        incomeAbovePlan: string;
        incomeNoPlan: string;
        incomeRemaining: string;
        incomeTitle: string;
        savingsAboveTarget: string;
        savingsNoPlan: string;
        savingsStillNeeded: string;
        savingsTitle: string;
      };
    };
    reconciliation: {
      detail: {
        higherThanExpected: string;
        lowerThanExpected: string;
        movement: string;
        needsHistory: string;
        noSnapshot: string;
      };
      status: {
        matched: string;
        needsHistory: string;
        noSnapshot: string;
      };
      summary: {
        matched: { detail: string; title: string };
        needsHistory: { detail: string; title: string };
        needsReview: { detail: string; title: string };
        noSnapshot: { detail: string; title: string };
        smallGap: { detail: string; title: string };
      };
    };
    trends: {
      midpointPace: string;
    };
  };
  budget: {
    allocation: {
      againstTarget: string;
      dailyRoom: string;
      dayCoverage: string;
      estimatedFromLogs: string;
      flexibleUntilMonthEnd: string;
      income: string;
      monthlyAllocation: string;
      netLeft: string;
      ofPlanned: string;
      openBalance: string;
      pocketCash: string;
      setPlanEmpty: string;
    };
    balance: {
      accountKindCash: string;
      accountKindOther: string;
      accountKindWallet: string;
      accountKindBank: string;
      accountPlaceholder: string;
      addAccount: string;
      balanceSnapshot: string;
      currentAccountBalances: string;
      currentBalancePlaceholder: string;
      deleteAccountBody: string;
      deleteAccountTitle: string;
      driftCopy: string;
      driftRow: string;
      editAccount: string;
      editAccountA11y: string;
      emptyAccounts: string;
      ephemeral: string;
      ephemeralHint: string;
      ephemeralPocketMeta: string;
      estimatedCurrentBalance: string;
      estimatedCurrentBalanceCopy: string;
      estimatedFromSnapshot: string;
      incomeHub: string;
      incomeHubMeta: string;
      manualSnapshotBase: string;
      manualSnapshotCopy: string;
      noActivity: string;
      pocket: string;
      saveAccount: string;
      saveSnapshot: string;
      saveSnapshotA11y: string;
      tracked: string;
      trackedEphemeralCopy: string;
      worthQuickLook: string;
      yourAccounts: string;
    };
    goals: {
      deleteGoalBody: string;
      deleteGoalTitle: string;
      editGoal: string;
      editGoalA11y: string;
      emptyGoals: string;
      goalNameA11y: string;
      goalNamePlaceholder: string;
      newGoal: string;
      savedSoFarA11y: string;
      savedSoFarPlaceholder: string;
      targetAmountA11y: string;
      targetAmountPlaceholder: string;
    };
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
    limits: {
      deleteLimit: string;
      editLimitA11y: string;
      emptyNoCategories: string;
      fixed: string;
      flexible: string;
      limitAmountA11y: string;
      limitAmountPlaceholder: string;
      monthly: string;
      noLimitSpent: string;
      openSettings: string;
      setLimit: string;
      spentOfLimit: string;
      weekly: string;
    };
    monthlyPlan: {
      expectedIncome: string;
      fixedCosts: string;
      flexibleBudget: string;
      flexibleRemaining: string;
      notePlaceholder: string;
      overIncomeBy: string;
      savePlan: string;
      savingsTarget: string;
      stepFixedCopy: string;
      stepIncomeCopy: string;
      stepSavingsCopy: string;
      title: string;
      useLoggedIncome: string;
      wizardBack: string;
      wizardFinish: string;
      wizardNext: string;
      wizardStep: string;
      wizardTitle: string;
    };
    plan: {
      allocationDetails: string;
      categoryLimitsOptional: string;
      collapseAllocationA11y: string;
      collapseLimitsA11y: string;
      expandAllocationA11y: string;
      expandLimitsA11y: string;
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
    removeShortcutA11y: string;
    repeatA11y: string;
    saveAsShortcut: string;
    saveAsShortcutA11y: string;
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
    expense: string;
    gotIt: string;
    import: string;
    income: string;
    openSettings: string;
    pullToRefresh: string;
    undo: string;
    paused: string;
    reset: string;
    save: string;
    selectAccount: string;
    swipeOrLongPressDelete: string;
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
      logPaymentA11y: string;
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
    groups: {
      earlier: string;
      thisWeek: string;
      today: string;
      yesterday: string;
    };
    heroHintEmpty: string;
    heroHintWithCount: string;
    heroKicker: string;
    momentTitle: {
      income: string;
    };
    repeatHint: string;
    searchNoResults: string;
    searchPlaceholder: string;
    searchA11y: string;
  };
  patterns: {
    accounts: {
      balanceReconciliation: string;
      deleteTransferA11y: string;
      deleteTransferBody: string;
      deleteTransferTitle: string;
      expectedActual: string;
      hubAndPockets: string;
      hubPocketsCopy: string;
      incomeNetCopy: string;
      mostActivePocket: string;
      accountMovement: string;
      recentTransfers: string;
      reconciliationEmpty: string;
      spendingByAccountEmpty: string;
      topSpendingCopy: string;
    };
    breakdown: {
      amountShare: string;
      expense: string;
      expenseEmpty: string;
      income: string;
      incomeBySource: string;
      incomeEmpty: string;
      spendingByCategory: string;
    };
    cashflow: {
      empty: string;
      expense: string;
      income: string;
      net: string;
    };
    chart: {
      a11ySummary: string;
      legendValue: string;
      title: string;
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
      breakdownKicker: string;
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
      feedbackNotSure: string;
    };
    recapEmpty: string;
    tabs: {
      accounts: string;
      recap: string;
      spending: string;
    };
    trends: {
      currentPaceTitle: string;
      empty: string;
      netWorthTrend: string;
      snapshotForNetWorth: string;
      spendingTrend: string;
      topCategoriesEmpty: string;
      topCategoriesTitle: string;
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
  storage: {
    collections: Record<string, string>;
    exportSkippedMany: string;
    exportSkippedOne: string;
    writeFailureCorrupt: string;
    writeFailureGeneric: string;
  };
  tabs: {
    analysis: string;
    budget: string;
    home: string;
    memory: string;
  };
  toasts: {
    account: {
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
      invalidDay: string;
      logged: string;
      loggedPartial: string;
      needFields: string;
      removed: string;
      saved: string;
      unavailable: string;
    };
    capture: {
      expenseSaved: string;
      expenseSavedFor: string;
      incomeSaved: string;
      incomeSavedFrom: string;
      needAmount: string;
      needCategory: string;
      needTransferAccounts: string;
      templateReady: string;
      transferMoved: string;
    };
    category: {
      needName: string;
      removed: string;
      saved: string;
    };
    clear: {
      cleared: string;
    };
    default: string;
    goal: {
      needFields: string;
      removed: string;
      saved: string;
    };
    limit: {
      markedAs: string;
      needAmount: string;
      removed: string;
      savedMonth: string;
      savedWeek: string;
    };
    memory: {
      needAmount: string;
      removed: string;
      restored: string;
      updated: string;
    };
    plan: {
      saved: string;
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
  budget: Pick<
    AppStrings["budget"],
    "allocation" | "balance" | "goals" | "limits" | "monthlyPlan"
  >;
  memory: Pick<AppStrings["memory"], "groups" | "momentTitle" | "repeatHint">;
  patterns: Pick<
    AppStrings["patterns"],
    | "accounts"
    | "breakdown"
    | "cashflow"
    | "chart"
    | "generated"
    | "groups"
    | "recapEmpty"
    | "trends"
  >;
};