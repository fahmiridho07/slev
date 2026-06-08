import { getDefaultToastMessage } from "../i18n/toasts";
import { BalanceAnchor } from "../services/balanceAnchorRepository";
import {
  BudgetLimit,
  CategoryMode,
  ExpenseCategory,
  ManualTemplate,
  MoneyAccount,
  MoneyTransfer,
  PatternFeedback,
  RecurringBill,
  SavingsGoal,
  SpendingMoment
} from "../features/spendingMemory.types";

export type FinanceState = {
  balanceAnchor: BalanceAnchor | null;
  bootError: string | null;
  budgetLimits: BudgetLimit[];
  categoryModes: CategoryMode[];
  clearConfirmVisible: boolean;
  expenseCategories: ExpenseCategory[];
  feedback: PatternFeedback[];
  isReady: boolean;
  manualTemplates: ManualTemplate[];
  message: string;
  moments: SpendingMoment[];
  undoToast: SpendingMoment | null;
  recurringBills: RecurringBill[];
  savingsGoals: SavingsGoal[];
  accounts: MoneyAccount[];
  transfers: MoneyTransfer[];
};

export const initialFinanceState: FinanceState = {
  balanceAnchor: null,
  bootError: null,
  budgetLimits: [],
  categoryModes: [],
  clearConfirmVisible: false,
  expenseCategories: [],
  feedback: [],
  isReady: false,
  manualTemplates: [],
  message: getDefaultToastMessage(),
  moments: [],
  undoToast: null,
  recurringBills: [],
  savingsGoals: [],
  accounts: [],
  transfers: []
};

export type FinanceAction =
  | {
      type: "hydrate";
      payload: Omit<FinanceState, "bootError" | "clearConfirmVisible" | "isReady" | "message" | "undoToast">;
    }
  | { type: "set_ready"; ready: boolean }
  | { type: "set_boot_error"; error: string | null }
  | { type: "set_message"; message: string }
  | { type: "set_clear_confirm_visible"; visible: boolean }
  | { type: "set_moments"; moments: SpendingMoment[] }
  | { type: "prepend_moment"; moment: SpendingMoment }
  | { type: "replace_moment"; moment: SpendingMoment }
  | { type: "remove_moment"; id: string }
  | { type: "set_undo_toast"; moment: SpendingMoment | null }
  | { type: "set_feedback"; feedback: PatternFeedback[] }
  | { type: "set_budget_limits"; budgetLimits: BudgetLimit[] }
  | { type: "set_category_modes"; categoryModes: CategoryMode[] }
  | { type: "set_manual_templates"; manualTemplates: ManualTemplate[] }
  | { type: "set_recurring_bills"; recurringBills: RecurringBill[] }
  | { type: "set_savings_goals"; savingsGoals: SavingsGoal[] }
  | { type: "set_balance_anchor"; balanceAnchor: FinanceState["balanceAnchor"] }
  | { type: "set_accounts"; accounts: MoneyAccount[] }
  | { type: "set_transfers"; transfers: MoneyTransfer[] }
  | { type: "set_expense_categories"; expenseCategories: ExpenseCategory[] }
  | {
      type: "clear_all";
      payload: {
        accounts: MoneyAccount[];
        expenseCategories: ExpenseCategory[];
      };
    };

export function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.payload };
    case "set_ready":
      return { ...state, isReady: action.ready };
    case "set_boot_error":
      return { ...state, bootError: action.error };
    case "set_message":
      return { ...state, message: action.message };
    case "set_clear_confirm_visible":
      return { ...state, clearConfirmVisible: action.visible };
    case "set_moments":
      return { ...state, moments: action.moments };
    case "prepend_moment":
      return { ...state, moments: [action.moment, ...state.moments] };
    case "replace_moment":
      return {
        ...state,
        moments: state.moments.map((moment) =>
          moment.id === action.moment.id ? action.moment : moment
        )
      };
    case "remove_moment":
      return { ...state, moments: state.moments.filter((moment) => moment.id !== action.id) };
    case "set_undo_toast":
      return { ...state, undoToast: action.moment };
    case "set_feedback":
      return { ...state, feedback: action.feedback };
    case "set_budget_limits":
      return { ...state, budgetLimits: action.budgetLimits };
    case "set_category_modes":
      return { ...state, categoryModes: action.categoryModes };
    case "set_manual_templates":
      return { ...state, manualTemplates: action.manualTemplates };
    case "set_recurring_bills":
      return { ...state, recurringBills: action.recurringBills };
    case "set_savings_goals":
      return { ...state, savingsGoals: action.savingsGoals };
    case "set_balance_anchor":
      return { ...state, balanceAnchor: action.balanceAnchor };
    case "set_accounts":
      return { ...state, accounts: action.accounts };
    case "set_transfers":
      return { ...state, transfers: action.transfers };
    case "set_expense_categories":
      return { ...state, expenseCategories: action.expenseCategories };
    case "clear_all":
      return {
        ...state,
        balanceAnchor: null,
        budgetLimits: [],
        categoryModes: [],
        clearConfirmVisible: false,
        feedback: [],
        manualTemplates: [],
        moments: [],
        recurringBills: [],
        savingsGoals: [],
        accounts: action.payload.accounts,
        transfers: [],
        expenseCategories: action.payload.expenseCategories,
        undoToast: null
      };
    default:
      return state;
  }
}