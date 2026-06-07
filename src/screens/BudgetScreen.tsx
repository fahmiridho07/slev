import { Ionicons } from "@expo/vector-icons";
import React, { memo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SegmentedControl } from "../components";
import { AllocationPanel } from "../features/budget/AllocationPanel";
import { BalancePanel } from "../features/budget/BalancePanel";
import { BudgetLimitsPanel } from "../features/budget/BudgetLimitsPanel";
import { MonthlyPlanPanel } from "../features/budget/MonthlyPlanPanel";
import { SavingsGoalsPanel } from "../features/budget/SavingsGoalsPanel";
import { BudgetTabKey } from "../features/app.types";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../state/useFinance";
import { colors } from "../theme/colors";
import { styles } from "../theme/styles/app";

type BudgetScreenProps = {
  onOpenSettings: () => void;
};

function BudgetScreenComponent({ onOpenSettings }: BudgetScreenProps) {
  const actions = useActions();
  const { accountDrift, categoryLabels, monthlySummary, projectedBalanceSnapshots } = useDerived();
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.heroPanel}>
        <Text style={styles.kickerDark}>Money plan</Text>
      </View>

      <SegmentedControl
        options={[
          { label: "Plan", value: "plan" },
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
            onSaveMonthlyPlan={(input) => void actions.savePlan(input)}
          />
          <View>
            <Pressable onPress={() => setShowCategoryLimits((prev) => !prev)} style={styles.planSummaryRow}>
              <Text style={styles.settingTitle}>Category limits (optional)</Text>
              <Ionicons name={showCategoryLimits ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} />
            </Pressable>
            {showCategoryLimits && (
              <View style={{ marginTop: 12 }}>
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
              </View>
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