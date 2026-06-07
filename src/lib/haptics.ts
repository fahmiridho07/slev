import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

function canUseHaptics() {
  return Platform.OS === "ios" || Platform.OS === "android";
}

export function hapticLight() {
  if (!canUseHaptics()) {
    return;
  }
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticSelection() {
  if (!canUseHaptics()) {
    return;
  }
  void Haptics.selectionAsync();
}

export function hapticSuccess() {
  if (!canUseHaptics()) {
    return;
  }
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function hapticWarning() {
  if (!canUseHaptics()) {
    return;
  }
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}