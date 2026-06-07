import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { MonthlyPlan, SavingsGoal } from "../spendingMemory.types";
import { formatSignedCompactRupiah } from "../../lib/formatMoney";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { MonthlySummary } from "../app.types";
import { colors } from "../../theme/colors";
import { styles } from "../../theme/styles/app";

type HomeMoneyPulseProps = {
  dailyFlexibleRoom: number;
  hasMonthlyPlan: boolean;
  latestBalanceTotal: number;
  monthlyPlan: MonthlyPlan | null;
  monthlySummary: MonthlySummary;
  runwayMonths: number | null;
  savingsGoals: SavingsGoal[];
};

export function HomeMoneyPulse({
  dailyFlexibleRoom,
  hasMonthlyPlan,
  latestBalanceTotal,
  monthlyPlan,
  monthlySummary,
  runwayMonths,
  savingsGoals
}: HomeMoneyPulseProps) {
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
          <Text style={styles.pulseHeroLabel}>Safe to spend today</Text>
        </View>
        {showSafeToSpend ? (
          <Text style={styles.pulseHeroValue}>{formatCompactRupiah(dailyFlexibleRoom)}</Text>
        ) : (
          <Text style={styles.pulseHeroHint}>Set a monthly plan to see this</Text>
        )}
      </View>
      <View style={[styles.pulseItem, netIsNegative ? styles.pulseItemDanger : styles.pulseItemIncome]}>
        <View style={styles.pulseTopRow}>
          <View style={[styles.pulseIconBadge, netIsNegative ? styles.pulseIconDanger : styles.pulseIconIncome]}>
            <Ionicons
              name={netIsNegative ? "trending-down-outline" : "trending-up-outline"}
              size={17}
              color={netIsNegative ? colors.coral : colors.greenDark}
            />
          </View>
          <Text style={styles.pulseLabel}>Net left this month</Text>
        </View>
        <Text style={[styles.pulseValue, netIsNegative ? styles.pulseValueDanger : styles.pulseValueIncome]}>
          {formatSignedCompactRupiah(monthlySummary.net)}
        </Text>
      </View>
      <View style={[styles.pulseItem, styles.pulseItemSpending]}>
        <View style={styles.pulseTopRow}>
          <View style={[styles.pulseIconBadge, styles.pulseIconSpending]}>
            <Ionicons name="card-outline" size={17} color={colors.coral} />
          </View>
          <Text style={styles.pulseLabel}>Spending</Text>
        </View>
        <Text style={[styles.pulseValue, styles.pulseValueDanger]}>{formatCompactRupiah(monthlySummary.expense)}</Text>
      </View>
      <View style={[styles.pulseItem, styles.pulseItemBalance]}>
        <View style={styles.pulseTopRow}>
          <View style={[styles.pulseIconBadge, styles.pulseIconBalance]}>
            <Ionicons name="wallet-outline" size={17} color={colors.blue} />
          </View>
          <Text style={styles.pulseLabel}>Est. balance</Text>
        </View>
        <Text style={[styles.pulseValue, styles.pulseValueBalance]}>{formatCompactRupiah(latestBalanceTotal)}</Text>
        {runwayMonths !== null ? (
          <Text style={styles.pulseLabel}>~{runwayMonths} months of runway</Text>
        ) : (
          <Text style={styles.pulseLabel}>Add a few expenses to estimate runway</Text>
        )}
      </View>
      {showGoalProgress && (
        <View style={styles.pulseWideItem}>
          <View style={[styles.pulseIconBadge, styles.pulseIconIncome]}>
            <Ionicons name="flag-outline" size={17} color={colors.greenDark} />
          </View>
          <Text style={styles.pulseSavingsText}>
            Saved toward goals: {formatCompactRupiah(goalsSavedTotal)} of {formatCompactRupiah(goalsTargetTotal)}
          </Text>
        </View>
      )}
      {showMonthlySavingsTarget && (
        <View style={styles.pulseWideItem}>
          <View style={[styles.pulseIconBadge, styles.pulseIconIncome]}>
            <Ionicons name="flag-outline" size={17} color={colors.greenDark} />
          </View>
          <Text style={styles.pulseSavingsText}>
            Monthly savings target: {formatCompactRupiah(savingsTarget)}
          </Text>
        </View>
      )}
    </View>
  );
}