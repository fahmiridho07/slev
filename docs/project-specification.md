# Slev Project Specification

Slev is a lightweight spending memory for noticing where money quietly goes.

It helps a person save small spending moments quickly and later see what has been repeating, standing out, or quietly adding up. The product is intentionally not a budgeting app, accounting system, fintech dashboard, AI financial assistant, or journaling app.

## 1. Product Positioning

Core promise:

> Save a spending moment in seconds. Later, Slev helps you remember the shape of your spending.

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
- Streaks.
- Finance dashboard density.
- Spreadsheet aesthetics.
- Mandatory categorization.
- Passive capture as a default onboarding step.

## 2. Current MVP

### Home

- Capture-first screen.
- Amount is the only required field.
- Label and note are optional.
- Context is practical, not emotional, and defaults to the last used context.
- Recent repeat chips are suggested to reduce repeat typing and speed up common spends.
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

### Patterns

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

### Settings

- Shows local-first privacy posture.
- No notification access required.
- No sync connected.
- Clear local memory action.

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

src/services/spendingMemoryRepository.ts
  AsyncStorage persistence, legacy migration, update, delete, clear, and pattern feedback helpers.

src/lib/spendingMemoryPatterns.ts
  Rule-based spending memory pattern generation and Rupiah formatting.

src/theme/colors.ts
  Color and shadow tokens.
```

Legacy files still present but no longer visible in the MVP path:

```txt
src/lib/transactionParser.ts
src/lib/spendingAnalytics.ts
src/services/googleSheetsSync.ts
src/services/notificationCaptureService.ts
modules/slev-notification-listener/
google-apps-script/Code.gs
```

## 6. Local Storage

Current keys:

```txt
slev.spendingMoments.v1
slev.patternFeedback.v1
slev.migrated.flowtrackTransactions.v1
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
- Avoid cloud sync in the MVP.
- Make data clearing obvious.

Must not:

- Require Notification Access during onboarding.
- Upload spending data by default.
- Use shame, guilt, or scoring language.
- Require complete spending capture.

## 9. Validation

Run:

```bash
npm run typecheck
npm run parser:smoke
```

The parser smoke test remains while legacy parser code is still present. Once the legacy parser is removed, replace it with spending-memory repository and pattern tests.

## 10. Next Decisions

Before adding more capability, evaluate whether it improves the core loop:

1. Save a spending moment quickly.
2. Recall where money went.
3. Notice repeats without maintaining a finance system.

Candidate next work:

- Home screen widget or Android shortcut.
- CSV export as a local, optional action.
- Search/filter in Memory.
- Tests for migration and pattern generation.
- Removal of legacy notification/sync modules after the pivot is validated.
