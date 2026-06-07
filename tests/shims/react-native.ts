export const Share = {
  share: async (_options?: { message?: string; title?: string }) => ({ action: "sharedAction" as const })
};

export const Platform = {
  OS: "ios" as const
};

export function findNodeHandle(_node: unknown): number | null {
  return 1;
}