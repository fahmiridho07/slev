import { DEFAULT_SOURCES, SOURCE_LABELS } from "../data/catalog";
import {
  FinanceSource,
  NotificationPayload,
  ParsedTransaction,
  SourceAppId,
  TransactionCategory,
  TransactionMethod
} from "../features/transactions.types";

type ParseResult =
  | {
      ok: true;
      transaction: ParsedTransaction;
    }
  | {
      ok: false;
      reason: string;
    };

type ParseOptions = {
  sources?: FinanceSource[];
};

const SENSITIVE_PATTERNS = [
  /\botp\b/i,
  /one[-\s]?time password/i,
  /kode\s+(rahasia|verifikasi|otp|akses|token)/i,
  /\bpin\b/i,
  /\bpassword\b/i,
  /\btoken\b/i,
  /\bno\.?\s*rek/i,
  /\brekening\b/i,
  /\baccount\b/i,
  /\bsaldo\b/i,
  /\bbalance\b/i
];

const AMOUNT_PATTERNS = [
  /(?:rp|idr)\s*([0-9][0-9.\s,]*)/i,
  /([0-9][0-9.\s,]*)\s*(?:rupiah|idr)/i
];

const CATEGORY_KEYWORDS: Record<TransactionCategory, string[]> = {
  Food: [
    "ayam",
    "bakso",
    "burger",
    "food",
    "geprek",
    "martabak",
    "mie",
    "nasi",
    "pizza",
    "resto",
    "sate",
    "warung"
  ],
  Coffee: ["coffee", "kopi", "kenangan", "janji jiwa", "starbucks"],
  Transport: ["bluebird", "grab", "gojek", "maxim", "parking", "parkir", "taxi", "tol"],
  Groceries: ["alfamart", "familymart", "indomaret", "superindo", "transmart"],
  Bills: ["bpjs", "internet", "listrik", "pdam", "pln", "pulsa", "tagihan"],
  Shopping: ["lazada", "shopee", "tokopedia", "zalora"],
  Entertainment: ["bioskop", "cinema", "game", "netflix", "spotify", "xxi"],
  Health: ["apotek", "clinic", "klinik", "obat", "pharmacy"],
  Education: ["book", "buku", "course", "kampus", "kelas", "udemy"],
  Transfer: ["transfer"],
  Other: []
};

export function parseFinancialNotification(payload: NotificationPayload, options: ParseOptions = {}): ParseResult {
  const rawText = normalizeWhitespace(`${payload.title ?? ""} ${payload.body}`);

  if (!rawText) {
    return { ok: false, reason: "Notification text is empty." };
  }

  if (containsSensitiveSignal(rawText)) {
    return { ok: false, reason: "Skipped because the notification looks sensitive." };
  }

  const sources = options.sources ?? DEFAULT_SOURCES;

  if (!looksFinancial(rawText, payload.packageName, sources)) {
    return { ok: false, reason: "Skipped because this does not look like a finance notification." };
  }

  const amount = extractAmount(rawText);
  if (!amount) {
    return { ok: false, reason: "No Rupiah amount found." };
  }

  const source = detectSource(payload.packageName, rawText, sources);
  const sourceLabel = getSourceLabel(source, sources);
  const method = detectMethod(rawText, source);
  const merchant = extractMerchant(rawText) ?? sourceLabel;
  const category = inferCategory(merchant, rawText, method);
  const transactionType = inferTransactionType(rawText, method);
  const confidence = calculateConfidence({ merchant, source, sourceLabel, method, category });

  return {
    ok: true,
    transaction: {
      amount,
      merchant,
      category,
      method,
      source,
      sourceLabel,
      transactionType,
      timestamp: payload.receivedAt ?? new Date().toISOString(),
      confidence
    }
  };
}

export function containsSensitiveSignal(text: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(text));
}

export function extractAmount(text: string): number | null {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const digitsOnly = match[1].replace(/[^\d]/g, "");
      const amount = Number.parseInt(digitsOnly, 10);
      if (Number.isFinite(amount) && amount > 0) {
        return amount;
      }
    }
  }

  return null;
}

export function detectSource(
  packageName = "",
  text = "",
  sources: FinanceSource[] = DEFAULT_SOURCES
): SourceAppId {
  const value = `${packageName} ${text}`.toLowerCase();

  const source = sources.find((item) =>
    [item.label, item.id, ...item.keywords].some((keyword) => value.includes(keyword.toLowerCase()))
  );
  if (source) return source.id;

  return "unknown";
}

export function detectMethod(text: string, source: SourceAppId): TransactionMethod {
  const value = text.toLowerCase();

  if (value.includes("qris")) return "QRIS";
  if (value.includes("debit")) return "Debit";
  if (value.includes("transfer")) return "Transfer";
  if (value.includes("top up") || value.includes("topup")) return "Top up";
  if (["dana", "gopay", "shopeepay", "ovo"].includes(source)) return "E-wallet";

  return "Unknown";
}

export function inferCategory(
  merchant: string,
  text: string,
  method: TransactionMethod
): TransactionCategory {
  if (method === "Transfer") return "Transfer";

  const haystack = `${merchant} ${text}`.toLowerCase();
  const categories = Object.entries(CATEGORY_KEYWORDS) as [TransactionCategory, string[]][];
  const match = categories.find(([category, keywords]) => {
    if (category === "Other") return false;
    return keywords.some((keyword) => haystack.includes(keyword));
  });

  return match?.[0] ?? "Other";
}

function extractMerchant(text: string): string | null {
  const patterns = [
    /\bdi\s+(.+?)(?:\s+(?:berhasil|sukses|via|pada|tanggal|tgl|sebesar)\b|$)/i,
    /\bke\s+(.+?)(?:\s+(?:berhasil|sukses|via|pada|tanggal|tgl|sebesar)\b|$)/i,
    /\bmerchant\s+(.+?)(?:\s+(?:berhasil|sukses|via|pada|tanggal|tgl)\b|$)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const cleaned = cleanMerchant(match[1]);
      if (cleaned) return cleaned;
    }
  }

  return null;
}

function cleanMerchant(value: string): string {
  const withoutAmount = value.replace(/(?:rp|idr)\s*[0-9][0-9.\s,]*/gi, "");
  const normalized = normalizeWhitespace(withoutAmount.replace(/[.:,;]+$/g, ""));
  const limited = normalized.split(/\s+/).slice(0, 6).join(" ");

  return toTitleCase(limited);
}

function inferTransactionType(text: string, method: TransactionMethod): ParsedTransaction["transactionType"] {
  const value = text.toLowerCase();

  if (value.includes("masuk") || value.includes("diterima") || value.includes("refund")) {
    return "income";
  }

  if (method === "Transfer") {
    return "transfer";
  }

  if (
    value.includes("bayar") ||
    value.includes("pembayaran") ||
    value.includes("transaksi") ||
    value.includes("debit")
  ) {
    return "expense";
  }

  return "unknown";
}

function calculateConfidence(parts: {
  merchant: string;
  source: SourceAppId;
  sourceLabel: string;
  method: TransactionMethod;
  category: TransactionCategory;
}): number {
  let score = 0.45;

  if (parts.merchant && parts.merchant !== parts.sourceLabel) score += 0.2;
  if (parts.source !== "unknown") score += 0.15;
  if (parts.method !== "Unknown") score += 0.1;
  if (parts.category !== "Other") score += 0.1;

  return Math.min(score, 0.98);
}

function looksFinancial(text: string, packageName = "", sources: FinanceSource[] = DEFAULT_SOURCES): boolean {
  const value = `${packageName} ${text}`.toLowerCase();
  const sourceKeywords = sources.flatMap((source) => [source.id, source.label, ...source.keywords]);

  return [
    ...sourceKeywords,
    "bri",
    "brimo",
    "rp",
    "idr",
    "qris",
    "transaksi",
    "pembayaran"
  ].some((keyword) => value.includes(keyword.toLowerCase()));
}

function getSourceLabel(source: SourceAppId, sources: FinanceSource[]): string {
  return sources.find((item) => item.id === source)?.label ?? SOURCE_LABELS[source] ?? "Unknown";
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}
