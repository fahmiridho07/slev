const HORIZONTAL_DOMINANCE = 1.8;
const GESTURE_ACTIVATION_PX = 10;
const OPEN_SWIPE_THRESHOLD_PX = -18;

export function shouldCaptureSwipeGesture(dx: number, dy: number, isOpen: boolean): boolean {
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDy > absDx && absDy > 6) {
    return false;
  }

  if (absDx < GESTURE_ACTIVATION_PX) {
    return false;
  }

  if (absDx <= absDy * HORIZONTAL_DOMINANCE) {
    return false;
  }

  if (isOpen) {
    return true;
  }

  return dx < OPEN_SWIPE_THRESHOLD_PX;
}