export function applyItemOrder<T>(items: T[], orderedKeys: string[], getKey: (item: T) => string): T[] {
  if (orderedKeys.length === 0) {
    return items;
  }

  const byKey = new Map(items.map((item) => [getKey(item), item]));
  const ordered: T[] = [];

  for (const key of orderedKeys) {
    const item = byKey.get(key);
    if (item) {
      ordered.push(item);
      byKey.delete(key);
    }
  }

  for (const item of items) {
    if (byKey.has(getKey(item))) {
      ordered.push(item);
    }
  }

  return ordered;
}

export function reorderItemsByKey<T>(
  items: T[],
  fromKey: string,
  toKey: string,
  getKey: (item: T) => string
): T[] {
  if (fromKey === toKey) {
    return items;
  }

  const fromIndex = items.findIndex((item) => getKey(item) === fromKey);
  const toIndex = items.findIndex((item) => getKey(item) === toKey);
  if (fromIndex < 0 || toIndex < 0) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function keysFromItems<T>(items: T[], getKey: (item: T) => string): string[] {
  return items.map(getKey);
}