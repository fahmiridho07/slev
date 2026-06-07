import { en } from "./en";
import { id } from "./id";
import type { AppStrings, Locale } from "./types";

export { getCategoryDeleteMessage } from "./dialogs";
export { formatString, plural } from "./format";
export { getRuntimeLocale, getRuntimeStrings, setRuntimeLocale } from "./runtime";
export type { AppStrings, ListHintCopy, Locale } from "./types";

export function getStrings(locale: Locale): AppStrings {
  return locale === "id" ? id : en;
}