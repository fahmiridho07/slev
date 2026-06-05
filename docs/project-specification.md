# Slev Project Specification

Slev is a lightweight manual finance companion for noticing where money quietly goes.

It helps a person save money moments quickly, plan the month lightly, and later see what has been repeating, standing out, or quietly adding up. The product is intentionally not an accounting system, bank-sync product, passive notification pipeline, dense fintech dashboard, or journaling app.

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

## 2. Current MVP

### Home

- Capture-first screen.
- Amount is the only required field.
- Expense, income, and transfer entries are supported.
- Label and note are optional.
- Context is practical, not emotional, and defaults to the last used context.
- Transfers record money movement between local accounts or wallets and do not count as income or spending.
- Recent repeat chips and manual shortcuts reduce repeat typing and speed up common entries.
- Notes are visually secondary and should appear only when useful for recall.
- The last saved memory can be edited or undone from Home.
- Recent spending memories are visible without becoming a dashboard.
- One calm observation appears when enough data exists.

### Memory

- Compact timeline grouped by recall range: Today, Yesterday, This week, Earlier.
- Search by label, context, note, or amount.
- Entries show amount, label/context, time, and optional note.
- Repeat hints appear only when useful, such as `3 this week`.
- Edit and delete are available.
- The screen is a memory list, not a journal.

### Analysis

- Rule-based, plain-language observations that favor change and contrast over static summaries.
- Pattern groups:
  - Repeated lately.
  - Stands out this week.
  - Small spends adding up.
  - Weekend shape.
- Optional recap responses appear only after enough recent data:
  - Keep.
  - Less often.
  - Not sure.
- Breakdown, cashflow, account distribution, transfer flow, burn-rate, and trend views use plain React Native views.
- Account reconciliation compares the two latest balance snapshots for an account against logged income, expenses, and transfers between those snapshots.

### Money Plan

- Soft category limits per week or month.
- Monthly allocation view for expected income, fixed costs, flexible spending, savings target, daily flexible room, and pocket top-up needs.
- Fixed/flexible category modes for separating recurring costs from controllable spending.
- Monthly spending plan with expected income, fixed costs, flexible spending, and savings target.
- Savings goals with target and saved-so-far amounts.
- Manual account/wallet balance snapshots.
- Local account list for income hub and daily spending pockets.
- Monthly closing ritual with one next-month adjustment.

### Settings

- Custom expense category add, edit, and delete.
- Clear local finance memory action.

## 3. Technology Stack

- Expo SDK 54.
- React Native 0.81.
- React 19.
- TypeScript.
- AsyncStorage for local persistence.
- `react-native-safe-area-context` for safe area layout.
- `@expo/vector-icons` for icons.

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

Transfer and account records:

```ts
type MoneyAccount = {
  id: string;
  label: string;
  kind: "bank" | "wallet" | "cash" | "other";
  isIncomeHub: boolean;
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

Custom categories:

```ts
type ExpenseCategory = {
  id: string;
  label: string;
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

Default contexts:

- Meal
- Coffee
- Transport
- Groceries
- Bills
- Treat
- Home
- Other

## 5. Repository Map

```txt
App.tsx
  Main spending memory app shell and screen composition.

src/features/spendingMemory.types.ts
  SpendingMoment, PatternFeedback, and pattern contracts.

src/data/spendingMemory.ts
  Default context tags and context normalization.

src/data/accountBrands.ts
  Brand-style badge metadata for account and wallet labels without bundling trademarked logo files.

src/services/spendingMemoryRepository.ts
  AsyncStorage persistence, legacy migration, update, delete, clear, and pattern feedback helpers.

src/services/manualFinanceRepository.ts
  Monthly plans, manual templates, category modes, savings goals, balance snapshots, and monthly closings.

src/services/budgetRepository.ts
  Soft budget limits per category.

src/services/accountRepository.ts
  Local account list and manual transfer ledger.

src/services/categoryRepository.ts
  Default and custom expense categories.

src/lib/spendingMemoryPatterns.ts
  Rule-based spending memory pattern generation and Rupiah formatting.

src/lib/financeEngine.ts
  Pure monthly allocation and balance reconciliation calculations.

src/theme/colors.ts
  Color and shadow tokens.
```

Legacy notification, parser, transaction sync, and Google Sheets artifacts have been removed from the build path and repository.

## 6. Local Storage

Current keys:

```txt
slev_entries
slev_pattern_feedback
slev_migrated_v2
slev_budget_limits
slev_monthly_plans
slev_manual_templates
slev_category_modes
slev_savings_goals
slev_balance_snapshots
slev_monthly_closings
slev_accounts
slev_transfers
slev_expense_categories
```

Legacy migration reads confirmed records from:

```txt
flowtrack.transactions.v1
```

Migration rules:

- Only confirmed legacy transactions become spending moments.
- Amount, merchant, timestamp, category, createdAt, and updatedAt are reused when available.
- Legacy categories are normalized into current practical contexts.
- Raw notification text is not used or persisted.

## 7. Pattern Rules

Patterns are deliberately small and explainable. Prefer observations that changed since the previous week:

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
- Avoid cloud sync in the MVP.
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
npm run test:finance
```

Finance engine tests cover monthly summary, allocation, balance reconciliation, latest snapshots, and category modes. Replace future parser-era checks with spending-memory and manual-finance repository tests.

## 10. Next Decisions

Before adding more capability, evaluate whether it improves the core loop:

1. Save a spending moment quickly.
2. Recall where money went.
3. Notice repeats and adjust the next month without maintaining a heavy finance system.

Candidate next work:

- Home screen widget or Android shortcut.
- CSV export as a local, optional action.
- Tests for migration, manual finance repositories, finance engine, and pattern generation.
