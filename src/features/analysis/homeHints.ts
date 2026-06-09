import { SettingsTabKey } from "../app.types";
import { MoneyAccount, MoneyTransfer, RecurringBill, SpendingMoment } from "../spendingMemory.types";
import { formatString } from "../../i18n";
import type { AppStrings } from "../../i18n/types";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { getHomeSetupHints, HomeSetupHint } from "../../lib/homeSetup";
import type { SafeToSpendPace, SafeToSpendResult } from "../../lib/safeToSpend";

export type HomeHintItem = {
  actionA11y?: string;
  actionLabel?: string;
  actionTab?: SettingsTabKey;
  id: string;
  message: string;
};

export type HomeHintSection = {
  items: HomeHintItem[];
  key: string;
  title?: string;
};

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
      message: safe.paydayHint,
      actionLabel: safe.paydayHintAction,
      actionA11y: safe.paydayHintA11y,
      actionTab: "accounts"
    };
  }

  if (hint.type === "opening_balance") {
    return {
      id: "setup-opening-balance",
      message: setup.openingBalanceHint,
      actionLabel: setup.openingBalanceAction,
      actionA11y: setup.openingBalanceA11y,
      actionTab: "accounts"
    };
  }

  if (hint.type === "bills") {
    return {
      id: "setup-bills",
      message: setup.billsHint,
      actionLabel: setup.billsAction,
      actionA11y: setup.billsA11y,
      actionTab: "bills"
    };
  }

  return {
    id: "setup-overdue-bills",
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
    items: [{ id: "spendable-helper", message: copy.spendableHelper }]
  });

  sections.push({
    key: "pace",
    title: hints.paceSection,
    items: [
      { id: "pace-intro", message: hints.paceIntro },
      {
        id: "pace-current",
        message: formatString(hints.paceCurrent, { label: getPaceLabel(safe.pace, copy) })
      },
      { id: "pace-under", message: hints.paceUnderExplain },
      { id: "pace-over", message: hints.paceOverExplain },
      { id: "pace-even", message: hints.paceEvenExplain },
      { id: "pace-unknown", message: hints.paceUnknownExplain }
    ]
  });

  const detailItems: HomeHintItem[] = [
    {
      id: "typical-daily",
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
      message: formatString(copy.billsReserve, { amount: formatRupiah(safe.billsReserve) })
    });
  }

  if (safe.spendBuffer > 0) {
    detailItems.push({
      id: "spend-buffer",
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