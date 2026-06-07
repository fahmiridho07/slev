import { formatString } from "../../i18n";
import { displayContext } from "../../i18n/display";
import { AppStrings } from "../../i18n/types";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { CaptureType } from "../app.types";
import { SpendingContext } from "../spendingMemory.types";

export type CaptureSaveAck = {
  amount: number;
  context?: SpendingContext;
  entryType: CaptureType;
  fromAccount?: string;
  label?: string;
  source?: string;
  toAccount?: string;
};

export function buildCaptureSaveAckBanner(ack: CaptureSaveAck, strings: AppStrings): string {
  const amount = formatRupiah(ack.amount);
  const captureStrings = strings.capture;

  if (ack.entryType === "transfer") {
    return formatString(captureStrings.savedBannerTransfer, {
      amount,
      from: ack.fromAccount ?? "",
      to: ack.toAccount ?? ""
    });
  }

  if (ack.entryType === "income") {
    const name = ack.source?.trim();
    return name
      ? formatString(captureStrings.savedBannerIncomeNamed, { amount, name })
      : formatString(captureStrings.savedBannerIncome, { amount });
  }

  const name = ack.label?.trim() || (ack.context ? displayContext(ack.context) : "");
  return name
    ? formatString(captureStrings.savedBannerExpenseNamed, { amount, name })
    : formatString(captureStrings.savedBannerExpense, { amount });
}