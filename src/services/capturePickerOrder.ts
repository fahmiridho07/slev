import { readRaw, writeRaw } from "./storage";

const CAPTURE_PICKER_ORDER_KEY = "slev_ui_capture_picker_order";

export type CapturePickerOrder = {
  accountKeys: string[];
  categoryKeys: string[];
};

const EMPTY_ORDER: CapturePickerOrder = {
  categoryKeys: [],
  accountKeys: []
};

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export async function getCapturePickerOrder(): Promise<CapturePickerOrder> {
  const stored = await readRaw(CAPTURE_PICKER_ORDER_KEY);
  if (!stored) {
    return EMPTY_ORDER;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<CapturePickerOrder>;
    return {
      categoryKeys: parseStringArray(parsed.categoryKeys),
      accountKeys: parseStringArray(parsed.accountKeys)
    };
  } catch {
    return EMPTY_ORDER;
  }
}

export async function setCapturePickerOrder(order: CapturePickerOrder): Promise<boolean> {
  return writeRaw(
    CAPTURE_PICKER_ORDER_KEY,
    JSON.stringify({
      categoryKeys: order.categoryKeys,
      accountKeys: order.accountKeys
    })
  );
}