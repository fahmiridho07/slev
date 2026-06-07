import type { AppStringsExtras } from "../types";

export const enExtras: AppStringsExtras = {
  toasts: {
    default: "A spending memory can be as small as an amount.",
    capture: {
      needAmount: "Enter an amount to save this memory.",
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
      removed: "Transfer removed."
    },
    account: {
      needName: "Add an account or wallet name.",
      saved: "{label} account saved.",
      keepOne: "Keep at least one account for balances.",
      removed: "Account removed."
    },
    category: {
      needName: "Add a category name.",
      saved: "{label} category saved.",
      removed: "{label} category removed."
    },
    limit: {
      needAmount: "Enter an amount to save this limit.",
      savedWeek: "{category} limit saved for the week.",
      savedMonth: "{category} limit saved for the month.",
      removed: "{category} limit removed.",
      markedAs: "{category} marked as {mode}."
    },
    plan: {
      needFields: "Enter expected income to save this plan.",
      saved: "Monthly plan saved."
    },
    goal: {
      needFields: "Add a goal name and target amount.",
      saved: "Savings goal saved.",
      removed: "Savings goal removed."
    },
    bill: {
      needFields: "Add a bill name and amount.",
      invalidDay: "Choose a day of month between 1 and 31.",
      saved: "Recurring bill saved.",
      removed: "Recurring bill removed.",
      unavailable: "That recurring bill is no longer available.",
      loggedPartial: "{amount} logged, but the bill cycle could not be updated.",
      logged: "{amount} logged for {label}."
    },
    balance: {
      needFields: "Add an account name and balance amount.",
      saved: "Balance snapshot saved."
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
    allocation: {
      action: {
        setPlan: {
          title: "Set the monthly envelope",
          detail:
            "Add expected income, fixed costs, flexible spending, and savings target for this month."
        },
        snapshotBalances: {
          title: "Snapshot balances first",
          detail:
            "Add quick snapshots for BRI, Jago, wallets, and cash so pocket funding can be checked."
        },
        planExceedsIncome: {
          title: "Plan is above income",
          detail:
            "The plan is {amount} above expected income. Lower one allocation or raise the expected income only if it is realistic."
        },
        flexibleOverPlan: {
          title: "Flexible budget is already crossed",
          detail:
            "Flexible spending is {amount} over the monthly envelope. Treat the rest of the month as a slower-spend period."
        },
        topUpPockets: {
          title: "Pocket top-up is visible",
          detail:
            "Moving up to {amount} from the income hub would fully fund the remaining flexible budget. Hub snapshot shows {hubBalance}."
        },
        hold: {
          title: "Allocation is steady",
          detail:
            "The current pocket balance covers remaining flexible spending. Keep logging normally and update snapshots when balances change."
        }
      },
      row: {
        incomeTitle: "Income received",
        incomeNoPlan: "No expected income is set for this month.",
        incomeRemaining: "{amount} expected income is not logged yet.",
        incomeAbovePlan: "Income is {amount} above plan.",
        fixedTitle: "Fixed costs",
        fixedNoPlan: "No fixed-cost envelope is set.",
        fixedRemaining: "{amount} fixed-cost room remains.",
        fixedAbovePlan: "Fixed costs are {amount} above plan.",
        flexibleTitle: "Flexible spending",
        flexibleNoPlan: "No flexible spending envelope is set.",
        flexibleRemaining: "{amount} flexible spending remains.",
        flexibleAbovePlan: "Flexible spending is {amount} above plan.",
        savingsTitle: "Savings target",
        savingsNoPlan: "No savings target is set.",
        savingsStillNeeded: "{amount} still needed to hit the savings target.",
        savingsAboveTarget: "Net left is {amount} above target."
      }
    },
    reconciliation: {
      summary: {
        noSnapshot: {
          title: "No balance check yet",
          detail:
            "Add balance snapshots first. Reconciliation becomes useful after two snapshots for the same account."
        },
        needsReview: {
          title: "Some balances need review",
          detail: "{count} account(s) need checking. Total visible gap is {totalGap}."
        },
        smallGap: {
          title: "Small balance gaps are visible",
          detail:
            "{count} account(s) have small gaps. They may be fees, rounding, or one missing entry."
        },
        needsHistory: {
          title: "One more snapshot will unlock checks",
          detail:
            "At least one account has only one snapshot. Add the next snapshot to compare logged movement."
        },
        matched: {
          title: "Logged movement matches balances",
          detail: "Latest snapshots match the movement logged between balance checks."
        }
      },
      status: {
        noSnapshot: "No snapshot",
        needsHistory: "Need 2 snapshots",
        matched: "Matched"
      },
      detail: {
        noSnapshot: "Add a manual balance snapshot for this account.",
        needsHistory:
          "Add one more snapshot later; Slev will compare the movement between both checks.",
        movement:
          "Logged movement over {days} day(s): income {income}, spending {expense}, transfer in {transferIn}, transfer out {transferOut}.",
        higherThanExpected:
          "Actual balance is {gap} higher than expected. Check missing income, transfer in, or an overstated expense.",
        lowerThanExpected:
          "Actual balance is {gap} lower than expected. Check missing expense, transfer out, or a balance typo."
      }
    },
    accounts: {
      unassigned: "Unassigned"
    },
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
      slev_budget_limits: "Budget limits",
      slev_monthly_plans: "Monthly plans",
      slev_manual_templates: "Shortcuts",
      slev_category_modes: "Category modes",
      slev_savings_goals: "Savings goals",
      slev_recurring_bills: "Recurring bills",
      slev_balance_snapshots: "Balance snapshots",
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
      estimatedCurrentBalance: "Estimated current balance",
      estimatedCurrentBalanceCopy:
        "{total} from snapshots plus logged income, spending, and transfers.",
      trackedEphemeralCopy:
        "Tracked {tracked} you reconcile · Ephemeral {ephemeral} rough.",
      worthQuickLook: "Worth a quick look",
      driftCopy:
        "These balances drifted from what you logged. No rush — reconcile when you have a moment.",
      driftRow: "{label}: off by {difference}",
      manualSnapshotBase: "Manual snapshot base",
      manualSnapshotCopy: "{total} from the latest saved snapshots.",
      balanceSnapshot: "Balance snapshot",
      currentBalancePlaceholder: "Current balance",
      saveSnapshotA11y: "Save balance snapshot",
      saveSnapshot: "Save snapshot",
      editAccount: "Edit account",
      addAccount: "Add account or wallet",
      accountPlaceholder: "BRI, Jago, GoPay, Cash...",
      accountKindBank: "Bank",
      accountKindWallet: "Wallet",
      accountKindCash: "Cash",
      accountKindOther: "Other",
      incomeHub: "Income hub",
      pocket: "Pocket",
      tracked: "Tracked",
      ephemeral: "Ephemeral",
      ephemeralHint:
        "Ephemeral = a payment source you don't reconcile closely (small e-wallets).",
      saveAccount: "Save account",
      yourAccounts: "Your accounts",
      emptyAccounts:
        "Income, expenses, transfers, or snapshots will build account balances here.",
      currentAccountBalances: "Current account balances",
      estimatedFromSnapshot: "Estimated from the latest snapshot and logged movements.",
      incomeHubMeta: "Income hub",
      ephemeralPocketMeta: "Ephemeral pocket",
      noActivity: "No activity",
      editAccountA11y: "Edit account {label}",
      deleteAccountTitle: "Delete account?",
      deleteAccountBody:
        "{label} will be removed from account pickers. Existing memories stay saved."
    },
    goals: {
      editGoal: "Edit savings goal",
      newGoal: "New savings goal",
      goalNameA11y: "Goal name",
      goalNamePlaceholder: "Goal name",
      targetAmountA11y: "Target amount",
      targetAmountPlaceholder: "Target amount",
      savedSoFarA11y: "Saved so far",
      savedSoFarPlaceholder: "Saved so far",
      emptyGoals:
        "Savings goals can stay simple: target, current amount, and a small note.",
      emptyGoalsAction: "Use the form above to add your first goal",
      editGoalA11y: "Edit goal {label}",
      deleteGoalTitle: "Delete goal?",
      deleteGoalBody:
        "{label} will be removed from your goals. This does not change saved memories or balances."
    },
    limits: {
      emptyNoCategories:
        "No expense categories are active, so budget limits have nowhere to attach.",
      openSettings: "Open Settings",
      setLimit: "Set",
      editLimitA11y: "{action} limit for {category}",
      spentOfLimit: "{spent} of {limit} {period}",
      noLimitSpent: "No limit set - {spent} this month",
      fixed: "Fixed",
      flexible: "Flexible",
      limitAmountPlaceholder: "Limit amount",
      limitAmountA11y: "Limit amount for {category}",
      weekly: "Weekly",
      monthly: "Monthly",
      deleteLimit: "Delete limit"
    },
    monthlyPlan: {
      title: "Monthly spending plan",
      wizardTitle: "Set up your monthly plan",
      wizardStep: "Step {current} of {total}",
      wizardNext: "Next",
      wizardBack: "Back",
      wizardFinish: "Save plan",
      stepIncomeCopy: "Start with what you expect to earn this month.",
      stepFixedCopy: "Add rent, subscriptions, and other must-pay costs.",
      stepSavingsCopy: "Set a savings target, add an optional note, then save.",
      expectedIncome: "Expected income",
      useLoggedIncome: "Use logged income ({amount})",
      fixedCosts: "Fixed costs",
      savingsTarget: "Savings target",
      notePlaceholder: "One adjustment for this month, optional",
      flexibleBudget: "Flexible budget",
      flexibleRemaining: "Flexible remaining",
      overIncomeBy: "Over your income by",
      savePlan: "Save plan"
    },
    allocation: {
      setPlanEmpty: "Set a monthly plan to see your allocation.",
      income: "Income",
      ofPlanned: "of {planned}",
      dailyRoom: "Daily room",
      flexibleUntilMonthEnd: "flexible until month end",
      pocketCash: "Pocket cash",
      dayCoverage: "{count} day coverage",
      netLeft: "Net left",
      againstTarget: "against target",
      monthlyAllocation: "Monthly allocation",
      estimatedFromLogs: "Estimated from your logs. Add a snapshot to calibrate.",
      openBalance: "Open Balance"
    }
  },
  patterns: {
    breakdown: {
      expenseEmpty: "Expense breakdown appears after a saved expense.",
      incomeEmpty: "Income breakdown appears after an income entry.",
      spendingByCategory: "Spending by category",
      incomeBySource: "Income by source",
      expense: "Expense",
      income: "Income",
      amountShare: "{amount} - {percent}%"
    },
    trends: {
      empty: "Trends appear after spending builds across months.",
      netWorthTrend: "Net-worth trend",
      snapshotForNetWorth: "Snapshot your balances to see net-worth trend.",
      snapshotAction: "Open balance",
      spendingTrend: "Spending trend",
      currentPaceTitle: "Current month pace is visible",
      topCategoriesTitle: "Top categories this month",
      topCategoriesEmpty: "No category has stood out yet this month.",
      weeklyCashflow: "Weekly cashflow"
    },
    cashflow: {
      empty: "Cashflow appears after income or spending entries.",
      net: "Net {amount}",
      income: "Income",
      expense: "Expense"
    },
    accounts: {
      hubAndPockets: "Hub and pockets",
      hubPocketsCopy: "Hub {hub} - daily pockets {pockets}.",
      mostActivePocket: "Most active spending pocket",
      topSpendingCopy: "{label} has {amount} spending logged this month.",
      spendingByAccountEmpty:
        "Spending by account appears after entries include an account.",
      reconciliationEmpty:
        "Reconciliation starts after the first manual snapshot. Current balance can still be estimated from income and spending.",
      balanceReconciliation: "Balance reconciliation",
      accountMovement: "Account movement this month",
      incomeNetCopy: "Income {income} - net {net}",
      recentTransfers: "Recent transfers",
      expectedActual: "Expected {expected} - actual {actual}",
      deleteTransferTitle: "Delete transfer?",
      deleteTransferBody: "{amount} from {from} to {to} will be removed.",
      deleteTransferA11y: "Delete transfer from {from} to {to}"
    },
    chart: {
      title: "This month at a glance",
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
      quietStartDetail: "Slev will look for changes and repeats as more memory builds up.",
      contextMoreVisibleTitle: "{context} is more visible this week",
      contextMoreVisibleDetailWithPrevious: "{count} saved moments, up from {previousCount} last week.",
      contextMoreVisibleDetailNoPrevious: "{count} saved moments appeared this week.",
      contextMoreVisibleRecap: "Keep this {context} rhythm?",
      newRepeatTitle: "A new repeat may be forming",
      newRepeatDetail: "{label} appeared {count} times this week.",
      newRepeatRecap: "Keep {label} in the rhythm?",
      smallSpendsTitle: "Small spends are more noticeable",
      smallSpendsDetail: "{count} smaller moments add up to {total} this week.",
      smallSpendsRecap: "Keep this small-spend rhythm?",
      weekendShapeTitle: "The weekend carried more of the week",
      weekendShapeDetail: "Weekend spending ran about {ratio}x the weekday pace.",
      weekendShapeRecap: "Keep this weekend rhythm?",
      contextQuieterTitle: "{context} got quieter this week",
      contextQuieterDetail:
        "That context showed up often last week and has not appeared in saved memory this week.",
      memoryBuildingTitle: "Memory is building",
      memoryBuildingDetail: "{count} moments saved in the last two weeks.",
      steadyRhythmTitle: "{context} is part of the recent rhythm",
      steadyRhythmDetail: "{count} moments in the last two weeks.",
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