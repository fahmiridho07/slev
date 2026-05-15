# MVP Readiness Audit

This audit maps the current Slev build against the original PRD.

## Ready

- Expo React Native TypeScript app.
- Android NotificationListenerService native module.
- Local notification parsing with sensitive-message rejection.
- BRImo, DANA, GoPay, ShopeePay, OVO source defaults.
- Custom notification sources.
- Draft review inbox with confirm, category edit, and ignore.
- Manual quick add fallback.
- Configurable categories.
- Google Apps Script sync to Google Sheets.
- Duplicate protection in Apps Script by `SlevId`.
- Dashboard, 7-day trend, category breakdown, and weekly rule-based insights.
- Local storage migration and malformed-data guards.
- Minimal Android permission surface for the privacy-first MVP.

## Verified

- TypeScript check passes.
- Parser smoke test passes.
- npm audit reports 0 vulnerabilities.
- Native notification listener module compiles.
- Full Android debug APK build succeeds.

## Known Boundaries

- Notification capture works through the native Android development build, not Expo Go.
- Native listener emits notifications while the React Native context is available; deeper background queuing can be added later.
- Weekly insights are rule-based, not AI-based.
- Google Sheets sync requires the user to deploy the included Apps Script and paste the `/exec` URL.

## Future Roadmap Fit

- Merchant learning belongs in phase 2+ polish.
- Offline sync retry with backoff is still future work.
- Android home widget is still future work.
- AI insight layer is intentionally deferred.
