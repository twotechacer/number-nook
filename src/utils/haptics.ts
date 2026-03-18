import * as Haptics from 'expo-haptics';

export function hapticTap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function hapticError() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}
