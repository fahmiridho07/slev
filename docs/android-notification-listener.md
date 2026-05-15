# Android Notification Listener Contract

Android blocks third-party notification reads unless the user explicitly enables Notification Access. Expo Go cannot provide that permission because it cannot include a custom `NotificationListenerService`.

This repo includes a local native module package at:

```txt
modules/slev-notification-listener
```

For a development build, the native Android bridge emits this event:

```ts
SlevNotificationReceived
```

Payload shape:

```ts
type NotificationPayload = {
  id?: string;
  title?: string;
  body: string;
  packageName?: string;
  receivedAt?: string;
};
```

The bridge must not send OTP codes, account numbers, balance text, or raw notification history. It should emit only the newest notification payload and let the TypeScript parser decide whether it is safe enough to convert into a draft.

## Native Flow

1. `SlevNotificationListenerService` receives `StatusBarNotification`.
2. It extracts only package name, title, text, and post time.
3. It drops obvious OTP, balance, token, PIN, password, and account messages natively.
4. It emits `SlevNotificationReceived` to React Native.
5. The TypeScript parser performs the second privacy check before storing a draft.
6. Raw notification text is never persisted by the native module.

## Expected Native Module Methods

`src/services/notificationCaptureService.ts` already looks for a module named:

```ts
SlevNotificationListener
```

Expected methods:

```ts
isPermissionGranted(): Promise<boolean>
openPermissionSettings(): Promise<void>
startListening(): Promise<void>
stopListening(): Promise<void>
```

Run it with an Android development build:

```bash
npm install
npm run android
```

Then enable Slev in Android Notification Access settings.
