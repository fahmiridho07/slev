import { MoneyTransfer, SpendingMoment } from "../features/spendingMemory.types";
import { dateKey, formatDate, getMonthRange, isWithinRange } from "./analysis";
import { formatRupiah } from "./spendingMemoryPatterns";

export type ActivityFeedItem =
  | { kind: "moment"; id: string; occurredAt: string; moment: SpendingMoment }
  | { kind: "transfer"; id: string; occurredAt: string; transfer: MoneyTransfer };

export type ActivityFeedSection = {
  data: ActivityFeedItem[];
  key: string;
  title: string;
};

export function buildMonthActivityFeed(
  moments: SpendingMoment[],
  transfers: MoneyTransfer[],
  referenceDate: Date
): ActivityFeedItem[] {
  const { end, start } = getMonthRange(referenceDate, 0);
  const items: ActivityFeedItem[] = [];

  for (const moment of moments) {
    if (isWithinRange(moment.occurredAt, start, end)) {
      items.push({ id: moment.id, kind: "moment", moment, occurredAt: moment.occurredAt });
    }
  }

  for (const transfer of transfers) {
    if (isWithinRange(transfer.occurredAt, start, end)) {
      items.push({ id: transfer.id, kind: "transfer", occurredAt: transfer.occurredAt, transfer });
    }
  }

  return items.sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt));
}

export function groupActivityFeedByDate(items: ActivityFeedItem[]): ActivityFeedSection[] {
  const grouped = new Map<string, ActivityFeedItem[]>();

  for (const item of items) {
    const key = dateKey(new Date(item.occurredAt));
    const bucket = grouped.get(key) ?? [];
    bucket.push(item);
    grouped.set(key, bucket);
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([key, data]) => ({
      data,
      key,
      title: formatDate(key)
    }));
}

export function filterActivityFeed(items: ActivityFeedItem[], query: string): ActivityFeedItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return items;
  }

  return items.filter((item) => getActivitySearchHaystack(item).includes(normalized));
}

export function getTransferActivityTitle(transfer: MoneyTransfer): string {
  return `${transfer.fromAccount} → ${transfer.toAccount}`;
}

function getActivitySearchHaystack(item: ActivityFeedItem): string {
  if (item.kind === "moment") {
    const moment = item.moment;
    return [
      moment.label,
      moment.source,
      moment.accountLabel,
      moment.context,
      moment.note,
      moment.type,
      String(moment.amount),
      formatRupiah(moment.amount)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  const transfer = item.transfer;
  return [
    transfer.fromAccount,
    transfer.toAccount,
    transfer.note,
    "transfer",
    String(transfer.amount),
    formatRupiah(transfer.amount)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}