import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { MonthlyPlan, SavingsGoal } from "../spendingMemory.types";
import { formatSignedCompactRupiah } from "../../lib/formatMoney";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { MonthlySummary } from "../app.types";
import { useTheme } from "../../hooks/useTheme";
import { formatString } from "../../i18n";

type HomeMoneyPulseProps = {
  dailyFlexibleRoom: number;
  hasMonthlyPlan: boolean;
  latestBalanceTotal: number;
  monthlyPlan: MonthlyPlan | null;
  monthlySummary: MonthlySummary;
  onOpenBudgetPlan?: () => void;
  runwayMonths: number | null;
  savingsGoals: SavingsGoal[];
};

export function HomeMoneyPulse({
  dailyFlexibleRoom,
  hasMonthlyPlan,
  latestBalanceTotal,
  monthlyPlan,
  monthlySummary,
  onOpenBudgetPlan,
  runwayMonths,
  savingsGoals
}: HomeMoneyPulseProps) {
  const { colors, strings, styles } = useTheme();
  const savingsTarget = monthlyPlan?.savingsTarget ?? 0;
  const netIsNegative = monthlySummary.net < 0;
  const goalsSavedTotal = savingsGoals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const goalsTargetTotal = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const showGoalProgress = savingsGoals.length > 0;
  const showMonthlySavingsTarget = !showGoalProgress && savingsTarget > 0;
  const hasFlexibleBudget = (monthlyPlan?.flexibleBudget ?? 0) > 0;
  const showSafeToSpend = hasMonthlyPlan && hasFlexibleBudget;

  return (
    <View style={styles.pulsePanel}>
      <View style={styles.pulseHero}>
        <View style={styles.pulseTopRow}>
          <View style={[styles.pulseIconBadge, styles.pulseIconSpending]}>
            <Ionicons name="today-outline" size={17} color={colors.coral} />
          </View>
          <Text style={styles.pulseHeroLabel}>{strings.home.pulse.safeToSpendToday}</Text>
        </View>
        {showSafeToSpend ? (
          <Text style={styles.pulseHeroValue}>{formatCompactRupiah(dailyFlexibleRoom)}</Text>
        ) : onOpenBudgetPlan ? (
          <Pressable
            accessibilityLabel={strings.home.pulse.setMonthlyPlanA11y}
            accessibilityRole="button"
            onPress={onOpenBudgetPlan}
          >
            <Text style={styles.heroActionText}>{strings.home.pulse.setMonthlyPlan}</Text>
          </Pressable>
        ) : (
          <Text style={styles.pulseHeroHint}>{strings.home.pulse.setMonthlyPlanHint}</Text>
        )}
      </View>
      <View style={[styles.pulseItem, netIsNegative ? styles.pulseItemDanger : styles.pulseItemIncome]}>
        <Text style={styles.pulseLabel}>{strings.home.pulse.netLeft}</Text>
        <Text style={[styles.pulseValue, netIsNegative ? styles.pulseValueDanger : styles.pulseValueIncome]}>
          {formatSignedCompactRupiah(monthlySummary.net)}
        </Text>
      </View>
      <View style={[styles.pulseItem, styles.pulseItemSpending]}>
        <Text style={styles.pulseLabel}>{strings.home.pulse.spending}</Text>
        <Text style={[styles.pulseValue, styles.pulseValueDanger]}>{formatCompactRupiah(monthlySummary.expense)}</Text>
      </View>
      <View style={[styles.pulseItem, styles.pulseItemBalance]}>
        <Text style={styles.pulseLabel}>{strings.home.pulse.estBalance}</Text>
        <Text style={[styles.pulseValue, styles.pulseValueBalance]}>{formatCompactRupiah(latestBalanceTotal)}</Text>
        {runwayMonths !== null ? (
          <Text style={styles.pulseLabel}>
            {formatString(strings.home.pulse.runwayMonths, { count: runwayMonths })}
          </Text>
        ) : (
          <Text style={styles.pulseLabel}>{strings.home.pulse.runwayHint}</Text>
        )}
      </View>
      {showGoalProgress && (
        <View style={styles.pulseWideItem}>
          <View style={[styles.pulseIconBadge, styles.pulseIconIncome]}>
            <Ionicons name="flag-outline" size={17} color={colors.greenDark} />
          </View>
          <Text style={styles.pulseSavingsText}>
            {formatString(strings.home.pulse.savedTowardGoals, {
              saved: formatCompactRupiah(goalsSavedTotal),
              target: formatCompactRupiah(goalsTargetTotal)
            })}
          </Text>
        </View>
      )}
      {showMonthlySavingsTarget && (
        <View style={styles.pulseWideItem}>
          <View style={[styles.pulseIconBadge, styles.pulseIconIncome]}>
            <Ionicons name="flag-outline" size={17} color={colors.greenDark} />
          </View>
          <Text style={styles.pulseSavingsText}>
            {formatString(strings.home.pulse.monthlySavingsTarget, {
              amount: formatCompactRupiah(savingsTarget)
            })}
          </Text>
        </View>
      )}
    </View>
  );
}