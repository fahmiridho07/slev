import { MoneyAccount, MoneyTransfer, SpendingMoment } from "../features/spendingMemory.types";

export function getAccountBalance(
  account: MoneyAccount,
  moments: SpendingMoment[],
  transfers: MoneyTransfer[]
): number {
  let balance = account.openingBalance;
  const openingTime = Date.parse(account.openingSetAt);

  for (const moment of moments) {
    if (moment.accountLabel !== account.label) continue;
    if (Date.parse(moment.occurredAt) <= openingTime) continue;
    balance += moment.type === "income" ? moment.amount : -moment.amount;
  }

  for (const transfer of transfers) {
    if (Date.parse(transfer.occurredAt) <= openingTime) continue;
    if (transfer.toAccount === account.label) {
      balance += transfer.amount;
    }
    if (transfer.fromAccount === account.label) {
      balance -= transfer.amount;
    }
  }

  return Math.round(balance);
}

export function getAccountBalances(
  accounts: MoneyAccount[],
  moments: SpendingMoment[],
  transfers: MoneyTransfer[]
): Array<{ account: MoneyAccount; balance: number }> {
  return accounts.map((account) => ({
    account,
    balance: getAccountBalance(account, moments, transfers)
  }));
}

export function getTrackedTotalBalance(
  accounts: MoneyAccount[],
  moments: SpendingMoment[],
  transfers: MoneyTransfer[]
): number {
  return Math.round(
    accounts
      .filter((account) => account.tier !== "ephemeral")
      .reduce((total, account) => total + getAccountBalance(account, moments, transfers), 0)
  );
}