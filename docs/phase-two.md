# Phase Two Build Notes

Phase two connects confirmed local transactions to Google Sheets through a Google Apps Script Web App.

## Delivered

- Google Sheets sync settings in the app.
- Confirmed transactions sync to Apps Script.
- Transaction sync status: local, pending, syncing, synced, failed.
- Manual retry for unsynced confirmed transactions.
- Configurable category list.
- Apps Script template with duplicate protection by `SlevId`.

## Setup

1. Create a Google Sheet.
2. Open Extensions > Apps Script.
3. Paste `google-apps-script/Code.gs`.
4. Deploy as Web App.
5. Set access to yourself or anyone with the link depending on your test setup.
6. Copy the Web App `/exec` URL into Slev Settings.
7. Optionally paste the Google Sheet link into Settings for reference.

## Synced Columns

The script creates a `Transactions` sheet with:

Date, Merchant, Category, Amount, Method, Source, Type, Confidence, SlevId, ConfirmedAt, SyncedAt.

Raw notification text is not synced.
