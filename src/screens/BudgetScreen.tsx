import { Ionicons } from "@expo/vector-icons";
import React, { memo, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenHero, SegmentedControl } from "../components";
import { AllocationPanel } from "../features/budget/AllocationPanel";
import { BalancePanel } from "../features/budget/BalancePanel";
import { BudgetLimitsPanel } from "../features/budget/BudgetLimitsPanel";
import { MonthlyPlanPanel } from "../features/budget/MonthlyPlanPanel";
import { SavingsGoalsPanel } from "../features/budget/SavingsGoalsPanel";
import { BudgetTabKey } from "../features/app.types";
import { formatSignedCompactRupiah } from "../lib/formatMoney";
import { formatCompactRupiah } from "../lib/spendingMemoryPatterns";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../state/useFinance";
import { colors } from "../theme/colors";
import { styles } from "../theme/styles/app";

type BudgetScreenProps = {
  onOpenSettings: () => void;
};

function BudgetScreenComponent({ onOpenSettings }: BudgetScreenProps) {
  const actions = useActions();
  const {
    accountDrift,
    allocationPlan,
    categoryLabels,
    hasMonthlyPlan,
    latestBalanceTotal,
    monthlySummary,
    projectedBalanceSnapshots
  } = useDerived();
  const {
    accounts,
    balanceSnapshots,
    budgetLimits,
    categoryModes,
    expenseCategories,
    moments,
    monthlyPlan,
    savingsGoals,
    transfers
  } = useFinanceSelector(
    (state) => ({
      accounts: state.accounts,
      balanceSnapshots: state.balanceSnapshots,
      budgetLimits: state.budgetLimits,
      categoryModes: state.categoryModes,
      expenseCategories: state.expenseCategories,
      moments: state.moments,
      monthlyPlan: state.monthlyPlan,
      savingsGoals: state.savingsGoals,
      transfers: state.transfers
    }),
    shallowEqual
  );
  const [activeBudgetTab, setActiveBudgetTab] = useState<BudgetTabKey>("plan");
  const [showCategoryLimits, setShowCategoryLimits] = useState(false);

  const goalsSavedTotal = savingsGoals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const goalsTargetTotal = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);

  const hero = useMemo(() => {
    if (activeBudgetTab === "balance") {
      return {
        hint: "From snapshots plus logged movements",
        kicker: "Estimated balance",
        value: formatCompactRupiah(latestBalanceTotal),
        valueTone: "balance" as const
      };
    }
    if (activeBudgetTab === "goals") {
      return savingsGoals.length > 0
        ? {
            hint: `${savingsGoals.length} goal${savingsGoals.length === 1 ? "" : "s"} in progress`,
            kicker: "Saved toward goals",
            value: `${formatCompactRupiah(goalsSavedTotal)} / ${formatCompactRupiah(goalsTargetTotal)}`,
            valueTone: "income" as const
          }
        : {
            hint: "Add a target when you are ready",
            kicker: "Savings goals",
            value: undefined,
            valueTone: "default" as const
          };
    }
    if (hasMonthlyPlan) {
      return {
        hint: `${formatCompactRupiah(monthlySummary.flexibleExpense)} flexible spent this month`,
        kicker: "Flexible remaining",
        value: formatSignedCompactRupiah(allocationPlan.flexibleRemaining),
        valueTone: allocationPlan.flexibleRemaining < 0 ? ("danger" as const) : ("income" as const)
      };
    }
    return {
      hint: "Expected income, fixed costs, and savings target",
      kicker: "Monthly plan",
      value: undefined,
      valueTone: "default" as const
    };
  }, [
    activeBudgetTab,
    allocationPlan.flexibleRemaining,
    goalsSavedTotal,
    goalsTargetTotal,
    hasMonthlyPlan,
    latestBalanceTotal,
    monthlySummary.flexibleExpense,
    savingsGoals.length
  ]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <ScreenHero hint={hero.hint} kicker={hero.kicker} value={hero.value} valueTone={hero.valueTone} />

      <SegmentedControl
        options={[
          { label: "Plan", value: "plan" },
          { label: "Balance", value: "balance" },
          { label: "Goals", value: "goals" }
        ]}
        selected={activeBudgetTab}
        stretch
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
            onSaveMonthlyPlan={(input) => void actions.savePlan(input)}
          />
          <View style={styles.cardGrid}>
            <Pressable onPress={() => setShowCategoryLimits((prev) => !prev)} style={styles.planSummaryRow}>
              <Text style={styles.settingTitle}>Category limits (optional)</Text>
              <Ionicons name={showCategoryLimits ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} />
            </Pressable>
            {showCategoryLimits && (
              <BudgetLimitsPanel
                budgetLimits={budgetLimits}
                categoryLabels={categoryLabels}
                categoryModes={categoryModes}
                expenseCategories={expenseCategories}
                moments={moments}
                onDeleteCategory={(category) => void actions.removeCategory(category)}
                onDeleteLimit={(category) => void actions.removeCategoryBudget(category)}
                onOpenSettings={onOpenSettings}
                onSaveCategoryMode={(category, mode) => void actions.changeCategoryMode(category, mode)}
                onSaveLimit={(category, amountText, period) => void actions.saveCategoryBudget(category, amountText, period)}
              />
            )}
          </View>
        </View>
      )}
      {activeBudgetTab === "goals" && (
        <SavingsGoalsPanel
          savingsGoals={savingsGoals}
          onDeleteGoal={(id) => void actions.removeSavingsGoal(id)}
          onSaveGoal={(input) => void actions.saveGoal(input)}
        />
      )}
      {activeBudgetTab === "balance" && (
        <BalancePanel
          accountDrift={accountDrift}
          accounts={accounts}
          balanceSnapshots={balanceSnapshots}
          projectedBalanceSnapshots={projectedBalanceSnapshots}
          onDeleteAccount={(id) => void actions.removeAccount(id)}
          onSaveAccount={(input) => void actions.saveAccount(input)}
          onSaveBalance={(input) => void actions.saveBalance(input)}
        />
      )}
    </ScrollView>
  );
}

export const BudgetScreen = memo(BudgetScreenComponent);