import { formatString } from "../../i18n";
import { displayContext } from "../../i18n/display";
import { AppStrings } from "../../i18n/types";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { CaptureType } from "../app.types";
import { SpendingContext } from "../spendingMemory.types";
import { formatCaptureDateLabel } from "./captureDate";

export type CaptureSaveAck = {
  amount: number;
  context?: SpendingContext;
  entryType: CaptureType;
  fromAccount?: string;
  label?: string;
  occurredAtKey: string | null;
  source?: string;
  toAccount?: string;
};

function withDateSuffix(message: string, occurredAtKey: string | null, strings: AppStrings): string {
  const dateLabel = formatCaptureDateLabel(occurredAtKey);
  if (!dateLabel) {
    return message;
  }
  return formatString(strings.capture.savedBannerWithDate, { message, date: dateLabel });
}

export function buildCaptureSaveAckBanner(ack: CaptureSaveAck, strings: AppStrings): string {
  const amount = formatRupiah(ack.amount);
  const captureStrings = strings.capture;

  if (ack.entryType === "transfer") {
    return withDateSuffix(
      formatString(captureStrings.savedBannerTransfer, {
        amount,
        from: ack.fromAccount ?? "",
        to: ack.toAccount ?? ""
      }),
      ack.occurredAtKey,
      strings
    );
  }

  if (ack.entryType === "income") {
    const name = ack.source?.trim();
    return withDateSuffix(
      name
        ? formatString(captureStrings.savedBannerIncomeNamed, { amount, name })
        : formatString(captureStrings.savedBannerIncome, { amount }),
      ack.occurredAtKey,
      strings
    );
  }

  const name = ack.label?.trim() || (ack.context ? displayContext(ack.context) : "");
  return withDateSuffix(
    name
      ? formatString(captureStrings.savedBannerExpenseNamed, { amount, name })
      : formatString(captureStrings.savedBannerExpense, { amount }),
    ack.occurredAtKey,
    strings
  );
}