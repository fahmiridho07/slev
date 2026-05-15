# MVP Readiness Audit

This audit reflects the pivot from passive finance tracker to lightweight spending memory.

## Ready

- Expo React Native TypeScript app.
- Capture-first Home screen.
- Repeat chips for faster common-spend capture.
- Last-saved edit and undo actions.
- Local spending moment model.
- AsyncStorage repository for save, list, update, delete, clear, and pattern feedback.
- One-time migration from confirmed legacy transactions.
- Practical context tags instead of emotional capture fields.
- Memory timeline with search, recall-range grouping, repeat hints, and compact edit/delete actions.
- Rule-based Patterns screen focused on changed repeats, new repeats, quieter contexts, small spends, and weekend shape.
- Optional recap feedback with Keep, Less often, and Not sure.
- Settings screen that removes Notification Access and Google Sheets sync from the MVP path.

## Verified

- TypeScript check passes with `.\node_modules\.bin\tsc.cmd --noEmit`.
- Legacy parser smoke test passes with `node scripts\parser-smoke-test.mjs`.

## Known Boundaries

- The old notification listener, parser, and Google Sheets sync files still exist but are no longer part of the visible MVP.
- Pattern tests are not yet automated.
- Migration tests are not yet automated.
- Export is intentionally not connected.
- There is no widget or Android shortcut yet.

## Next Readiness Work

- Add focused tests for spending-memory migration and pattern generation.
- Validate capture speed on device.
- Decide whether to remove legacy notification/sync modules after real use confirms the pivot.
