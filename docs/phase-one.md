# Phase One Build Notes

Phase one proves the product's riskiest assumption: financial notifications can become useful transaction records with very little user effort.

## Delivered Loop

1. A notification payload enters `notificationCaptureService`.
2. `parseFinancialNotification` rejects sensitive messages.
3. The parser extracts amount, merchant, source, method, timestamp, transaction type, and category.
4. A local draft is saved with AsyncStorage.
5. The user reviews the draft in the Inbox and confirms or ignores it.

## Current User Flows

- Home shows local spending summaries from confirmed records.
- Inbox shows parsed drafts awaiting review.
- Capture lets you paste or tap sample notification text for parser testing.
- Settings controls source allow-listing and privacy-facing controls.
- Android development builds can autolink the local notification listener module.

## What Is Intentionally Deferred

- Google Sheets sync.
- Google Apps Script backend.
- Advanced category learning.
- Weekly insight generation.
- Production hardening for the Android native module.

Those belong in phase two and three according to the PRD.
