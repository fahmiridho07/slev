import type { AppStringsExtras } from "../types";

export const enExtras: AppStringsExtras = {
  toasts: {
    default: "A spending memory can be as small as an amount.",
    capture: {
      needAmount: "Enter an amount to save this memory.",
      needAccount: "Pick an account first.",
      needCategory: "Add at least one expense category in Settings before saving an expense.",
      needTransferAccounts: "Choose two different accounts for this transfer.",
      transferMoved: "{amount} moved from {from} to {to}.",
      incomeSaved: "{amount} income saved.",
      incomeSavedFrom: "{amount} income saved from {source}.",
      expenseSaved: "{amount} saved.",
      expenseSavedFor: "{amount} saved for {label}.",
      templateReady: "{label} ready to save."
    },
    boot: {
      failed: "Could not load local data. Pull to refresh or restart the app."
    },
    memory: {
      removed: "Memory removed.",
      restored: "Memory restored.",
      needAmount: "Enter an amount before saving changes.",
      notFound: "That memory is no longer available.",
      updated: "Memory updated."
    },
    refresh: {
      failed: "Could not refresh. Try again."
    },
    shortcut: {
      transferUseChips: "Transfer shortcuts can use the account chips directly.",
      needLabel: "Add a label or source before saving a shortcut.",
      saved: "{label} shortcut saved.",
      removed: "Shortcut removed."
    },
    transfer: {
      removed: "Transfer removed.",
      updated: "Transfer updated."
    },
    account: {
      needName: "Add an account or wallet name.",
      saved: "{label} account saved.",
      keepOne: "Keep at least one account for balances.",
      removed: "Account removed.",
      duplicate: "An account with that name already exists."
    },
    category: {
      needName: "Add a category name.",
      duplicate: "That category already exists.",
      saved: "{label} category saved.",
      removed: "{label} category removed."
    },
    bill: {
      needFields: "Add a bill name and amount.",
      saved: "Recurring bill saved.",
      removed: "Recurring bill removed."
    },
    balance: {
      needFields: "Add an account name and balance amount.",
      saved: "Balance saved."
    },
    backup: {
      ready: "Backup ready to share or save.",
      exportFailed: "Could not export local data.",
      imported: "Backup imported.",
      invalidJson: "That text is not valid Slev backup JSON.",
      invalidBackup: "That backup file is not valid Slev data.",
      invalidCollection: "Backup data for {label} is not a valid JSON collection.",
      restoreFailed: "Could not restore {label}. Try freeing device storage.",
      emptyBackup: "That backup has no recognizable finance data.",
      normalizeFailed: "Imported data could not be normalized. Your previous data is unchanged.",
      shareTitle: "Slev finance backup"
    },
    reset: {
      failed: "Could not reset {label}.",
      success: "{label} reset. You can start fresh in that area."
    },
    clear: {
      cleared: "Local finance memory cleared."
    },
    writeFailure: {
      corrupt:
        "{area} on this device looks damaged and was left unchanged. Export a backup in Settings, then re-import.",
      generic:
        "Could not save {area} to this device. Check storage space or export a backup in Settings."
    }
  },
  analysis: {
    accounts: {
      unassigned: "Unassigned"
    },
    incomeTitlePattern: "{source} → {account}",
    trends: {
      midpointPace: "{month} is running above last month's pace at this point."
    }
  },
  storage: {
    collections: {
      slev_entries: "Spending memories",
      slev_pattern_feedback: "Pattern feedback",
      slev_accounts: "Accounts",
      slev_transfers: "Transfers",
      slev_manual_templates: "Shortcuts",
      slev_recurring_bills: "Recurring bills",
      slev_balance_anchor: "Safe-to-spend balance",
      slev_expense_categories: "Expense categories"
    },
    exportSkippedOne: "Note: {label} looked damaged and was not included.",
    exportSkippedMany: "Note: {list} and {last} looked damaged and were not included.",
    writeFailureCorrupt:
      "{area} on this device looks damaged and was left unchanged. Export a backup in Settings, then re-import.",
    writeFailureGeneric:
      "Could not save {area} to this device. Check storage space or export a backup in Settings."
  },
  budget: {
    balance: {
      editAccount: "Edit account",
      addAccount: "Add account or wallet",
      accountPlaceholder: "BRI, Jago, GoPay, Cash...",
      accountKindBank: "Bank",
      accountKindWallet: "Wallet",
      accountKindCash: "Cash",
      accountKindOther: "Other",
      incomeHub: "Income hub",
      openingBalance: "Opening balance",
      openingBalanceHint:
        "This account's balance right now. Entries after this add to or subtract from it.",
      pocket: "Pocket",
      tracked: "Tracked",
      trackedTotal: "Tracked total",
      ephemeral: "Ephemeral",
      ephemeralHint:
        "Ephemeral = a payment source you don't reconcile closely (small e-wallets).",
      saveAccount: "Save account",
      yourAccounts: "Your accounts",
      incomeHubMeta: "Income hub",
      ephemeralPocketMeta: "Ephemeral pocket",
      editAccountA11y: "Edit account {label}",
      deleteAccountTitle: "Delete account?",
      deleteAccountBody:
        "{label} will be removed from account pickers. Existing memories stay saved."
    }
  },
  patterns: {
    breakdown: {
      expenseEmpty: "Expense breakdown appears after a saved expense.",
      incomeEmpty: "Income breakdown appears after an income entry.",
      spendingByCategory: "Spending by category",
      incomeByAccount: "Income by account",
      incomeBySource: "Income by source",
      incomeViewAccount: "Account",
      incomeViewSource: "Source",
      incomeLoggedHint: "Shows where income was logged. Transfers appear separately in Activity.",
      spendingByAccount: "Spending by account",
      expense: "Expense",
      income: "Income",
      amountShare: "{amount} - {percent}%",
      viewAll: "View all categories",
      viewLess: "Show fewer categories",
      previousMonthA11y: "Previous month, currently {month}",
      nextMonthA11y: "Next month, currently {month}",
      vsLastMonthUp: "Up {percent}% vs last month",
      vsLastMonthDown: "Down {percent}% vs last month",
      vsLastMonthFlat: "Same as last month",
      viewEntriesA11y: "View {count} entries for {category}",
      drilldownTitle: "{category} · {month}",
      drilldownSummary: "{count} entries · {total}",
      drilldownEmpty: "No entries in this month",
      categoryNewThisMonth: "New this month",
      categoryDeltaUp: "+{percent}%",
      categoryDeltaDown: "-{percent}%",
      topIncreasesTitle: "Biggest increases vs last month",
      topIncreaseAmount: "+{amount} (+{percent}%)"
    },
    trends: {
      empty: "Trends appear after spending builds across months.",
      advancedTrends: "More trends",
      expandAdvancedTrends: "Show more trends",
      collapseAdvancedTrends: "Hide more trends",
      spendingTrend: "Spending trend",
      currentPaceTitle: "Current month pace is visible",
      weeklyCashflow: "Weekly cashflow",
      showFullCashflow: "Show last 8 weeks",
      hideFullCashflow: "Show this month only"
    },
    cashflow: {
      empty: "Cashflow appears after income or spending entries.",
      net: "Net {amount}",
      netLabel: "Net",
      netThisMonth: "Net this month",
      income: "Income",
      expense: "Expense"
    },
    chart: {
      title: "This month at a glance",
      titleMonth: "{month} at a glance",
      totalAcross: "{total} across {count} categories",
      legendValue: "{amount} · {percent}%",
      a11ySummary: "Spending chart: {total} across {count} categories. {breakdown}"
    },
    recapEmpty: "Patterns appear after a few saved moments.",
    groups: {
      repeatedLately: "Repeated lately",
      standsOut: "Stands out this week",
      smallSpends: "Small spends adding up",
      weekendShape: "Weekend shape"
    },
    generated: {
      quietStartTitle: "A few moments are saved",
      quietStartDetail: "More patterns appear as you log.",
      contextMoreVisibleTitle: "{context} is more visible this week",
      contextMoreVisibleDetailWithPrevious: "{count} moments, up from {previousCount} last week.",
      contextMoreVisibleDetailNoPrevious: "{count} moments this week.",
      contextMoreVisibleRecap: "Keep this {context} rhythm?",
      newRepeatTitle: "A new repeat may be forming",
      newRepeatDetail: "{label} appeared {count} times this week.",
      newRepeatRecap: "Keep {label} in the rhythm?",
      smallSpendsTitle: "Small spends are adding up",
      smallSpendsDetail: "{count} small moments total {total} this week.",
      smallSpendsRecap: "Keep this small-spend rhythm?",
      weekendShapeTitle: "Weekend spending stood out",
      weekendShapeDetail: "About {ratio}x weekday pace.",
      weekendShapeRecap: "Keep this weekend rhythm?",
      contextQuieterTitle: "{context} got quieter",
      contextQuieterDetail: "Common last week, none saved this week.",
      memoryBuildingTitle: "Memory is building",
      memoryBuildingDetail: "{count} moments in the last two weeks.",
      steadyRhythmTitle: "{context} is part of your rhythm",
      steadyRhythmDetail: "{count} moments recently.",
      steadyRhythmRecap: "Keep this {context} rhythm?"
    }
  },
  memory: {
    groups: {
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This week",
      earlier: "Earlier"
    },
    repeatHint: "{count} this week",
    momentTitle: {
      income: "Income"
    }
  }
};