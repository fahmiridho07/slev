const SHEET_NAME = "Transactions";
const HEADERS = [
  "Date",
  "Merchant",
  "Category",
  "Amount",
  "Method",
  "Source",
  "Type",
  "Confidence",
  "SlevId",
  "ConfirmedAt",
  "SyncedAt"
];

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const transaction = validatePayload(payload);
    const sheet = getTransactionSheet();
    const duplicateRow = findExistingRow(sheet, transaction.id);

    if (duplicateRow > 0) {
      return jsonResponse({
        ok: true,
        duplicate: true,
        row: duplicateRow
      });
    }

    sheet.appendRow([
      new Date(transaction.date),
      transaction.merchant,
      transaction.category,
      transaction.amount,
      transaction.method,
      transaction.source,
      transaction.transactionType,
      transaction.confidence,
      transaction.id,
      transaction.confirmedAt ? new Date(transaction.confirmedAt) : "",
      new Date()
    ]);

    return jsonResponse({
      ok: true,
      duplicate: false,
      row: sheet.getLastRow()
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error.message || "Unknown sync error."
    });
  }
}

function doGet() {
  return jsonResponse({
    ok: true,
    name: "Slev Sheets Sync",
    sheetName: SHEET_NAME
  });
}

function validatePayload(payload) {
  const required = ["id", "date", "merchant", "category", "amount", "method", "source"];

  required.forEach(function (field) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
      throw new Error("Missing field: " + field);
    }
  });

  if (typeof payload.amount !== "number" || payload.amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }

  return {
    id: String(payload.id),
    date: String(payload.date),
    merchant: String(payload.merchant).slice(0, 120),
    category: String(payload.category).slice(0, 60),
    amount: payload.amount,
    method: String(payload.method).slice(0, 40),
    source: String(payload.source).slice(0, 60),
    transactionType: String(payload.transactionType || "unknown").slice(0, 40),
    confidence: Number(payload.confidence || 0),
    confirmedAt: payload.confirmedAt ? String(payload.confirmedAt) : ""
  };
}

function getTransactionSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function findExistingRow(sheet, slevId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const idColumn = HEADERS.indexOf("SlevId") + 1;
  const values = sheet.getRange(2, idColumn, lastRow - 1, 1).getValues();

  for (let index = 0; index < values.length; index += 1) {
    if (String(values[index][0]) === slevId) {
      return index + 2;
    }
  }

  return -1;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
