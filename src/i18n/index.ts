import { en } from "./en";
import { id } from "./id";
import type { AppStrings, Locale } from "./types";

export type { AppStrings, ListHintCopy, Locale } from "./types";

export function getStrings(locale: Locale): AppStrings {
  return locale === "id" ? id : en;
}