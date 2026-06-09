import { enExtras } from "./complete/enExtras";
import type { AppStrings } from "./types";

export const en: AppStrings = {
  tabs: {
    home: "Home",
    money: "Money",
    budget: "Budget"
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
    done: "Done",
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
    billSuggestions: "Suggested from recurring bills",
    billsReservedHint: "Recurring bills are already reserved — you don't need to log them here.",
    reorderHint: "Hold to rearrange",
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
    savedButton: "Saved",
    savedBannerExpense: "{amount} saved",
    savedBannerExpenseNamed: "{amount} saved · {name}",
    savedBannerIncome: "{amount} income saved",
    savedBannerIncomeNamed: "{amount} income saved · {name}",
    savedBannerTransfer: "{amount} moved · {from} → {to}",
    saveAsShortcut: "Save as shortcut",
    saveAsShortcutA11y: "Save as shortcut",
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
      intro: "Monthly bills you expect each cycle. They show on Overview when a payment is coming up.",
      add: "Add bill",
      edit: "Edit bill",
      nameA11y: "Bill name",
      namePlaceholder: "Bill name, e.g. Internet",
      amountA11y: "Bill amount",
      amount: "Amount",
      dayPlaceholder: "Day of month (1-31)",
      dueDayMeta: "Due on day {day}",
      active: "Active",
      paused: "Paused",
      save: "Save bill",
      empty: "No recurring bills yet. Add one when you know a fixed monthly payment.",

      editA11y: "Edit bill {label}",
      deleteTitle: "Delete recurring bill?",
      deleteBody: "{label} will be removed from recurring bills. Logged payments stay in your spending history."
    },
    appearanceTab: "Appearance",
    accountsTab: "Accounts",
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
      backupCopy: "Export your data as JSON, choose a backup file, or paste JSON to restore.",
      export: "Export JSON backup",
      importChooseFile: "Choose backup file",
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
    importConfirm: "Import",
    payday: {
      label: "Payday",
      helper:
        "Set the day you get paid (1–31) so 'safe to spend' counts down to payday instead of month-end. Leave empty to use month-end.",
      placeholder: "Day (1–31), e.g. 25",
      a11y: "Payday day of month"
    },
    buffer: {
      label: "Set aside each month",
      helper:
        "Amount you want to keep safe each month — taken out before your daily allowance is calculated.",
      placeholder: "0",
      a11y: "Amount set aside each month"
    }
  },
  listHints: {
    memory: {
      title: "Activity list actions",
      body: "Tap a moment to edit it in a sheet. Swipe left to delete."
    },
    balance_accounts: {
      title: "Account list actions",
      body: "Tap an account to edit its label or type. Swipe left to delete custom accounts."
    },
    recurring_bills: {
      title: "Recurring bill actions",
      body: "Tap a bill to edit schedule and amount. Swipe left to delete the bill."
    },
    settings_categories: {
      title: "Category list actions",
      body: "Swipe left to hide any category. Tap a custom category to rename it."
    }
  },
  home: {
    setup: {
      openingBalanceHint: "Set your opening balance so safe-to-spend starts accurately.",
      openingBalanceAction: "Set balance",
      openingBalanceA11y: "Open settings to set opening balance",
      billsHint: "Add recurring bills to reserve money for upcoming payments.",
      billsAction: "Add bills",
      billsA11y: "Open settings to add recurring bills",
      overdueBillsHint: "{count} bill(s) may be due without a logged payment.",
      overdueBillsAction: "Review bills",
      overdueBillsA11y: "Open settings to review recurring bills",
      progress: "Setup · {current} of {total}"
    },
    safeToSpend: {
      billsReserve: "Set aside for upcoming bills: {amount}",
      spendBuffer: "You set aside: {amount}",
      billsExceedBalance: "Your bills are larger than your balance right now (short by {amount}).",
      heroLabel: "Total balance",
      safeDailyTile: "Safe daily",
      spendableTile: "Spendable",
      spendableHelper: "Safe daily divides spendable cash across days left, after bills and buffer.",
      paceUnder: "Under budget",
      paceOver: "Over budget",
      paceEven: "On budget",
      paceUnknown: "Estimating",
      daysLeftChip: "{count} days left",
      compactTypicalDaily: "Avg {amount}/day",
      compactBillsReserve: "Bills reserve {amount}",
      paydayHint: "Using month-end horizon.",
      paydayHintAction: "Set payday",
      paydayHintA11y: "Open settings to set payday",
      typicalDaily: "Your daily average is {amount}",
      typicalDailyUncertain: "Rough estimate — need more data",
      checkPurchase: "Can I buy something?",
      checkPurchaseA11y: "Check if a purchase fits your daily allowance",
      sheetTitle: "Can I afford this?",
      purchasePlaceholder: "Purchase amount",
      purchaseHint: "Enter an amount to see how it affects your daily allowance.",
      sheetContext: "Safe daily {amount} · {days} days left",
      affordableUntilPayday: "Yes. After this, your safe daily spend is {amount} until payday.",
      affordableUntilMonthEnd: "Yes. After this, your safe daily spend is {amount} until month-end.",
      overPace: "Doable, but it'll be tight — your daily drops to {amount}, below your average.",
      dipsReserve: "Still doable, but it'll eat {amount} from your bills and set-aside.",
      cannotAfford: "This is more than your spendable balance — short by {amount}."
    }
  },
  activity: {
    tabOverview: "Overview",
    tabActivity: "Activity",
    sectionTitle: "Activity",
    edit: {
      amount: "Amount",
      label: "Label",
      source: "Source",
      receivedIn: "Received in",
      paidFrom: "Paid from",
      note: "Note",
      save: "Save"
    },
    searchA11y: "Search activity",
    searchPlaceholder: "Search label, context, or amount",
    emptyText: "No saved spending yet.",
    monthEmpty: "No entries this month.",
    monthTitle: "Activity · {month}",
    emptyAction: "Log first expense",
    searchNoResults: "No activity matches that search.",
    transferDeleteTitle: "Delete transfer?",
    transferDeleteBody: "{title} will be removed. Account balances will update automatically.",
    transferEditSheetTitle: "Edit transfer",
    transferEditSheetTitleNamed: "Edit {title}",
    editSheetTitle: "Edit entry",
    editSheetTitleNamed: "Edit {title}"
  },
  memory: {
    ...enExtras.memory
  },
  budget: {
    ...enExtras.budget
  },
  patterns: {
    tabs: {
      recap: "Recap",
      spending: "Spending",
      accounts: "Accounts"
    },
    tracker: {
      cashflow: "Cashflow",
      cashflowEmptyMonth: "No income or spending logged this month yet.",
      cashflowEarlyNew: "Log income or spending and this month's cashflow will take shape.",
      cashflowEarlyBuilding: "A few entries are in — cashflow fills in as the month goes on.",
      expenseEmptyMonth: "Nothing spent this month yet.",
      expenseEarlyNew: "A few expenses logged — category breakdown grows as you keep tracking.",
      expenseEarlyBuilding: "Spending is light so far — more entries will sharpen this view.",
      incomeEmptyMonth: "No income logged this month yet.",
      incomeEarlyNew: "A few income entries logged — sources fill in as you keep tracking.",
      incomeEarlyBuilding: "Income is light so far — more entries will sharpen this view."
    },
    hero: {
      breakdownHint: "{amount} income logged this month",
      breakdownHintMonth: "{amount} income logged in {month}",
      breakdownKicker: "Spending this month",
      breakdownKickerMonth: "Spending in {month}",
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
    clearAllBody: "This removes entries, plans, balances, limits, accounts, transfers, and categories from this device.",
    clearAllConfirm: "Clear",
    categoryDeleteDefaultTitle: "Remove default category?",
    categoryDeleteTitle: "Delete category?",
    categoryDeleteDefault: "{label} will disappear from capture and budget limits. Existing memories stay saved.",
    categoryDeleteCustom: "{label} will be removed from capture and budget limits. Existing memories stay saved.",
    activityDeleteTitle: "Delete entry?",
    activityDeleteBody: "{title} will be removed from Overview. Budget and analysis totals will update automatically."
  },
  toasts: enExtras.toasts,
  analysis: enExtras.analysis,
  storage: enExtras.storage
};