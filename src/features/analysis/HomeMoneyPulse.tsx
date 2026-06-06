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
  latestBalanceTotal: number;
  monthlyPlan: MonthlyPlan | null;
  monthlySummary: MonthlySummary;
};

export function HomeMoneyPulse({
  latestBalanceTotal,
  monthlyPlan,
  monthlySummary
}: HomeMoneyPulseProps) {
  const savingsTarget = monthlyPlan?.savingsTarget ?? 0;
  const estimatedSavings = Math.max(0, monthlySummary.net);
  const netIsNegative = monthlySummary.net < 0;

  return (
    <View style={styles.pulsePanel}>
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