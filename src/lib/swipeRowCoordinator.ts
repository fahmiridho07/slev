let activeClose: (() => void) | null = null;

export function requestSwipeOpen(close: () => void): void {
  if (activeClose && activeClose !== close) {
    activeClose();
  }
  activeClose = close;
}

export function releaseSwipeOpen(close: () => void): void {
  if (activeClose === close) {
    activeClose = null;
  }
}