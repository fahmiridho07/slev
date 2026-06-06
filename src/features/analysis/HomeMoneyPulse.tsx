import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { MonthlyPlan } from "../spendingMemory.types";
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
};

export function HomeMoneyPulse({
  dailyFlexibleRoom,
  hasMonthlyPlan,
  latestBalanceTotal,
  monthlyPlan,
  monthlySummary,
  runwayMonths
}: HomeMoneyPulseProps) {
  const savingsTarget = monthlyPlan?.savingsTarget ?? 0;
  const estimatedSavings = Math.max(0, monthlySummary.net);
  const netIsNegative = monthlySummary.net < 0;
  const hasFlexibleBudget = (monthlyPlan?.flexibleBudget ?? 0) > 0;
  const showSafeToSpend = hasMonthlyPlan && hasFlexibleBudget;

  return (
    <View style={styles.pulsePanel}>
      <View style={styles.pulseWideItem}>
        <View style={[styles.pulseIconBadge, styles.pulseIconSpending]}>
          <Ionicons name="today-outline" size={17} color={colors.coral} />
        </View>
        <Text style={styles.pulseSavingsText}>
          {showSafeToSpend
            ? `Safe to spend today: ${formatCompactRupiah(dailyFlexibleRoom)}`
            : "Set a monthly plan to see today's safe-to-spend"}
        </Text>
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
          <Text style={styles.pulseLabel}>Net income</Text>
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
      {savingsTarget > 0 && (
        <View style={styles.pulseWideItem}>
          <View style={[styles.pulseIconBadge, styles.pulseIconIncome]}>
            <Ionicons name="flag-outline" size={17} color={colors.greenDark} />
          </View>
          <Text style={styles.pulseSavingsText}>
            Savings target: {formatCompactRupiah(savingsTarget)} - current pace {formatCompactRupiah(estimatedSavings)}
          </Text>
        </View>
      )}
    </View>
  );
}