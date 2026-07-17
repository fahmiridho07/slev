# Slev Project Specification

Slev is a lightweight manual finance companion for noticing where money quietly goes.

It helps a person save money moments quickly, know what is safe to spend today, and later see what has been repeating, standing out, or quietly adding up. The product is intentionally not an accounting system, bank-sync product, passive notification pipeline, dense fintech dashboard, or journaling app.

## 1. Product Positioning

Core promise:

> Save a money moment in seconds. Later, Slev helps you remember, plan, and adjust without sensitive phone access.

The product should feel:

- Calm.
- Useful.
- Lightweight.
- Permission-light.
- Local-first.
- Emotionally safe.

The product should avoid:

- Complete accounting.
- Daily reflection pressure.
- Shame-coded labels.
- Productivity pressure, scoring, or gamified progress loops.
- Finance dashboard density.
- Spreadsheet aesthetics.
- Mandatory categorization.
- Passive capture or notification access.

## 2. Current App

The app has three tabs: Home, Money, and Settings.

### Home

- Capture-first screen.
- Safe-to-spend card at the top:
  - A calm daily amount derived from tracked account balances, minus a reserve for upcoming recurring bills and an optional spend buffer, spread over the days until month end or the next payday.
  - Pace signal (under, even, over) compared against typical daily spending.
  - Purchase verdict: type an amount and Slev simulates it against safe-to-spend, answering with observational verdicts (comfortable, affordable, already stretched, dips into the bills reserve, unaffordable) plus how the daily room changes.
  - A verdict may include a category note when the amount resembles a repeated purchase (median comparison over the last 30 days).
  - Setup hints appear only while something useful is missing: payday day, opening balances, recurring bills, or a bill that looks due but unlogged.
- Capture form:
  - Amount is the only required field.
  - Expense, income, and transfer entries are supported.
  - Label, note, account, and category are optional.
  - Category defaults to the last used context; a small monthly-guide readout appears under the category when a guide is set (spent so far, room left, or quietly over).
  - Date is collapsible and defaults to now.
  - Recent repeat chips and manual templates reduce repeat typing.
  - Transfers record money movement between local accounts and do not count as income or spending.
- The last saved memory can be edited or undone right after saving.

### Money

Two inner tabs: Overview and Activity.

- Overview:
  - Month picker for browsing past months.
  - Monthly recap card: through the first days of a new month, a dismissible recap of last month (income, spending, savings rate, top categories).
  - Month summary card with income, spending, and net for the selected month.
  - Expense category breakdown with vertical bars and drill-down to the underlying moments.
  - Income by account accordion.
  - Spending trend card: income/expense cashflow over the trailing six months, plus the categories that grew most versus the previous month.
  - Account activity summary.
- Activity:
  - Compact feed of moments and transfers grouped by date.
  - Search by label, context, note, or amount.
  - Repeat hints appear only when useful, such as `3 this week`.
  - Edit and delete via tap or swipe.
  - The screen is a memory list, not a journal.

### Settings

Five inner tabs: Accounts, Categories, Bills, Appearance, Data.

- Accounts: local account list (bank, wallet, cash, other) with opening balance and opening date; balances are derived from the ledger, never edited directly. Accounts can be marked as income hub or excluded from totals (ephemeral tier).
- Categories: custom expense category add, edit, delete, and reorder, with an optional examples hint and an optional monthly guide amount per category.
- Bills: payday day of month, optional spend buffer, and recurring bills with amount, active flag, and optional due day.
- Appearance: light/dark/system theme, English/Indonesian language, reduce-motion preference.
- Data: JSON backup export, backup import via file picker with validation, corrupt-storage recovery, and a clear-all action.

### Quick actions

- A launcher long-press shortcut ("capture") opens the app directly on the Home capture form via the `slev://home/capture` deep link.
- The native module is optional at runtime, so the app still works in Expo Go and on web.

## 3. Technology Stack

- Expo SDK 54.
- React Native 0.81.
- React 19.
- TypeScript.
- AsyncStorage for local persistence.
- `react-native-safe-area-context` for safe area layout.
- `@expo/vector-icons` for icons.
- `@react-native-community/datetimepicker` for the capture date picker.
- `expo-document-picker` for backup import.
- `expo-haptics` for gentle feedback.
- `expo-quick-actions` for launcher shortcuts.
- Local i18n with full English and Indonesian string tables.

## 4. Core Data Model

```ts
type SpendingMoment = {
  id: string;
  amount: number;
  occurredAt: string;
  label?: string;
  context: string;
  note?: string;
  type: "expense" | "income";
  source?: string;
  accountLabel?: string;
  createdAt: string;
  updatedAt: string;
};
```

Account ledger records:

```ts
type MoneyAccount = {
  id: string;
  label: string;
  kind: "bank" | "wallet" | "cash" | "other";
  isIncomeHub: boolean;
  tier?: "tracked" | "ephemeral"; // ephemeral accounts are excluded from totals
  openingBalance: number;
  openingSetAt: string;
  createdAt: string;
  updatedAt: string;
};

type MoneyTransfer = {
  id: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  occurredAt: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};
```

Account balances are always computed: opening balance plus income, minus expenses, plus/minus transfers after the opening date. There are no stored balance snapshots.

Recurring bills:

```ts
type RecurringBill = {
  id: string;
  label: string;
  amount: number;
  active: boolean;
  dueDay?: number; // day of month (1–31); undefined = unspecified
  createdAt: string;
  updatedAt: string;
};
```

Custom categories:

```ts
type ExpenseCategory = {
  id: string;
  label: string;
  hint?: string; // optional examples shown in pickers
  monthlyGuide?: number; // optional soft monthly amount, surfaced as calm feedback
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};
```

Optional pattern feedback:

```ts
type PatternFeedback = {
  patternId: string;
  response: "keep" | "less_often" | "not_sure";
  createdAt: string;
};
```

Manual templates reuse the `SpendingMoment` shape (most recent 12 kept).

Default contexts:

- Meal
- Coffee
- Transport
- Groceries
- Bills
- Treat
- Home
- Other

The `Bills` context is special: expenses logged there are treated as payments already covered by the bills reserve, so safe-to-spend does not count them twice.

## 5. Repository Map

```txt
App.tsx / src/AppRoot.tsx
  App shell, tab navigation, deep link and quick-action wiring.

src/screens/
  HomeScreen, MoneyScreen, SettingsScreen composition.

src/features/
  capture/    Capture form, date picker, validation, save acknowledgement.
  analysis/   SafeToSpendCard, PurchaseVerdictPanel, HomeHintsSheet,
              MonthSummaryCard, MonthlyRecapCard, SpendingTrendCard,
              category breakdown and drill-down views.
  memory/     Moment and transfer edit forms.
  budget/     Account edit form and BalancePanel (account ledger UI).
  settings/   Category, bill, and data (backup) panels with validation.
  spendingMemory.types.ts
              Shared domain types.

src/components/
  Shared UI: bottom sheet, pickers, rows, swipe actions, tab bars.

src/services/
  storage.ts / storageSchema.ts / storageKeys.ts / storageHealth.ts
              AsyncStorage access, schema versioning, corruption handling.
  storageBackup.ts
              JSON export/import of all exportable keys.
  spendingMemoryRepository.ts
              Moments, pattern feedback, legacy migration.
  accountRepository.ts / accountLedgerMigration.ts
              Accounts and transfers.
  recurringBillsRepository.ts
              Recurring bills.
  manualFinanceRepository.ts
              Manual capture templates.
  balanceAnchorRepository.ts
              Optional total-balance anchor.
  categoryRepository.ts
              Default and custom expense categories.
  uiPreferences.ts
              Theme, locale, nav state, payday day, spend buffer, hint flags.
  quickActions.ts
              Launcher shortcut registration and press handling.

src/lib/
  safeToSpend.ts / purchaseVerdict.ts / purchaseContext.ts
              Safe-to-spend math, purchase simulation, verdict copy.
  recurringBills.ts
              Bills reserve within the payday/month-end horizon, overdue checks.
  accountLedger.ts
              Derived account balances and tracked totals.
  financeEngine.ts
              Monthly breakdowns, payday/month-end date helpers.
  monthInsights.ts / categorySpendFeedback.ts
              Cashflow trend, category month deltas, monthly-guide feedback.
  activityFeed.ts / analysis.ts / spendingMemoryPatterns.ts
              Activity feed building, repeat hints, rule-based patterns,
              Rupiah formatting.
  homeSetup.ts
              Prioritized setup hints for Home.

src/state/
  Finance store, actions, and reducer.

src/i18n/
  English and Indonesian strings, locale-aware formatting.

src/navigation/
  Deep link parsing and tab navigation contracts.

src/theme/
  Color tokens, styles, light/dark themes.

src/data/
  Default contexts, brand metadata, account badge styling.

tests/
  Node-based unit tests compiled via tsconfig.test.json.
```

Legacy notification, parser, transaction sync, and Google Sheets artifacts have been removed from the build path and repository. The earlier Money Plan surface (soft budget limits, monthly plans, savings goals, balance snapshots) has been removed in favor of safe-to-spend and the account ledger.

## 6. Local Storage

Current data keys (see `src/services/storageKeys.ts`):

```txt
slev_schema_version
slev_migrated_v2
slev_entries
slev_pattern_feedback
slev_accounts
slev_transfers
slev_manual_templates
slev_recurring_bills
slev_balance_anchor
slev_expense_categories
```

UI preference keys (see `src/services/uiPreferences.ts`):

```txt
slev_ui_color_scheme
slev_ui_locale
slev_ui_nav_state
slev_ui_reduce_motion
slev_ui_month_recap_dismissed
slev_finance_payday_day
slev_finance_spend_buffer
slev_ui_*_hint_seen (one-time list-action hints)
```

Backup export covers the `EXPORTABLE_STORAGE_KEYS` subset: moments, pattern feedback, accounts, transfers, manual templates, recurring bills, balance anchor, and expense categories. Import validates the payload, runs schema migrations, and refuses corrupt collections rather than guessing.

Legacy migration reads confirmed records from:

```txt
flowtrack.transactions.v1
slev.spendingMoments.v1
slev.patternFeedback.v1
```

Migration rules:

- Only confirmed legacy transactions become spending moments.
- Amount, merchant, timestamp, category, createdAt, and updatedAt are reused when available.
- Legacy categories are normalized into current practical contexts.
- Raw notification text is not used or persisted.

## 7. Guidance and Pattern Rules

All guidance is rule-based, local, and explainable. Nothing is scored or streaked.

Safe-to-spend and purchase verdict copy must stay observational and roomy:

Good:

```txt
This fits comfortably.
This would dip into the bills reserve.
Daily room becomes Rp25.000 until payday.
```

Avoid:

```txt
You can't afford this.
Stop spending.
Budget exceeded.
```

Monthly guides per category are soft references, not limits. Feedback states how much has been spent and what room remains; going over is stated quietly, never as a failure.

Spending patterns prefer observations that changed since the previous week:

- Context is more visible this week than last week.
- A label is forming a new repeat.
- A context got quieter after appearing often last week.
- Four or more small spends in the last 7 days, especially when up from the previous week.
- Weekend spending pace noticeably higher than weekday pace.

Pattern copy must stay observational:

Good:

```txt
Coffee is more visible this week.
A new repeat may be forming.
Small spends are more noticeable.
The weekend carried more of the week.
```

Avoid:

```txt
You overspent.
Bad habit detected.
You need to cut back.
```

## 8. Privacy Requirements

Must:

- Store spending memory locally by default.
- Avoid bank credentials.
- Avoid raw notification persistence.
- Avoid notification listener access entirely.
- Avoid cloud sync in the MVP; backup is a manual, local JSON file the user moves themselves.
- Make data clearing obvious.

Must not:

- Require Notification Access during onboarding or later use.
- Upload spending data by default.
- Use shame, guilt, or scoring language.
- Require complete spending capture.

## 9. Validation

Run:

```bash
npm run typecheck
npm run lint
npm run test:finance
```

Or all three via `npm run check`.

`test:finance` compiles `tests/` with `tsconfig.test.json` and runs plain Node assertions covering the finance engine, safe-to-spend inputs (account ledger, recurring bills, spending periods), month insights, category spend feedback, activity feed, deep links, capture and settings validation, patterns, and the state reducer/actions.

## 10. Next Decisions

Before adding more capability, evaluate whether it improves the core loop:

1. Save a spending moment quickly.
2. Know what is safe to spend today.
3. Recall where money went and notice repeats without maintaining a heavy finance system.

Candidate next work:

- Home screen widget (quick actions shortcut already exists).
- CSV export as a local, optional action alongside the JSON backup.
- Reminders for bills with a due day, kept local and permission-light.
