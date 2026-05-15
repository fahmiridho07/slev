import { FinanceSource, SourceAppId, TransactionCategory, TransactionMethod } from "../features/transactions.types";

export const CATEGORIES: TransactionCategory[] = [
  "Food",
  "Coffee",
  "Transport",
  "Groceries",
  "Bills",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Transfer",
  "Other"
];

export const MANUAL_METHODS: TransactionMethod[] = ["QRIS", "E-wallet", "Cash", "Transfer"];

export const DEFAULT_SOURCES: FinanceSource[] = [
  {
    id: "brimo",
    label: "BRImo",
    keywords: ["brimo", "bri", "bank bri", "id.co.bri.brimo"],
    enabled: true,
    builtIn: true,
    toString() {
      return "brimo";
    }
  },
  {
    id: "dana",
    label: "DANA",
    keywords: ["dana", "id.dana"],
    enabled: true,
    builtIn: true,
    toString() {
      return "dana";
    }
  },
  {
    id: "gopay",
    label: "GoPay",
    keywords: ["gopay", "gojek", "com.gojek"],
    enabled: true,
    builtIn: true,
    toString() {
      return "gopay";
    }
  },
  {
    id: "shopeepay",
    label: "ShopeePay",
    keywords: ["shopeepay", "shopee", "com.shopee"],
    enabled: true,
    builtIn: true,
    toString() {
      return "shopeepay";
    }
  },
  {
    id: "ovo",
    label: "OVO",
    keywords: ["ovo", "ovo.id"],
    enabled: true,
    builtIn: true,
    toString() {
      return "ovo";
    }
  }
];

export const SOURCE_LABELS: Record<SourceAppId, string> = {
  ...Object.fromEntries(DEFAULT_SOURCES.map((source) => [source.id, source.label])),
  unknown: "Unknown"
};

export const SAMPLE_NOTIFICATIONS = [
  "BRImo: Transaksi QRIS Rp18.000 di AYAM GEPREK berhasil",
  "BRI: Pembayaran Rp35.500 di KOPI KENANGAN sukses",
  "BRImo: Transaksi Debit Rp72.000 di INDOMARET berhasil",
  "DANA: Pembayaran Rp25.000 ke WARUNG NASI via QRIS berhasil",
  "GoPay: Kamu bayar Rp22.000 di TOKO ROTI via QRIS",
  "OVO: Transaksi sebesar Rp48.000 di GRAB berhasil"
];
