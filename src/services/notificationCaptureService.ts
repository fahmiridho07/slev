import { NativeEventEmitter, NativeModules, Platform } from "react-native";
import { NotificationPayload } from "../features/transactions.types";
import { parseFinancialNotification } from "../lib/transactionParser";

type NativeNotificationModule = {
  isPermissionGranted?: () => Promise<boolean>;
  openPermissionSettings?: () => Promise<void>;
  startListening?: () => Promise<void>;
  stopListening?: () => Promise<void>;
};

type Subscription = {
  remove: () => void;
};

const nativeModule = NativeModules.SlevNotificationListener as
  | NativeNotificationModule
  | undefined;

export const notificationCaptureService = {
  async isAvailable(): Promise<boolean> {
    return Platform.OS === "android" && Boolean(nativeModule);
  },

  async isPermissionGranted(): Promise<boolean> {
    if (!nativeModule?.isPermissionGranted) return false;
    return nativeModule.isPermissionGranted();
  },

  async openPermissionSettings(): Promise<void> {
    if (nativeModule?.openPermissionSettings) {
      await nativeModule.openPermissionSettings();
    }
  },

  async start(): Promise<void> {
    if (nativeModule?.startListening) {
      await nativeModule.startListening();
    }
  },

  async stop(): Promise<void> {
    if (nativeModule?.stopListening) {
      await nativeModule.stopListening();
    }
  },

  subscribe(onPayload: (payload: NotificationPayload) => void): Subscription {
    if (!nativeModule || Platform.OS !== "android") {
      return { remove: () => undefined };
    }

    const emitter = new NativeEventEmitter(nativeModule as any);
    const subscription = emitter.addListener("SlevNotificationReceived", onPayload);

    return {
      remove: () => subscription.remove()
    };
  }
};

export function previewNotification(payload: NotificationPayload) {
  return parseFinancialNotification(payload);
}
