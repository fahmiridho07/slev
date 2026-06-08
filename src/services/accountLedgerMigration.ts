import { MoneyAccount } from "../features/spendingMemory.types";
import { listMoneyAccounts } from "./accountRepository";
import { getBalanceAnchor } from "./balanceAnchorRepository";
import { listSpendingMoments, persistSpendingMomentsForMigration } from "./spendingMemoryRepository";
import { readJson, writeJson } from "./storage";
import { STORAGE_KEYS } from "./storageSchema";

export async function runAccountLedgerV3Migration(): Promise<void> {
  const accounts = await listMoneyAccounts();
  const hub = accounts.find((account) => account.isIncomeHub);
  if (!hub) {
    throw new Error("No income hub account found during account ledger V3 migration");
  }

  const anchor = await getBalanceAnchor();
  let accountsDirty = await rawAccountsMissingOpeningFields();

  const updatedAccounts: MoneyAccount[] = accounts.map((account) => {
    if (account.isIncomeHub && anchor && account.openingBalance === 0) {
      accountsDirty = true;
      return {
        ...account,
        openingBalance: anchor.amount,
        openingSetAt: anchor.setAt
      };
    }
    return account;
  });

  if (accountsDirty) {
    const persisted = await writeJson(STORAGE_KEYS.accounts, updatedAccounts);
    if (!persisted) {
      throw new Error("Failed to persist money accounts during account ledger V3 migration");
    }
  }

  const moments = await listSpendingMoments();
  const hubLabel = hub.label;
  let momentsDirty = false;
  const updatedMoments = moments.map((moment) => {
    if (moment.accountLabel) return moment;
    momentsDirty = true;
    return { ...moment, accountLabel: hubLabel };
  });

  if (momentsDirty) {
    await persistSpendingMomentsForMigration(updatedMoments);
  }
}

async function rawAccountsMissingOpeningFields(): Promise<boolean> {
  const result = await readJson<unknown>(STORAGE_KEYS.accounts);
  if (result.status !== "ok" || !Array.isArray(result.value) || result.value.length === 0) {
    return false;
  }

  return result.value.some((item) => {
    if (!item || typeof item !== "object") return true;
    const record = item as Record<string, unknown>;
    return !("openingBalance" in record) || !("openingSetAt" in record);
  });
}