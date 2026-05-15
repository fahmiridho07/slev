export type TransactionCategory = string;

export type TransactionMethod =
  | "QRIS"
  | "Debit"
  | "Transfer"
  | "E-wallet"
  | "Cash"
  | "Manual"
  | "Top up"
  | "Unknown";

export type TransactionStatus = "draft" | "confirmed" | "ignored";
export type TransactionSyncStatus = "not_configured" | "pending" | "syncing" | "synced" | "failed";

export type SourceAppId = string;

export type FinanceSource = {
  id: SourceAppId;
  label: string;
  keywords: string[];
  enabled: boolean;
  builtIn?: boolean;
  toString?: () => string;
};

export type NotificationPayload = {
  id?: string;
  title?: string;
  body: string;
  packageName?: string;
  receivedAt?: string;
};

export type ParsedTransaction = {
  amount: number;
  merchant: string;
  category: TransactionCategory;
  method: TransactionMethod;
  source: SourceAppId;
  sourceLabel: string;
  transactionType: "expense" | "income" | "transfer" | "unknown";
  timestamp: string;
  confidence: number;
};

export type TransactionDraft = ParsedTransaction & {
  id: string;
  status: TransactionStatus;
  syncStatus: TransactionSyncStatus;
  syncError?: string;
  syncedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type SourcePreference = {
  id: SourceAppId;
  enabled: boolean;
};

export type SyncSettings = {
  endpointUrl: string;
  sheetUrl: string;
};
