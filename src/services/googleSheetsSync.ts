import { SyncSettings, TransactionDraft } from "../features/transactions.types";

type AppsScriptResponse = {
  ok?: boolean;
  duplicate?: boolean;
  row?: number;
  error?: string;
};

export function hasSyncEndpoint(settings: SyncSettings): boolean {
  return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/i.test(settings.endpointUrl.trim());
}

export async function syncTransactionToSheets(
  transaction: TransactionDraft,
  settings: SyncSettings
): Promise<AppsScriptResponse> {
  if (!hasSyncEndpoint(settings)) {
    throw new Error("Add a valid Google Apps Script Web App URL first.");
  }

  const response = await fetch(settings.endpointUrl.trim(), {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      id: transaction.id,
      date: transaction.timestamp,
      merchant: transaction.merchant,
      category: transaction.category,
      amount: transaction.amount,
      method: transaction.method,
      source: transaction.sourceLabel,
      transactionType: transaction.transactionType,
      confidence: transaction.confidence,
      confirmedAt: transaction.updatedAt
    })
  });

  const text = await response.text();
  const payload = parseResponse(text);

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error ?? `Sync failed with HTTP ${response.status}.`);
  }

  return payload;
}

function parseResponse(text: string): AppsScriptResponse {
  if (!text.trim()) return { ok: true };

  try {
    return JSON.parse(text) as AppsScriptResponse;
  } catch {
    return { ok: false, error: "Apps Script returned an invalid response." };
  }
}
