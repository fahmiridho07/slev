import { enExtras } from "./complete/enExtras";
import type { AppStrings } from "./types";

export const en: AppStrings = {
  tabs: {
    home: "Home",
    memory: "Memory",
    budget: "Budget",
    analysis: "Analysis"
  },
  brand: {
    tagline: "Spending memory",
    settings: "Settings"
  },
  boot: {
    preparing: "Preparing local memory...",
    loadingFinance: "Loading your finance data...",
    failed: "Could not load local data. Pull to refresh or restart the app."
  },
  common: {
    back: "Back",
    cancel: "Cancel",
    delete: "Delete",
    gotIt: "Got it",
    progressA11y: "{label}: {percent} percent",
    pullToRefresh: "Pull to refresh",
    undo: "Undo",
    openSettings: "Open settings",
    save: "Save",
    import: "Import",
    reset: "Reset",
    clear: "Clear",
    active: "Active",
    paused: "Paused",
    amount: "Amount",
    account: "Account",
    income: "Income",
    expense: "Expense",
    closeSheet: "Close sheet",
    edit: "Edit",
    selectAccount: "Select account {label}",
    swipeOrLongPressDelete: "Swipe left or long press to delete",
    swipeToDelete: "Swipe left to delete"
  },
  capture: {
    kicker: "Quick capture",
    quickAdd: "Quick add",
    from: "From",
    to: "To",
    sourcePlaceholder: "Source, optional",
    labelPlaceholder: "Label, optional",
    receivedIn: "Received in",
    paidFrom: "Paid from",
    noCategories: "No expense categories are active. Add one before saving expenses.",
    openSettings: "Open Settings",
    context: "Context",
    contextHints: {
      Meal: "Food, snacks, lunch",
      Coffee: "Coffee or tea runs",
      Transport: "Ride, fuel, parking",
      Groceries: "Daily supplies",
      Bills: "Recurring payments",
      Treat: "Small nice things",
      Home: "Household needs",
      Other: "Anything else",
      custom: "Custom spending category"
    },
    contextLabels: {
      Meal: "Meal",
      Coffee: "Coffee",
      Transport: "Transport",
      Groceries: "Groceries",
      Bills: "Bills",
      Treat: "Treat",
      Home: "Home",
      Other: "Other"
    },
    notePlaceholder: "Tiny note, optional",
    addNote: "Add a note",
    saveExpense: "Save expense",
    saveIncome: "Save income",
    saveTransfer: "Save transfer",
    saveAsShortcut: "Save as shortcut",
    saveAsShortcutA11y: "Save as shortcut",
    fewerOptions: "Fewer options",
    moreOptions: "More options",
    amountA11y: "Amount",
    amountPlaceholder: "0",
    currencyPrefix: "Rp",
    applyShortcutA11y: "Apply shortcut {label}",
    removeShortcutA11y: "Remove shortcut {label}",
    repeatA11y: "Repeat {label}",
    income: "Income",
    type: {
      lead: "What are you logging?",
      copy: "Tap the kind of money moment you want to save.",
      expenseLabel: "Expense",
      expenseHint: "Spending you want to track",
      incomeLabel: "Income",
      incomeHint: "Salary, refund, or inflow",
      transferLabel: "Transfer",
      transferHint: "Move money between accounts"
    }
  },
  appearance: {
    captureCompact: "Compact",
    captureExpanded: "Expanded",
    capturePanelLabel: "Quick capture",
    label: "Appearance",
    light: "Light",
    dark: "Dark",
    reduceMotionLabel: "Motion",
    reduceMotionOff: "Full",
    reduceMotionOn: "Reduce",
    reduceMotionSystem: "System",
    system: "System"
  },
  locale: {
    label: "Language",
    english: "English",
    indonesian: "Bahasa Indonesia"
  },
  settings: {
    bills: {
      title: "Recurring bills",
      intro: "Monthly bills you expect each cycle. They show on Home when a payment is coming up.",
      add: "Add bill",
      edit: "Edit bill",
      nameA11y: "Bill name",
      namePlaceholder: "Bill name, e.g. Internet",
      amountA11y: "Bill amount",
      amount: "Amount",
      dayPlaceholder: "Day of month (1-31)",
      active: "Active",
      paused: "Paused",
      save: "Save bill",
      empty: "No recurring bills yet. Add one when you know a fixed monthly payment.",
      rowMeta: "{context} · day {day}{account} · {status}",
      editA11y: "Edit bill {label}",
      deleteTitle: "Delete recurring bill?",
      deleteBody: "{label} will be removed from recurring bills. Logged payments stay in your spending history."
    },
    appearanceTab: "Appearance",
    billsTab: "Bills",
    categoriesTab: "Categories",
    dataTab: "Data",
    heroKicker: "Settings",
    heroHint: "{accounts} account(s) · {bills} recurring bill(s)",
    heroValue: "{count} memor(y/ies)",
    categories: {
      edit: "Edit category",
      editA11y: "Edit category {label}",
      add: "Add expense category",
      nameA11y: "Category name",
      placeholder: "e.g. Health, Subscriptions, Hobby",
      save: "Save category",
      default: "Default",
      custom: "Custom",
      empty: "No active categories. Add a category above to start assigning expenses again."
    },
    data: {
      healthTitle: "Data health",
      healthCopy: "Some data looks damaged. Export a backup before resetting.",
      resetThis: "Reset this data",
      backupTitle: "Backup",
      backupCopy: "Export your data as JSON, or paste a backup to restore.",
      export: "Export JSON backup",
      importPlaceholder: "Paste a Slev backup JSON here",
      importA11y: "Backup JSON",
      import: "Import backup",
      clearAll: "Clear local finance memory",
      resetTitle: "Reset {label}?",
      resetTitleFallback: "Reset data?",
      resetBody: "This clears only {label} on this device. Export a backup first if you want to keep a copy.",
      resetConfirm: "Reset"
    },
    importTitle: "Import backup?",
    importBody: "Importing replaces your current local finance data with the pasted backup.",
    importConfirm: "Import"
  },
  listHints: {
    memory: {
      title: "Memory list actions",
      body: "Tap a moment to edit it in a sheet. Swipe left to delete."
    },
    balance_accounts: {
      title: "Account list actions",
      body: "Tap an account to edit its label or type. Swipe left to delete custom accounts."
    },
    goals: {
      title: "Savings goal actions",
      body: "Tap a goal card to edit amounts. Swipe left to remove a goal."
    },
    recurring_bills: {
      title: "Recurring bill actions",
      body: "Tap a bill to edit schedule and amount. Swipe left to delete the bill."
    },
    settings_categories: {
      title: "Category list actions",
      body: "Tap a custom category to rename it. Swipe left to remove it."
    }
  },
  home: {
    pulse: {
      safeToSpendToday: "Safe to spend today",
      setMonthlyPlan: "Set a monthly plan",
      setMonthlyPlanA11y: "Set a monthly plan",
      setMonthlyPlanHint: "Set a monthly plan to see this",
      netLeft: "Net left this month",
      spending: "Spending",
      estBalance: "Est. balance",
      runwayMonths: "~{count} months of runway",
      runwayHint: "Add a few expenses to estimate runway",
      savedTowardGoals: "Saved toward goals: {saved} of {target}",
      monthlySavingsTarget: "Monthly savings target: {amount}"
    },
    bills: {
      comingUp: "Coming up",
      empty: "No bills due in the next two weeks. Recurring bills can be added in Settings.",
      emptyAction: "Add recurring bills",
      horizonTotal: "{amount} in 14 days",
      dueToday: "due today",
      dueTomorrow: "due tomorrow",
      dueInDays: "due in {count} days",
      logPayment: "Log payment",
      logPaymentA11y: "Log payment for {label}, {amount}, {due}"
    }
  },
  memory: {
    edit: {
      amount: "Amount",
      label: "Label",
      source: "Source",
      receivedIn: "Received in",
      paidFrom: "Paid from",
      note: "Note",
      save: "Save"
    },
    heroKicker: "Spending memory",
    heroHintWithCount: "{count} moment(s) saved this month",
    heroHintEmpty: "Saved spending appears here after capture",
    searchA11y: "Search memories",
    searchPlaceholder: "Search label, context, or amount",
    emptyText: "No saved spending memory yet.",
    emptyAction: "Log first expense",
    searchNoResults: "No memory matches that search.",
    editSheetTitle: "Edit memory",
    editSheetTitleNamed: "Edit {title}",
    deleteTitle: "Delete memory?",
    ...enExtras.memory
  },
  budget: {
    tabs: {
      plan: "Plan",
      balance: "Balance",
      goals: "Goals"
    },
    hero: {
      balanceHint: "From snapshots plus logged movements",
      balanceKicker: "Estimated balance",
      goalsHint: "{count} goal(s) in progress",
      goalsKicker: "Saved toward goals",
      goalsEmptyHint: "Add a target when you are ready",
      goalsEmptyKicker: "Savings goals",
      flexibleSpent: "{amount} flexible spent this month",
      flexibleRemaining: "Flexible remaining",
      noPlanAction: "Start with monthly plan",
      noPlanHint: "Expected income, fixed costs, and savings target",
      noPlanKicker: "Monthly plan"
    },
    plan: {
      allocationDetails: "Allocation details",
      categoryLimitsOptional: "Category limits (optional)",
      expandAllocationA11y: "Show allocation details",
      collapseAllocationA11y: "Hide allocation details",
      expandLimitsA11y: "Show category limits",
      collapseLimitsA11y: "Hide category limits"
    },
    ...enExtras.budget
  },
  patterns: {
    tabs: {
      recap: "Recap",
      spending: "Spending",
      accounts: "Accounts"
    },
    hero: {
      breakdownHint: "{amount} income logged this month",
      breakdownKicker: "Spending this month",
      accountsHintWithTrend: "Net-worth trend available below",
      accountsHintNoTrend: "Add balance snapshots for trends",
      accountsKicker: "Estimated balance",
      recapHintWithPatterns: "Tap a pattern to leave quick feedback",
      recapHintEmpty: "Patterns appear after a few saved moments",
      recapKicker: "Spending recap",
      recapValue: "{count} pattern(s)"
    },
    recap: {
      expensesProgress: "{count} of 6 recent expenses logged",
      feedbackKeep: "Keep",
      feedbackLessOften: "Less often",
      feedbackLockedHint: "Log at least 6 expenses in the last 14 days to answer recap questions.",
      feedbackNotSure: "Not sure",
      feedbackSaved: "Thanks — we'll remember that."
    },
    recapEmptyAction: "Log spending",
    ...enExtras.patterns
  },
  dialogs: {
    clearAllTitle: "Clear local finance memory?",
    clearAllBody: "This removes entries, plans, goals, balances, limits, accounts, transfers, and categories from this device.",
    clearAllConfirm: "Clear",
    categoryDeleteDefaultTitle: "Remove default category?",
    categoryDeleteTitle: "Delete category?",
    categoryDeleteDefault: "{label} will disappear from capture and budget limits. Existing memories stay saved.",
    categoryDeleteCustom: "{label} will be removed from capture and budget limits. Existing memories stay saved.",
    memoryDeleteTitle: "Delete memory?",
    memoryDeleteBody: "{title} will be removed from Memory. Budget and analysis totals will update automatically."
  },
  toasts: enExtras.toasts,
  analysis: enExtras.analysis,
  storage: enExtras.storage
};