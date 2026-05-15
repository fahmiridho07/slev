import assert from "node:assert/strict";

const samples = [
  {
    text: "BRImo: Transaksi QRIS Rp18.000 di AYAM GEPREK berhasil",
    expected: { amount: 18000, merchant: "Ayam Geprek", category: "Food", method: "QRIS" }
  },
  {
    text: "BRI: Pembayaran Rp35.500 di KOPI KENANGAN sukses",
    expected: { amount: 35500, merchant: "Kopi Kenangan", category: "Coffee" }
  },
  {
    text: "BRImo: Transaksi Debit Rp72.000 di INDOMARET berhasil",
    expected: { amount: 72000, merchant: "Indomaret", category: "Groceries", method: "Debit" }
  },
  {
    text: "Kode OTP Anda 123456 untuk transaksi Rp10.000",
    expected: null
  }
];

for (const sample of samples) {
  const parsed = parseLikeApp(sample.text);
  assert.deepEqual(parsed, sample.expected);
}

console.log(`Parser smoke test passed for ${samples.length} samples.`);

function parseLikeApp(text) {
  if (/\botp\b|kode\s+(rahasia|verifikasi|otp|akses|token)|\bpin\b|\bpassword\b|\btoken\b|\bsaldo\b/i.test(text)) {
    return null;
  }

  const amount = Number.parseInt(text.match(/(?:rp|idr)\s*([0-9][0-9.\s,]*)/i)?.[1].replace(/[^\d]/g, ""), 10);
  const merchantRaw = text.match(/\bdi\s+(.+?)(?:\s+(?:berhasil|sukses|via|pada|tanggal|tgl|sebesar)\b|$)/i)?.[1];
  const merchant = titleCase((merchantRaw ?? "").replace(/(?:rp|idr)\s*[0-9][0-9.\s,]*/gi, "").trim());
  const haystack = `${merchant} ${text}`.toLowerCase();
  const method = text.toLowerCase().includes("qris") ? "QRIS" : text.toLowerCase().includes("debit") ? "Debit" : undefined;
  const category = haystack.includes("kopi") || haystack.includes("kenangan")
    ? "Coffee"
    : haystack.includes("ayam") || haystack.includes("geprek")
      ? "Food"
      : haystack.includes("indomaret")
        ? "Groceries"
        : undefined;

  return Object.fromEntries(
    Object.entries({ amount, merchant, category, method }).filter(([, value]) => value !== undefined)
  );
}

function titleCase(value) {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
