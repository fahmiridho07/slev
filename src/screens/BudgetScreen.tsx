import { Ionicons } from "@expo/vector-icons";
import React, { memo, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleProp, Text, View, ViewStyle } from "react-native";
import { ScreenHero, ScreenTabBar } from "../components";
import { AllocationPanel } from "../features/budget/AllocationPanel";
import { BalancePanel } from "../features/budget/BalancePanel";
import { BudgetLimitsPanel } from "../features/budget/BudgetLimitsPanel";
import { MonthlyPlanPanel } from "../features/budget/MonthlyPlanPanel";
import { SavingsGoalsPanel } from "../features/budget/SavingsGoalsPanel";
import { BudgetTabKey } from "../features/app.types";
import { formatSignedCompactRupiah } from "../lib/formatMoney";
import { formatCompactRupiah } from "../lib/spendingMemoryPatterns";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../state/useFinance";
import { useTheme } from "../hooks/useTheme";
import { formatString } from "../i18n";

type BudgetScreenProps = {
  activeBudgetTab: BudgetTabKey;
  onBudgetTabChange: (tab: BudgetTabKey) => void;
  onOpenSettings: () => void;
  scrollContentStyle: StyleProp<ViewStyle>;
};

function BudgetScreenComponent({
  activeBudgetTab,
  onBudgetTabChange,
  onOpenSettings,
  scrollContentStyle
}: BudgetScreenProps) {
  const { colors, strings, styles } = useTheme();
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
  const [showCategoryLimits, setShowCategoryLimits] = useState(false);
  const [showAllocationDetails, setShowAllocationDetails] = useState(!hasMonthlyPlan);

  useEffect(() => {
    if (hasMonthlyPlan) {
      setShowAllocationDetails(false);
    }
  }, [hasMonthlyPlan]);

  const goalsSavedTotal = savingsGoals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const goalsTargetTotal = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);

  const hero = useMemo(() => {
    if (activeBudgetTab === "balance") {
      return {
        hint: strings.budget.hero.balanceHint,
        kicker: strings.budget.hero.balanceKicker,
        value: formatCompactRupiah(latestBalanceTotal),
        valueTone: "balance" as const,
        variant: "info" as const
      };
    }
    if (activeBudgetTab === "goals") {
      return savingsGoals.length > 0
        ? {
            hint: formatString(strings.budget.hero.goalsHint, { count: savingsGoals.length }),
            kicker: strings.budget.hero.goalsKicker,
            value: `${formatCompactRupiah(goalsSavedTotal)} / ${formatCompactRupiah(goalsTargetTotal)}`,
            valueTone: "income" as const,
            variant: "surface" as const
          }
        : {
            hint: strings.budget.hero.goalsEmptyHint,
            kicker: strings.budget.hero.goalsEmptyKicker,
            value: undefined,
            valueTone: "default" as const,
            variant: "surface" as const
          };
    }
    if (hasMonthlyPlan) {
      return {
        hint: formatString(strings.budget.hero.flexibleSpent, {
          amount: formatCompactRupiah(monthlySummary.flexibleExpense)
        }),
        kicker: strings.budget.hero.flexibleRemaining,
        value: formatSignedCompactRupiah(allocationPlan.flexibleRemaining),
        valueTone: allocationPlan.flexibleRemaining < 0 ? ("danger" as const) : ("income" as const),
        variant: "mint" as const
      };
    }
    return {
      actionLabel: strings.budget.hero.noPlanAction,
      hint: strings.budget.hero.noPlanHint,
      kicker: strings.budget.hero.noPlanKicker,
      onAction: () => onBudgetTabChange("plan"),
      value: undefined,
      valueTone: "default" as const,
      variant: "mint" as const
    };
  }, [
    activeBudgetTab,
    allocationPlan.flexibleRemaining,
    goalsSavedTotal,
    goalsTargetTotal,
    hasMonthlyPlan,
    latestBalanceTotal,
    monthlySummary.flexibleExpense,
    onBudgetTabChange,
    savingsGoals.length,
    strings.budget.hero
  ]);

  return (
    <ScrollView contentContainerStyle={scrollContentStyle} keyboardShouldPersistTaps="handled">
      <ScreenHero
        actionLabel={hero.actionLabel}
        hint={hero.hint}
        kicker={hero.kicker}
        onAction={hero.onAction}
        value={hero.value}
        valueTone={hero.valueTone}
        variant={hero.variant}
      />

      <ScreenTabBar
        options={[
          { icon: "clipboard-outline", label: strings.budget.tabs.plan, value: "plan" },
          { icon: "wallet-outline", label: strings.budget.tabs.balance, value: "balance" },
          { icon: "flag-outline", label: strings.budget.tabs.goals, value: "goals" }
        ]}
        selected={activeBudgetTab}
        onSelect={onBudgetTabChange}
      />

      {activeBudgetTab === "plan" && (
        <View style={styles.cardStack}>
          <MonthlyPlanPanel
            monthlyPlan={monthlyPlan}
            monthlySummary={monthlySummary}
            onSaveMonthlyPlan={(input) => void actions.savePlan(input)}
          />
          <View style={styles.cardStack}>
            <Pressable
              accessibilityLabel={
                showAllocationDetails
                  ? strings.budget.plan.collapseAllocationA11y
                  : strings.budget.plan.expandAllocationA11y
              }
              accessibilityRole="button"
              onPress={() => setShowAllocationDetails((prev) => !prev)}
              style={styles.accordionCard}
            >
              <Text style={styles.settingTitle}>{strings.budget.plan.allocationDetails}</Text>
              <Ionicons name={showAllocationDetails ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} />
            </Pressable>
            {showAllocationDetails && (
              <AllocationPanel
                accounts={accounts}
                balanceSnapshots={balanceSnapshots}
                monthlyPlan={monthlyPlan}
                monthlySummary={monthlySummary}
                projectedBalanceSnapshots={projectedBalanceSnapshots}
                transfers={transfers}
                onOpenBalance={() => onBudgetTabChange("balance")}
              />
            )}
          </View>
          <View style={styles.cardStack}>
            <Pressable
              accessibilityLabel={
                showCategoryLimits
                  ? strings.budget.plan.collapseLimitsA11y
                  : strings.budget.plan.expandLimitsA11y
              }
              accessibilityRole="button"
              onPress={() => setShowCategoryLimits((prev) => !prev)}
              style={styles.accordionCard}
            >
              <Text style={styles.settingTitle}>{strings.budget.plan.categoryLimitsOptional}</Text>
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