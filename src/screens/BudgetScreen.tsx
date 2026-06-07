import { Ionicons } from "@expo/vector-icons";
import React, { memo, useEffect, useMemo, useState } from "react";
import { Pressable, StyleProp, Text, View, ViewStyle } from "react-native";
import { MonthlyPlanWizard } from "../features/budget/MonthlyPlanWizard";
import { ScreenHero, ScreenTabBar, StickyTabScreen } from "../components";
import { AllocationPanel } from "../features/budget/AllocationPanel";
import { BalancePanel } from "../features/budget/BalancePanel";
import { BudgetLimitsPanel } from "../features/budget/BudgetLimitsPanel";
import { MonthlyPlanPanel } from "../features/budget/MonthlyPlanPanel";
import { SavingsGoalsPanel } from "../features/budget/SavingsGoalsPanel";
import { BudgetTabKey } from "../features/app.types";
import { buildBudgetTabHero } from "../lib/tabHero";
import { shallowEqual, useActions, useFinanceDerived, useFinanceSelector } from "../state/useFinance";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { useTheme } from "../hooks/useTheme";
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
  const { refreshControl } = usePullToRefresh();
  const actions = useActions();
  const {
    accountDrift,
    allocationPlan,
    categoryLabels,
    hasMonthlyPlan,
    latestBalanceTotal,
    monthlySummary,
    projectedBalanceSnapshots
  } = useFinanceDerived(
    (derived) => ({
      accountDrift: derived.accountDrift,
      allocationPlan: derived.allocationPlan,
      categoryLabels: derived.categoryLabels,
      hasMonthlyPlan: derived.hasMonthlyPlan,
      latestBalanceTotal: derived.latestBalanceTotal,
      monthlySummary: derived.monthlySummary,
      projectedBalanceSnapshots: derived.projectedBalanceSnapshots
    }),
    shallowEqual
  );
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

  const hero = useMemo(
    () =>
      buildBudgetTabHero({
        activeTab: activeBudgetTab,
        allocationFlexibleRemaining: allocationPlan.flexibleRemaining,
        hasMonthlyPlan,
        latestBalanceTotal,
        monthlyFlexibleExpense: monthlySummary.flexibleExpense,
        onOpenPlan: () => onBudgetTabChange("plan"),
        savingsGoals,
        strings
      }),
    [
      activeBudgetTab,
      allocationPlan.flexibleRemaining,
      hasMonthlyPlan,
      latestBalanceTotal,
      monthlySummary.flexibleExpense,
      onBudgetTabChange,
      savingsGoals,
      strings
    ]
  );

  return (
    <StickyTabScreen
      refreshControl={refreshControl}
      scrollContentStyle={scrollContentStyle}
      hero={
        <ScreenHero
          actionLabel={hero.actionLabel}
          hint={hero.hint}
          kicker={hero.kicker}
          onAction={hero.onAction}
          value={hero.value}
          valueTone={hero.valueTone}
          variant={hero.variant}
        />
      }
      tabBar={
        <ScreenTabBar
          options={[
            { icon: "clipboard-outline", label: strings.budget.tabs.plan, value: "plan" },
            { icon: "wallet-outline", label: strings.budget.tabs.balance, value: "balance" },
            { icon: "flag-outline", label: strings.budget.tabs.goals, value: "goals" }
          ]}
          selected={activeBudgetTab}
          onSelect={onBudgetTabChange}
        />
      }
    >
      {activeBudgetTab === "plan" && (
        <View style={styles.cardStack}>
          {!monthlyPlan ? (
            <MonthlyPlanWizard
              monthlySummary={monthlySummary}
              onSaveMonthlyPlan={(input) => actions.savePlan(input)}
            />
          ) : (
            <MonthlyPlanPanel
              monthlyPlan={monthlyPlan}
              monthlySummary={monthlySummary}
              onSaveMonthlyPlan={(input) => actions.savePlan(input)}
            />
          )}
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
                onSaveLimit={(category, amountText, period) => actions.saveCategoryBudget(category, amountText, period)}
              />
            )}
          </View>
        </View>
      )}
      {activeBudgetTab === "goals" && (
        <SavingsGoalsPanel
          savingsGoals={savingsGoals}
          onDeleteGoal={(id) => void actions.removeSavingsGoal(id)}
          onSaveGoal={(input) => actions.saveGoal(input)}
        />
      )}
      {activeBudgetTab === "balance" && (
        <BalancePanel
          accountDrift={accountDrift}
          accounts={accounts}
          balanceSnapshots={balanceSnapshots}
          projectedBalanceSnapshots={projectedBalanceSnapshots}
          onDeleteAccount={(id) => void actions.removeAccount(id)}
          onSaveAccount={(input) => actions.saveAccount(input)}
          onSaveBalance={(input) => actions.saveBalance(input)}
        />
      )}
    </StickyTabScreen>
  );
}

export const BudgetScreen = memo(BudgetScreenComponent);