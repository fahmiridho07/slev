import { CategoryMode, EntryType } from "./spendingMemory.types";

export type CaptureType = EntryType | "transfer";
export type CategoryModeValue = CategoryMode["mode"];
export type PatternTabKey = "breakdown" | "accounts";
export type BudgetTabKey = "plan" | "goals" | "balance";
export type SettingsTabKey = "bills" | "categories" | "appearance" | "data";