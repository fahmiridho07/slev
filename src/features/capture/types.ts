import { CaptureType } from "../app.types";
import { SpendingContext } from "../spendingMemory.types";

export type CaptureFormValues = {
  accountLabel: string;
  amountText: string;
  context: SpendingContext;
  entryType: CaptureType;
  fromAccount: string;
  label: string;
  note: string;
  source: string;
  toAccount: string;
};