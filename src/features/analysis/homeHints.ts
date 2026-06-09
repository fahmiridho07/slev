import { SettingsTabKey } from "../app.types";
import { MoneyAccount, MoneyTransfer, RecurringBill, SpendingMoment } from "../spendingMemory.types";
import { formatString } from "../../i18n";
import type { AppStrings } from "../../i18n/types";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { getHomeSetupHints, HomeSetupHint } from "../../lib/homeSetup";
import type { SafeToSpendPace, SafeToSpendResult } from "../../lib/safeToSpend";

export type HomeHintItemKind = "text" | "callout" | "definition" | "fact" | "action";

export type HomeHintItem = {
  actionA11y?: string;
  actionLabel?: string;
  actionTab?: SettingsTabKey;
  id: string;
  kind?: HomeHintItemKind;
  message: string;
  title?: string;
};

export type HomeHintSection = {
  items: HomeHintItem[];
  key: string;
  title?: string;
};

function splitDefinitionCopy(message: string): { body: string; title: string } {
  const separator = " — ";
  const index = message.indexOf(separator);
  if (index === -1) {
    return { title: "", body: message };
  }

  return {
    title: message.slice(0, index),
    body: message.slice(index + separator.length)
  };
}

function getPaceLabel(pace: SafeToSpendPace, copy: AppStrings["home"]["safeToSpend"]): string {
  if (pace === "under") {
    return copy.paceUnder;
  }
  if (pace === "over") {
    return copy.paceOver;
  }
  if (pace === "even") {
    return copy.paceEven;
  }
  return copy.paceUnknown;
}

function setupHintItem(
  hint: HomeSetupHint,
  strings: AppStrings
): HomeHintItem {
  const setup = strings.home.setup;
  const safe = strings.home.safeToSpend;

  if (hint.type === "payday") {
    return {
      id: "setup-payday",
      kind: "action",
      message: safe.paydayHint,
      actionLabel: safe.paydayHintAction,
      actionA11y: safe.paydayHintA11y,
      actionTab: "accounts"
    };
  }

  if (hint.type === "opening_balance") {
    return {
      id: "setup-opening-balance",
      kind: "action",
      message: setup.openingBalanceHint,
      actionLabel: setup.openingBalanceAction,
      actionA11y: setup.openingBalanceA11y,
      actionTab: "accounts"
    };
  }

  if (hint.type === "bills") {
    return {
      id: "setup-bills",
      kind: "action",
      message: setup.billsHint,
      actionLabel: setup.billsAction,
      actionA11y: setup.billsA11y,
      actionTab: "bills"
    };
  }

  return {
    id: "setup-overdue-bills",
    kind: "action",
    message: formatString(setup.overdueBillsHint, { count: hint.count ?? 0 }),
    actionLabel: setup.overdueBillsAction,
    actionA11y: setup.overdueBillsA11y,
    actionTab: "bills"
  };
}

export function buildHomeHintSections({
  accounts,
  moments,
  paydayDayOfMonth,
  recurringBills,
  safe,
  strings,
  transfers
}: {
  accounts: MoneyAccount[];
  moments: SpendingMoment[];
  paydayDayOfMonth: number | null;
  recurringBills: RecurringBill[];
  safe: SafeToSpendResult;
  strings: AppStrings;
  transfers: MoneyTransfer[];
}): HomeHintSection[] {
  const copy = strings.home.safeToSpend;
  const hints = strings.home.hints;
  const sections: HomeHintSection[] = [];

  sections.push({
    key: "balance",
    title: hints.balanceSection,
    items: [{ id: "spendable-helper", kind: "text", message: copy.spendableHelper }]
  });

  const paceDefinitions = [
    hints.paceUnderExplain,
    hints.paceOverExplain,
    hints.paceEvenExplain,
    hints.paceUnknownExplain
  ].map((message, index) => {
    const { title, body } = splitDefinitionCopy(message);
    return {
      id: `pace-type-${index}`,
      kind: "definition" as const,
      title,
      message: body
    };
  });

  sections.push({
    key: "pace",
    title: hints.paceSection,
    items: [
      { id: "pace-intro", kind: "text", message: hints.paceIntro },
      {
        id: "pace-current",
        kind: "callout",
        message: getPaceLabel(safe.pace, copy),
        title: hints.paceNowLabel
      },
      ...paceDefinitions
    ]
  });

  const detailItems: HomeHintItem[] = [
    {
      id: "typical-daily",
      kind: "fact",
      message: [
        formatString(copy.typicalDaily, { amount: formatRupiah(safe.typicalDaily) }),
        !safe.confident ? copy.typicalDailyUncertain : null
      ]
        .filter(Boolean)
        .join(" · ")
    }
  ];

  if (safe.billsReserve > 0) {
    detailItems.push({
      id: "bills-reserve",
      kind: "fact",
      message: formatString(copy.billsReserve, { amount: formatRupiah(safe.billsReserve) })
    });
  }

  if (safe.spendBuffer > 0) {
    detailItems.push({
      id: "spend-buffer",
      kind: "fact",
      message: formatString(copy.spendBuffer, { amount: formatRupiah(safe.spendBuffer) })
    });
  }

  if (detailItems.length > 0) {
    sections.push({
      key: "details",
      title: hints.detailsSection,
      items: detailItems
    });
  }

  const setupHints = getHomeSetupHints({
    accounts,
    moments,
    paydayDayOfMonth,
    recurringBills,
    transfers
  });

  if (setupHints.length > 0) {
    sections.push({
      key: "setup",
      title: hints.setupSection,
      items: setupHints.map((hint) => setupHintItem(hint, strings))
    });
  }

  return sections;
}

export function hasActionableHomeHints({
  accounts,
  moments,
  paydayDayOfMonth,
  recurringBills,
  transfers
}: {
  accounts: MoneyAccount[];
  moments: SpendingMoment[];
  paydayDayOfMonth: number | null;
  recurringBills: RecurringBill[];
  transfers: MoneyTransfer[];
}): boolean {
  return (
    getHomeSetupHints({
      accounts,
      moments,
      paydayDayOfMonth,
      recurringBills,
      transfers
    }).length > 0
  );
}