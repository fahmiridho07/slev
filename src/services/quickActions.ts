import type { AppStrings } from "../i18n/types";

// Metro provides require at runtime; declared here so the test tsconfig (no node types) accepts it.
declare const require: (moduleId: string) => unknown;

const CAPTURE_ACTION_ID = "capture";
const CAPTURE_URL = "slev://home/capture";

type QuickActionItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  params?: Record<string, string>;
};

type QuickActionsModule = {
  initial?: QuickActionItem | null;
  addListener: (listener: (action: QuickActionItem) => void) => { remove: () => void };
  setItems: (items: QuickActionItem[]) => Promise<void> | void;
};

function loadModule(): QuickActionsModule | null {
  try {
    // Native module is absent in Expo Go / web; the app should keep working without it.
    return require("expo-quick-actions") as QuickActionsModule;
  } catch {
    return null;
  }
}

export function getQuickActionUrl(action: QuickActionItem): string | null {
  if (action.params?.href) {
    return action.params.href;
  }
  return action.id === CAPTURE_ACTION_ID ? CAPTURE_URL : null;
}

/** Registers the launcher shortcut items with localized labels. */
export async function syncQuickActions(strings: AppStrings): Promise<void> {
  const quickActions = loadModule();
  if (!quickActions) {
    return;
  }

  try {
    await quickActions.setItems([
      {
        id: CAPTURE_ACTION_ID,
        title: strings.quickActions.captureTitle,
        subtitle: strings.quickActions.captureSubtitle,
        params: { href: CAPTURE_URL }
      }
    ]);
  } catch {
    // Leave shortcuts unchanged when the platform rejects them.
  }
}

/**
 * Invokes `onUrl` for the launch shortcut (if any) and future shortcut presses.
 * Returns an unsubscribe function.
 */
export function subscribeQuickActions(onUrl: (url: string) => void): () => void {
  const quickActions = loadModule();
  if (!quickActions) {
    return () => {};
  }

  try {
    const initialUrl = quickActions.initial ? getQuickActionUrl(quickActions.initial) : null;
    if (initialUrl) {
      onUrl(initialUrl);
    }

    const subscription = quickActions.addListener((action) => {
      const url = getQuickActionUrl(action);
      if (url) {
        onUrl(url);
      }
    });
    return () => subscription.remove();
  } catch {
    return () => {};
  }
}
