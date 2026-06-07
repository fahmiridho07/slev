export function getMonthStartMs(reference = new Date()): number {
  return new Date(reference.getFullYear(), reference.getMonth(), 1).getTime();
}