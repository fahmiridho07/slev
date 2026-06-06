import { CategoryMode, EntryType } from "./spendingMemory.types";
import { FinanceMonthSummary } from "../lib/financeEngine";

export type CaptureType = EntryType | "transfer";
export type CategoryModeValue = CategoryMode["mode"];
export type MonthlySummary = FinanceMonthSummary;
export type PatternTabKey = "overview" | "breakdown" | "accounts" | "trends";
export type BudgetTabKey = "limits" | "plan" | "goals" | "balance";