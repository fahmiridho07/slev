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
    preparing: "Preparing your data...",
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
    context: "Category",
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

    changeDate: "Change date",
    hideDate: "Hide date",
    dateLabel: "Date",
    pickAnotherDate: "Pick another date",
    dateQuick: {
      today: "Today",
      yesterday: "Yesterday",
      daysAgo: "{count} days ago"
    },
    saveExpense: "Save expense",
    saveIncome: "Save income",
    saveTransfer: "Save transfer",
    savedButton: "Saved",
    savedBannerExpense: "{amount} saved",
    savedBannerExpenseNamed: "{amount} saved · {name}",
    savedBannerIncome: "{amount} income saved",
    savedBannerIncomeNamed: "{amount} income saved · {name}",
    savedBannerTransfer: "{amount} moved · {from} → {to}",
    savedBannerWithDate: "{message} · {date}",
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
      copy: "Pick the type of entry you want to save.",
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
      intro: "Monthly bills you expect each cycle. Overdue ones also appear as setup hints on Home.",
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
      deleteBody: "{label} will be removed from recurring bills. Logged payments stay in your entry history."
    },
    appearanceTab: "Appearance",
    accountsTab: "Accounts",
    billsTab: "Bills",
    categoriesTab: "Categories",
    dataTab: "Data",
    heroKicker: "Settings",
    heroHint: "{accounts} account(s) · {bills} recurring bill(s)",
    heroValue: "{count} entries saved",
    categories: {
      edit: "Edit category",
      editA11y: "Edit category {label}",
      add: "Add expense category",
      nameA11y: "Category name",
      hintLabel: "Examples (optional)",
      hintA11y: "Category examples",
      hintPlaceholder: "e.g. Food, snacks, lunch",
      placeholder: "e.g. Health, Subscriptions, Hobby",
      save: "Save category",
      default: "Default",
      custom: "Custom",
      orderLabel: "Order in capture",
      moveEarlier: "Move up",
      moveLater: "Move down",
      orderHint: "Changes the chip order when logging expenses.",
      renameHint: "Renaming updates past entries that used this category.",
      defaultRenameHint: "Renaming a default category hides the old one and updates past entries.",
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
      clearAll: "Clear all local data",
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
        "Set the day you get paid (1–31) so safe daily allowance counts down to payday instead of month-end. Leave empty to use month-end.",
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
      body: "Tap an entry to edit it. Swipe left to delete."
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
      body: "Tap a category to rename or change its order. Swipe left to hide."
    }
  },
  home: {
    hints: {
      sheetTitle: "How this works",
      triggerA11y: "Open balance help and setup hints",
      balanceSection: "Balance",
      detailsSection: "Details",
      paceSection: "Daily pace",
      paceIntro:
        "The chip on your balance card compares your recent average spending (last ~30 days) to your safe daily allowance.",
      paceNowLabel: "Right now",
      paceUnderExplain:
        "Below daily pace — you've been spending less than your safe daily amount on average.",
      paceOverExplain:
        "Above daily pace — your recent average is higher than your safe daily allowance. You may run tight before month-end or payday.",
      paceEvenExplain: "On daily pace — your recent average matches your safe daily allowance.",
      paceUnknownExplain: "Estimating — not enough expense history yet to compare your pace.",
      setupSection: "Setup"
    },
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
      progress: "Getting started · {current} of {total}"
    },
    safeToSpend: {
      billsReserve: "Set aside for upcoming bills: {amount}",
      spendBuffer: "You set aside: {amount}",
      billsExceedBalance: "Your bills are larger than your balance right now (short by {amount}).",
      heroLabel: "Total balance",
      safeDailyTile: "Safe daily",
      spendableTile: "Spendable",
      spendableHelper:
        "Total balance is what you have now. Spendable is left after bills and monthly set-aside. Safe daily spreads spendable across days left.",
      paceUnder: "Below daily pace",
      paceOver: "Above daily pace",
      paceEven: "On daily pace",
      paceUnknown: "Estimating",
      daysLeftChip: "{count} days left",
      compactTypicalDaily: "Avg {amount}/day",
      compactBillsReserve: "Bills reserve {amount}",
      paydayHint: "Counted through month-end.",
      paydayHintAction: "Set payday",
      paydayHintA11y: "Open settings to set payday",
      typicalDaily: "Your daily average is {amount}",
      typicalDailyUncertain: "rough estimate — need more data",
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
      cannotAfford: "This is more than your spendable balance — short by {amount}.",
      purchaseVerdict: {
        comfortableHeadline: "Yes — room to spare.",
        comfortableDetail: "Daily allowance stays {amount}, above {paceLabel} ({reference}/day).",
        affordableHeadline: "Yes — still on track.",
        affordableDetail: "Daily allowance becomes {amount} until {horizon}.",
        alreadyStretchedHeadline: "Yes — but you were already tight.",
        alreadyStretchedDetail:
          "This purchase barely changes things. You're already below {paceLabel} ({reference}/day); daily allowance stays {amount}.",
        tightMultiHeadline: "Possible, but tight.",
        tightMultiDetail:
          "At {paceLabel} ({reference}/day), this only lasts ~{days} of the {total} days left.",
        tightOneHeadline: "Very tight — tomorrow will hurt.",
        tightOneDetail:
          "Only ~1 day left at {paceLabel} ({reference}/day). Daily allowance drops to {amount}.",
        belowDailyHeadline: "Not really — daily life doesn't fit.",
        belowDailyDetail: "What's left won't cover even one day at {paceLabel} ({reference}/day).",
        dipsReserveHeadline: "Risky — touches your reserves.",
        dipsReserveDetail: "You'd dip {amount} into bills or monthly set-aside.",
        unaffordableHeadline: "No — not enough spendable cash.",
        unaffordableDetail: "You're short by {amount}.",
        horizonPayday: "payday",
        horizonMonthEnd: "month-end",
        paceLabelTypical: "your usual pace",
        paceLabelSafe: "your safe daily allowance",
        historyFallback: "Based on safe daily — log more expenses for a personalised pace.",
        historyUncertain: "Rough pace estimate — a few more entries will sharpen this.",
        categoryContext: "That's ~{multiple}× your usual {category} ({amount}).",
        categoryContextSingle: "About one usual {category} ({amount}).",
        logExpense: "Log as expense",
        logExpenseA11y: "Log this purchase as an expense",
        loggingExpense: "Saving...",
        statusComfortable: "Room to spare",
        statusOk: "On track",
        statusAlreadyStretched: "Already tight",
        statusTight: "Tight",
        statusRisky: "Risky",
        statusNo: "Can't afford",
        statusHint: "Enter amount",
        meterBefore: "Now",
        meterAfter: "After"
      }
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
    searchPlaceholder: "Search label, category, or amount",
    emptyText: "No entries saved yet.",
    monthEmpty: "No entries this month yet.",
    monthTitle: "Activity · {month}",
    emptyAction: "Log first entry",
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
      accountsHintWithTrend: "Balance trend available below",
      accountsHintNoTrend: "Add balance snapshots for trends",
      accountsKicker: "Estimated balance",
      recapHintWithPatterns: "Tap a pattern to leave quick feedback",
      recapHintEmpty: "Patterns appear after a few saved entries",
      recapKicker: "Spending recap",
      recapValue: "{count} pattern(s)"
    },
    recap: {
      expensesProgress: "{count} of 6 recent expenses logged",
      feedbackKeep: "Keep",
      feedbackLessOften: "Less often",
      feedbackLockedHint: "Log at least 6 expenses in the last 14 days to answer recap questions.",
      feedbackNotSure: "Not sure",
      feedbackSaved: "Thanks — noted."
    },
    recapEmptyAction: "Log spending",
    ...enExtras.patterns
  },
  dialogs: {
    clearAllTitle: "Clear all local data?",
    clearAllBody: "This removes entries, balances, accounts, transfers, shortcuts, bills, and categories from this device.",
    clearAllConfirm: "Clear",
    categoryDeleteDefaultTitle: "Remove default category?",
    categoryDeleteTitle: "Delete category?",
    categoryDeleteDefault: "{label} will disappear from capture. Existing entries stay saved.",
    categoryDeleteCustom: "{label} will be removed from capture. Existing entries stay saved.",
    activityDeleteTitle: "Delete entry?",
    activityDeleteBody: "{title} will be removed. Balances and monthly summaries update automatically."
  },
  toasts: enExtras.toasts,
  analysis: enExtras.analysis,
  storage: enExtras.storage
};