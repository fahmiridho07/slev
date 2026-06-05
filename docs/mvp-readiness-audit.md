# MVP Readiness Audit

This audit reflects the pivot from passive finance tracker to lightweight spending memory.

## Ready

- Expo React Native TypeScript app.
- Capture-first Home screen.
- Manual expense, income, and transfer capture.
- Transfer records for moving money between local accounts and wallets without affecting cashflow.
- Local account list for income hub and daily spending pockets.
- Custom expense category CRUD in Settings.
- Repeat chips for faster common-spend capture.
- Manual shortcuts for recurring entries.
- Last-saved edit and undo actions.
- Local spending moment model.
- AsyncStorage repository for save, list, update, delete, clear, and pattern feedback.
- One-time migration from confirmed legacy transactions.
- Practical context tags instead of emotional capture fields.
- Memory timeline with search, recall-range grouping, repeat hints, and compact edit/delete actions.
- Rule-based Analysis screen focused on changed repeats, new repeats, quieter contexts, small spends, weekend shape, cashflow, account distribution, balance reconciliation, transfer flow, burn-rate, and trends.
- Optional recap feedback with Keep, Less often, and Not sure.
- Money plan screen with monthly allocation, soft limits, monthly plan, savings goals, account balance snapshots, and monthly close.
- Settings screen for category CRUD and local data clearing.

## Verified

- TypeScript check passes with `npm run typecheck`.
- Finance engine checks pass with `npm run test:finance`.
- Android Metro bundle completed successfully from Expo dev server.

## Known Boundaries

- Legacy parser, transaction sync, Google Sheets sync, and native notification listener files have been removed.
- Pattern tests are not yet automated.
- Migration tests are not yet automated.
- Export is intentionally not connected.
- There is no widget or Android shortcut yet.

## Next Readiness Work

- Add focused tests for spending-memory migration and pattern generation.
- Validate capture speed on device.
- Add focused tests for manual-finance storage and spending-memory migration.
