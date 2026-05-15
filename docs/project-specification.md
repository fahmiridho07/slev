# Slev Project Specification

Slev is a privacy-first passive finance tracker for Android. The name comes from "sleeve", a small place to tuck money safely. It converts finance notifications and quick manual entries into structured expense records, then syncs confirmed records to Google Sheets.

This document is the working specification for future development. Use it as the source of truth before changing architecture, storage, parser behavior, sync behavior, or UX flows.

## 1. Product Scope

### Product Positioning

Slev is not a full accounting app. It is a lightweight personal spending awareness tool.

The core promise:

> Capture spending with minimal effort, keep sensitive notification data local, and surface calm spending patterns.

### Target User

Primary user:

- Android user.
- Uses BRImo and e-wallets such as DANA, GoPay, ShopeePay, and OVO.
- Wants spending awareness without maintaining a spreadsheet manually.
- Prefers fast confirmation over detailed accounting.

### MVP Goals

- Capture finance notifications locally.
- Parse structured transaction drafts.
- Let users confirm, edit category, or ignore drafts.
- Provide quick manual entry when parsing fails.
- Sync confirmed transactions to Google Sheets.
- Show simple dashboard, trend, category breakdown, and weekly insights.

### Non-Goals

- Banking credentials.
- Direct bank API integration.
- Investment tracking.
- Credit scoring.
- OCR receipt scanning.
- AI assistant.
- Subscription/payment system.
- Multi-user support.

## 2. Current Feature Set

### Capture

- Android native notification listener module.
- Manual notification text tester for development and parser QA.
- Quick add manual transaction flow.

### Parsing

- Rule-based Rupiah amount extraction.
- Source detection from built-in and custom source keywords.
- Merchant extraction from common Indonesian notification formats.
- Method detection: QRIS, Debit, Transfer, E-wallet, Top up, Cash, Manual, Unknown.
- Category inference from keyword mapping.
- Sensitive notification rejection before storage.

### Review

- Draft inbox.
- Confirm draft.
- Edit category.
- Ignore draft.

### Sync

- Google Apps Script Web App endpoint setting.
- Google Sheet reference URL setting.
- Confirmed transactions sync to Apps Script.
- Duplicate prevention by `SlevId`.
- Retry sync queue for unsynced confirmed transactions.

### Analytics

- Today spending.
- This week spending.
- Draft count.
- Synced count.
- 7-day trend.
- Category breakdown.
- Weekly rule-based insights.

### Settings

- Notification listener permission entry point.
- Enable/disable sources.
- Add custom source.
- Add custom category.
- Save Google Sheets sync settings.
- Clear local transaction data.

## 3. Technology Stack

### Mobile App

- Expo SDK 54.
- React Native 0.81.
- React 19.
- TypeScript.
- AsyncStorage for local persistence.
- `react-native-safe-area-context` for safe area layout.
- `@expo/vector-icons` for UI icons.

### Native Android

Local package:

```txt
modules/slev-notification-listener
```

Key native files:

- `SlevNotificationListenerService.kt`
- `SlevNotificationListenerModule.kt`
- `SlevNotificationListenerPackage.kt`
- `AndroidManifest.xml`

### Backend

Google Apps Script:

```txt
google-apps-script/Code.gs
```

### Database

Google Sheets for confirmed synced transactions.

Local app storage is AsyncStorage.

## 4. Repository Map

```txt
App.tsx
  Main React Native app and screen composition.

src/data/catalog.ts
  Default categories, default notification sources, sample notifications, manual methods.

src/features/transactions.types.ts
  Shared transaction, source, and sync TypeScript contracts.

src/lib/transactionParser.ts
  Rule-based parser and formatting helpers.

src/lib/spendingAnalytics.ts
  Trend, category total, and weekly insight calculations.

src/services/transactionRepository.ts
  AsyncStorage persistence, migration, normalization, and update helpers.

src/services/googleSheetsSync.ts
  Client for Google Apps Script sync endpoint.

src/services/notificationCaptureService.ts
  JS adapter around native notification listener module.

src/theme/colors.ts
  Color and shadow tokens.

modules/slev-notification-listener/
  Native Android listener package.

google-apps-script/Code.gs
  Apps Script endpoint that appends validated rows to Google Sheets.

docs/
  Phase notes, listener docs, readiness audit, and this project specification.
```

## 5. Data Model

### `NotificationPayload`

Raw notification payload passed into the parser. This should not be persisted.

```ts
type NotificationPayload = {
  id?: string;
  title?: string;
  body: string;
  packageName?: string;
  receivedAt?: string;
};
```

### `ParsedTransaction`

Structured transaction created by the parser or manual quick add.

```ts
type ParsedTransaction = {
  amount: number;
  merchant: string;
  category: string;
  method: TransactionMethod;
  source: string;
  sourceLabel: string;
  transactionType: "expense" | "income" | "transfer" | "unknown";
  timestamp: string;
  confidence: number;
};
```

### `TransactionDraft`

Persisted local transaction record.

```ts
type TransactionDraft = ParsedTransaction & {
  id: string;
  status: "draft" | "confirmed" | "ignored";
  syncStatus: "not_configured" | "pending" | "syncing" | "synced" | "failed";
  syncError?: string;
  syncedAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

### Source Model

```ts
type FinanceSource = {
  id: string;
  label: string;
  keywords: string[];
  enabled: boolean;
  builtIn?: boolean;
};
```

Default sources:

- BRImo
- DANA
- GoPay
- ShopeePay
- OVO

Custom sources are created from Settings and stored in AsyncStorage.

### Sync Settings

```ts
type SyncSettings = {
  endpointUrl: string;
  sheetUrl: string;
};
```

`endpointUrl` must match a Google Apps Script Web App `/exec` URL.

## 6. Local Storage Keys

Defined in `src/services/transactionRepository.ts`.

The key namespace still uses `flowtrack` for backward compatibility with early development builds. Do not rename these keys without a migration.

```txt
flowtrack.transactions.v1
flowtrack.sources.v1
flowtrack.categories.v1
flowtrack.syncSettings.v1
```

### Storage Rules

- Store structured transaction records only.
- Do not store raw notification title/body.
- Normalize malformed or legacy records on read.
- Ignore unreadable storage payloads instead of crashing.
- Keep source and category migrations backward-compatible.

## 7. Core User Flows

### Flow A: Notification Capture

1. Android receives finance notification.
2. Native listener extracts package name, title, text, big text/text lines, and timestamp.
3. Native listener drops obvious OTP, PIN, password, token, balance, and account messages.
4. JS receives `SlevNotificationReceived`.
5. Parser performs another sensitive-content check.
6. Parser extracts amount, source, merchant, method, category, type, timestamp, and confidence.
7. App stores a local draft.
8. User reviews the draft.
9. User confirms, edits category, or ignores.
10. Confirmed transaction syncs to Sheets if endpoint is configured.

### Flow B: Manual Quick Add

1. User opens Capture.
2. User enters amount.
3. User optionally enters merchant.
4. User chooses method and category.
5. App saves transaction as confirmed.
6. Transaction syncs to Sheets if endpoint is configured.

### Flow C: Manual Notification Tester

1. User pastes notification text or taps a sample.
2. Parser attempts to create a draft.
3. Draft appears in Inbox.

This flow exists for development and parser QA.

### Flow D: Sync Retry

1. User opens Home or Settings.
2. User taps sync.
3. App finds confirmed transactions where `syncStatus !== "synced"`.
4. App syncs them sequentially.
5. Each row is idempotent through `SlevId` duplicate checking.

## 8. Parser Specification

Parser file:

```txt
src/lib/transactionParser.ts
```

### Sensitive Rejection

Reject if text contains signals like:

- OTP
- one-time password
- kode rahasia
- kode verifikasi
- kode token
- PIN
- password
- token
- no rek
- rekening
- account
- saldo
- balance

### Amount Extraction

Supported examples:

```txt
Rp18.000
IDR 18.000
18000 rupiah
```

Amount is stored as integer Rupiah:

```txt
Rp18.000 -> 18000
```

### Source Detection

Source is detected from:

- Android package name.
- Notification title/body.
- Built-in source keywords.
- Custom source keywords.

Unknown source falls back to:

```txt
source: "unknown"
sourceLabel: "Unknown"
```

### Merchant Extraction

Current patterns focus on common Indonesian notification phrases:

```txt
di {merchant}
ke {merchant}
merchant {merchant}
```

Stop words include:

```txt
berhasil, sukses, via, pada, tanggal, tgl, sebesar
```

### Category Inference

Current categories are inferred from keyword matching:

- Food
- Coffee
- Transport
- Groceries
- Bills
- Shopping
- Entertainment
- Health
- Education
- Transfer
- Other

Custom categories can be selected manually but are not yet used in automatic keyword inference.

## 9. Sync Specification

Client file:

```txt
src/services/googleSheetsSync.ts
```

Endpoint must look like:

```txt
https://script.google.com/macros/s/{deployment-id}/exec
```

### App Payload

The app sends:

```json
{
  "id": "local-transaction-id",
  "date": "ISO timestamp",
  "merchant": "Merchant",
  "category": "Food",
  "amount": 18000,
  "method": "QRIS",
  "source": "BRImo",
  "transactionType": "expense",
  "confidence": 0.95,
  "confirmedAt": "ISO timestamp"
}
```

The app does not send raw notification text.

### Sheet Columns

Apps Script creates or uses `Transactions` sheet with:

```txt
Date
Merchant
Category
Amount
Method
Source
Type
Confidence
SlevId
ConfirmedAt
SyncedAt
```

### Idempotency

Apps Script searches `SlevId`.

If found:

```json
{
  "ok": true,
  "duplicate": true,
  "row": 12
}
```

If new:

```json
{
  "ok": true,
  "duplicate": false,
  "row": 13
}
```

## 10. Analytics Specification

Analytics file:

```txt
src/lib/spendingAnalytics.ts
```

### Metrics

- Daily trend for last 7 days.
- Category totals.
- Transaction count per category.
- Category share of spending.
- Weekly total.
- Previous-week comparison.
- Weekend vs weekday pattern.
- Late QRIS count after 8 PM.

### Insight Tone

Insights must stay non-judgmental.

Good:

```txt
Weekend spending stands out.
This week is 20% higher than the previous 7 days.
```

Avoid:

```txt
You overspent again.
Bad spending detected.
```

## 11. Privacy and Security Requirements

### Must

- Parse notifications locally.
- Store only structured transaction fields.
- Reject OTP, PIN, token, password, balance, and account-number messages.
- Let users disable sources.
- Use minimal Android permissions.
- Avoid raw notification upload.
- Avoid bank credentials entirely.

### Must Not

- Store raw notification history.
- Upload OTP or sensitive notification text.
- Request account credentials.
- Read SMS.
- Sell or share user data.

### Current Android Permissions

App config blocks:

```txt
android.permission.READ_EXTERNAL_STORAGE
android.permission.WRITE_EXTERNAL_STORAGE
android.permission.SYSTEM_ALERT_WINDOW
```

The notification listener uses Android Notification Access settings, not a normal runtime permission.

## 12. Development Setup

### Install

```bash
npm install
```

### Start Metro

```bash
npm run start
```

Clear Metro cache:

```bash
npm run start:clear
```

### Android Development Build

```bash
npm run android
```

If Gradle cannot find Android SDK, create:

```txt
android/local.properties
```

Example:

```txt
sdk.dir=C:/Users/Lenovo/AppData/Local/Android/Sdk
```

### Build Debug APK

```bash
cd android
./gradlew.bat :app:assembleDebug
```

APK output:

```txt
android/app/build/outputs/apk/debug/app-debug.apk
```

## 13. Validation Commands

### TypeScript

```bash
npm run typecheck
```

### Parser Smoke Test

```bash
npm run parser:smoke
```

### Audit

```bash
npm audit
```

### Native Module Compile

```bash
cd android
./gradlew.bat :slev-notification-listener:assembleDebug
```

### Full Android Build

```bash
cd android
./gradlew.bat :app:assembleDebug
```

## 14. Google Apps Script Setup

1. Create a Google Sheet.
2. Open Extensions > Apps Script.
3. Paste `google-apps-script/Code.gs`.
4. Deploy as Web App.
5. Use the `/exec` URL.
6. Paste URL into Slev Settings.
7. Confirm a transaction or use Quick Add.
8. Check the `Transactions` sheet.

Recommended Web App settings for personal testing:

```txt
Execute as: Me
Who has access: Anyone with the link
```

For stricter personal use, keep access more limited and test whether Android fetch can reach it.

## 15. Extension Guidelines

### Adding a New Built-In Source

Edit:

```txt
src/data/catalog.ts
```

Add source:

```ts
{
  id: "new-source",
  label: "New Source",
  keywords: ["new source", "package.name"],
  enabled: true,
  builtIn: true
}
```

Rules:

- `id` must be stable.
- Include package name when known.
- Include visible app label.
- Avoid broad keywords that match unrelated apps.

### Adding Parser Rules

Edit:

```txt
src/lib/transactionParser.ts
```

Prefer:

- Small regex additions.
- Source-specific keyword improvements.
- Extra merchant stop words.

Avoid:

- Storing raw notification text.
- Adding AI calls in parser.
- Overly broad financial detection that captures non-finance notifications.

### Adding Category Keywords

Edit `CATEGORY_KEYWORDS` in:

```txt
src/lib/transactionParser.ts
```

Keep category inference conservative. Wrong categories are worse than `Other` because the review flow can correct `Other` quickly.

### Adding New Sync Fields

Update all three locations:

1. `src/services/googleSheetsSync.ts`
2. `google-apps-script/Code.gs`
3. This specification

Do not add raw notification fields.

## 16. Known Boundaries

- Expo Go cannot test notification listener.
- Native listener currently emits while React Native context is available.
- Offline sync queue has no exponential backoff yet.
- Category learning per merchant is not implemented.
- Widgets are not implemented.
- AI insights are intentionally deferred.

## 17. Recommended Next Steps

### High Priority

- Device-test notification listener with real BRImo notifications.
- Add source package-name confirmation for BRImo from real device logs.
- Add a few real notification samples to parser smoke tests after redacting sensitive data.
- Add merchant learning: if user changes category for merchant, remember that mapping.

### Medium Priority

- Offline sync retry with backoff.
- Better failed sync detail UI.
- Better onboarding for Notification Access permission.
- Export/open sheet link action in Settings.

### Low Priority

- Android widget.
- Looker Studio template.
- AI insight layer.

## 18. Acceptance Checklist

Use this checklist before calling the MVP stable:

- App starts with `npm run android`.
- Notification Access screen opens from Settings.
- Real finance notification creates a draft.
- OTP/balance/account notifications are ignored.
- Draft can be confirmed in under 3 seconds.
- Category can be edited before confirm.
- Quick Add can save a manual transaction.
- Confirmed transaction appears on Home.
- Confirmed transaction appears in Trends.
- Apps Script `/exec` URL syncs confirmed transaction.
- Duplicate sync does not duplicate rows.
- `npm run typecheck` passes.
- `npm run parser:smoke` passes.
- `npm audit` reports 0 vulnerabilities.
- Android debug APK builds.
