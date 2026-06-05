import { MoneyAccount } from "../features/spendingMemory.types";

type AccountBrand = {
  backgroundColor: string;
  borderColor: string;
  foregroundColor: string;
  shortLabel: string;
};

type KnownAccountBrand = AccountBrand & {
  aliases: string[];
};

const KNOWN_ACCOUNT_BRANDS: KnownAccountBrand[] = [
  {
    aliases: ["bri", "bank bri", "rekening bri"],
    backgroundColor: "#edf5ff",
    borderColor: "#c7dcf6",
    foregroundColor: "#155fa8",
    shortLabel: "BRI"
  },
  {
    aliases: ["jago", "bank jago"],
    backgroundColor: "#fff4e7",
    borderColor: "#f3d1a4",
    foregroundColor: "#d96a13",
    shortLabel: "J"
  },
  {
    aliases: ["gopay", "go pay"],
    backgroundColor: "#edf8ff",
    borderColor: "#c9e5f5",
    foregroundColor: "#1677a6",
    shortLabel: "GP"
  },
  {
    aliases: ["ovo"],
    backgroundColor: "#f4edff",
    borderColor: "#d8c7f5",
    foregroundColor: "#5b2fb0",
    shortLabel: "OVO"
  },
  {
    aliases: ["dana"],
    backgroundColor: "#eef5ff",
    borderColor: "#c9daf6",
    foregroundColor: "#1768b8",
    shortLabel: "D"
  },
  {
    aliases: ["shopeepay", "shopee pay", "spay"],
    backgroundColor: "#fff0eb",
    borderColor: "#f3cbbf",
    foregroundColor: "#d9552f",
    shortLabel: "SP"
  },
  {
    aliases: ["cash", "tunai"],
    backgroundColor: "#eef8f0",
    borderColor: "#c7e8cd",
    foregroundColor: "#1f7a4f",
    shortLabel: "Rp"
  }
];

const FALLBACK_BY_KIND: Record<MoneyAccount["kind"], AccountBrand> = {
  bank: {
    backgroundColor: "#edf5ff",
    borderColor: "#c7dcf6",
    foregroundColor: "#4c7d9b",
    shortLabel: "BK"
  },
  cash: {
    backgroundColor: "#eef8f0",
    borderColor: "#c7e8cd",
    foregroundColor: "#1f7a4f",
    shortLabel: "Rp"
  },
  other: {
    backgroundColor: "#f4f1ec",
    borderColor: "#ded6ca",
    foregroundColor: "#68736d",
    shortLabel: "AC"
  },
  wallet: {
    backgroundColor: "#fff8e8",
    borderColor: "#f3dfad",
    foregroundColor: "#b87813",
    shortLabel: "WL"
  }
};

export function getAccountBrand(
  label: string,
  kind: MoneyAccount["kind"] = "other"
): AccountBrand {
  const normalized = normalizeAccountLabel(label);
  const knownBrand = KNOWN_ACCOUNT_BRANDS.find((brand) =>
    brand.aliases.some((alias) => normalized === normalizeAccountLabel(alias))
  );

  if (knownBrand) {
    return knownBrand;
  }

  return {
    ...FALLBACK_BY_KIND[kind],
    shortLabel: getInitials(label, FALLBACK_BY_KIND[kind].shortLabel)
  };
}

function getInitials(label: string, fallback: string): string {
  const words = label
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return fallback;
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function normalizeAccountLabel(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}
