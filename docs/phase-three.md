# Phase Three Build Notes

Phase three turns the working capture and sync pipeline into a more useful MVP experience.

## Delivered

- Analytics tab with a 7-day spending trend.
- Category breakdown with amount, share, and transaction count.
- Weekly insights written in a calm, non-judgmental tone.
- Home dashboard now shows sync health and top weekly insight.
- Sync queue button prevents repeated sync taps while a batch is running.
- Settings shows whether the Apps Script endpoint is connected.

## Insight Rules

The current insight layer is intentionally rule-based:

- Weekly total.
- Top spending category.
- Week-over-week change when prior data exists.
- Weekend-heavy spending pattern.
- QRIS transactions after 8 PM.

This keeps phase three aligned with the MVP PRD: useful context without adding AI or complex behavioral scoring yet.

## Future Polish

- Device testing for the Android notification listener.
- Better empty states after several days of real use.
- Merchant learning for categorization.
- Offline sync queue retry with backoff.
