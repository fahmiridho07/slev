# Slev

Phase three of the Automated Financial Tracker PRD.

Slev is a privacy-first passive expense tracker for Android. The name comes from "sleeve", a small place to tuck money safely. This build proves the core loop: a financial notification becomes a structured local transaction draft.

## Current Build Includes

- Expo + React Native + TypeScript app scaffold.
- Rule-based parser for Indonesian banking and e-wallet notifications.
- Local draft transaction list with confirm, ignore, and category edit actions.
- Manual notification text tester for development and parser QA.
- Android notification listener native module scaffold for development builds.
- Privacy-first settings and source toggles.
- Google Sheets sync settings and Apps Script template.
- Analytics tab, weekly insights, and sync health states.

## Run Locally

Install dependencies first:

```bash
npm install
```

Start the app:

```bash
npm run start
```

Run on Android:

```bash
npm run android
```

Run parser smoke tests:

```bash
npm run parser:smoke
```

## Android Notification Listener Note

Android does not allow Expo Go to read notifications from other apps. Slev ships a local native module under `modules/slev-notification-listener` plus a manual raw-notification tester. Use an Android development build, not Expo Go, to exercise the real listener.

The parser intentionally rejects OTP, balance, account-number, and verification-style messages before anything is stored.

## Google Sheets Sync

Apps Script template:

```txt
google-apps-script/Code.gs
```

Deploy it as a Google Apps Script Web App, then paste the `/exec` URL into Slev Settings.

## Readiness

See `docs/mvp-readiness-audit.md` for the current PRD coverage and known boundaries.

## Documentation

Start here:

```txt
docs/project-specification.md
```

Supporting docs:

- `docs/mvp-readiness-audit.md` for PRD coverage and current boundaries.
- `docs/android-notification-listener.md` for native listener details.
- `docs/phase-one.md` for capture/parser build notes.
- `docs/phase-two.md` for Google Sheets sync notes.
- `docs/phase-three.md` for analytics and insight notes.

## Next Phase

Next should add:

- Hardening and device testing for the Android listener bridge.
- Merchant learning for categorization.
- Offline sync retry with backoff.
