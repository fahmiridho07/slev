export const STORAGE_KEYS = {
  schemaVersion: "slev_schema_version",
  migratedV2: "slev_migrated_v2",
  moments: "slev_entries",
  legacyMoments: "slev.spendingMoments.v1",
  patternFeedback: "slev_pattern_feedback",
  legacyPatternFeedback: "slev.patternFeedback.v1",
  legacyTransactions: "flowtrack.transactions.v1",
  accounts: "slev_accounts",
  transfers: "slev_transfers",
  manualTemplates: "slev_manual_templates",
  recurringBills: "slev_recurring_bills",
  balanceAnchor: "slev_balance_anchor",
  expenseCategories: "slev_expense_categories"
} as const;

export const EXPORTABLE_STORAGE_KEYS = [
  STORAGE_KEYS.moments,
  STORAGE_KEYS.patternFeedback,
  STORAGE_KEYS.accounts,
  STORAGE_KEYS.transfers,
  STORAGE_KEYS.manualTemplates,
  STORAGE_KEYS.recurringBills,
  STORAGE_KEYS.balanceAnchor,
  STORAGE_KEYS.expenseCategories
] as const;