export const ImpactFeedbackStyle = {
  Light: "light"
};

export const NotificationFeedbackType = {
  Success: "success",
  Warning: "warning"
};

export async function impactAsync(_style?: string): Promise<void> {}

export async function selectionAsync(): Promise<void> {}

export async function notificationAsync(_type?: string): Promise<void> {}