import React, { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SegmentedControl } from "../components";
import { AllocationPanel } from "../features/budget/AllocationPanel";
import { BalancePanel } from "../features/budget/BalancePanel";
import { BudgetLimitsPanel } from "../features/budget/BudgetLimitsPanel";
import { MonthlyPlanPanel } from "../features/budget/MonthlyPlanPanel";
import { SavingsGoalsPanel } from "../features/budget/SavingsGoalsPanel";
import { BudgetTabKey, CategoryModeValue } from "../features/app.types";
import { BalanceSnapshot, BudgetLimit, BudgetPeriod, CategoryMode, ExpenseCategory, MoneyAccount, MoneyTransfer, MonthlyPlan, SavingsGoal, SpendingContext, SpendingMoment } from "../features/spendingMemory.types";
import { buildCurrentMonthSummary } from "../lib/financeEngine";
import { styles } from "../theme/styles/app";

export function BudgetScreen({
  accounts,
  balanceSnapshots,
  budgetLimits,
  categoryLabels,
  categoryModes,
  expenseCategories,
  monthlyPlan,
  moments,
  projectedBalanceSnapshots,
  transfers,
  onDeleteAccount,
  onDeleteCategory,
  onDeleteLimit,
  onDeleteGoal,
  onOpenSettings,
  onSaveAccount,
  onSaveBalance,
  onSaveCategoryMode,
  onSaveGoal,
  onSaveLimit,
  onSaveMonthlyPlan,
  savingsGoals
}: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  budgetLimits: BudgetLimit[];
  categoryLabels: SpendingContext[];
  categoryModes: CategoryMode[];
  expenseCategories: ExpenseCategory[];
  monthlyPlan: MonthlyPlan | null;
  moments: SpendingMoment[];
  projectedBalanceSnapshots: BalanceSnapshot[];
  transfers: MoneyTransfer[];
  onDeleteAccount: (id: string) => void;
  onDeleteCategory: (category: ExpenseCategory) => void;
  onDeleteLimit: (category: SpendingContext) => void;
  onDeleteGoal: (id: string) => void;
  onOpenSettings: () => void;
  onSaveAccount: (input: {
    id?: string;
    isIncomeHub: boolean;
    kind: MoneyAccount["kind"];
    label: string;
  }) => void;
  onSaveBalance: (input: { accountLabel: string; amount: string }) => void;
  onSaveCategoryMode: (category: SpendingContext, mode: CategoryModeValue) => void;
  onSaveGoal: (input: {
    id?: string;
    label: string;
    savedAmount: string;
    targetAmount: string;
  }) => void;
  onSaveLimit: (category: SpendingContext, amountText: string, period: BudgetPeriod) => void;
  onSaveMonthlyPlan: (input: {
    expectedIncome: string;
    fixedCosts: string;
    flexibleBudget: string;
    note: string;
    savingsTarget: string;
  }) => void;
  savingsGoals: SavingsGoal[];
}) {
  const [activeBudgetTab, setActiveBudgetTab] = useState<BudgetTabKey>("plan");
  const monthlySummary = useMemo(
    () => buildCurrentMonthSummary(moments, categoryModes),
    [categoryModes, moments]
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.heroPanel}>
        <Text style={styles.kickerDark}>Money plan</Text>
        <Text style={styles.heroTitle}>Plan the month, then keep manual capture easy.</Text>
      </View>

      <SegmentedControl
        options={[
          { label: "Plan", value: "plan" },
          { label: "Limits", value: "limits" },
          { label: "Balance", value: "balance" },
          { label: "Goals", value: "goals" }
        ]}
        selected={activeBudgetTab}
        onSelect={setActiveBudgetTab}
      />

      {activeBudgetTab === "plan" && (
        <View style={styles.analyticsBlock}>
          <AllocationPanel
            accounts={accounts}
            balanceSnapshots={balanceSnapshots}
            monthlyPlan={monthlyPlan}
            monthlySummary={monthlySummary}
            projectedBalanceSnapshots={projectedBalanceSnapshots}
            transfers={transfers}
            onOpenBalance={() => setActiveBudgetTab("balance")}
          />
          <MonthlyPlanPanel
            monthlyPlan={monthlyPlan}
            monthlySummary={monthlySummary}
            onSaveMonthlyPlan={onSaveMonthlyPlan}
          />
        </View>
      )}
      {activeBudgetTab === "limits" && (
        <BudgetLimitsPanel
          budgetLimits={budgetLimits}
          categoryLabels={categoryLabels}
          categoryModes={categoryModes}
          expenseCategories={expenseCategories}
          moments={moments}
          onDeleteCategory={onDeleteCategory}
          onDeleteLimit={onDeleteLimit}
          onOpenSettings={onOpenSettings}
          onSaveCategoryMode={onSaveCategoryMode}
          onSaveLimit={onSaveLimit}
        />
      )}
      {activeBudgetTab === "goals" && (
        <SavingsGoalsPanel
          savingsGoals={savingsGoals}
          onDeleteGoal={onDeleteGoal}
          onSaveGoal={onSaveGoal}
        />
      )}
      {activeBudgetTab === "balance" && (
        <BalancePanel
          accounts={accounts}
          balanceSnapshots={balanceSnapshots}
          projectedBalanceSnapshots={projectedBalanceSnapshots}
          onDeleteAccount={onDeleteAccount}
          onSaveAccount={onSaveAccount}
          onSaveBalance={onSaveBalance}
        />
      )}
    </ScrollView>
  );
}
