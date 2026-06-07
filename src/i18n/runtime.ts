import { getStrings } from "./index";
import type { AppStrings, Locale } from "./types";

let runtimeLocale: Locale = "en";

export function setRuntimeLocale(locale: Locale) {
  runtimeLocale = locale;
}

export function getRuntimeLocale(): Locale {
  return runtimeLocale;
}

export function getRuntimeStrings(): AppStrings {
  return getStrings(runtimeLocale);
}