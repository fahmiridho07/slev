import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { MonthlySummary } from "../app.types";
import { formatAmountInput, formatSignedCompactRupiah, parseAmountInput } from "../../lib/formatMoney";
import { MonthlyPlan } from "../spendingMemory.types";
import { colors } from "../../theme/colors";
import { styles } from "../../theme/styles/app";

export function MonthlyPlanPanel({
  monthlyPlan,
  monthlySummary,
  onSaveMonthlyPlan
}: {
  monthlyPlan: MonthlyPlan | null;
  monthlySummary: MonthlySummary;
  onSaveMonthlyPlan: (input: {
    expectedIncome: string;
    fixedCosts: string;
    flexibleBudget: string;
    note: string;
    savingsTarget: string;
  }) => void;
}) {
  const [expectedIncome, setExpectedIncome] = useState(monthlyPlan ? formatAmountInput(String(monthlyPlan.expectedIncome)) : "");
  const [fixedCosts, setFixedCosts] = useState(monthlyPlan ? formatAmountInput(String(monthlyPlan.fixedCosts)) : "");
  const [flexibleBudget, setFlexibleBudget] = useState(monthlyPlan ? formatAmountInput(String(monthlyPlan.flexibleBudget)) : "");
  const [savingsTarget, setSavingsTarget] = useState(monthlyPlan ? formatAmountInput(String(monthlyPlan.savingsTarget)) : "");
  const [note, setNote] = useState(monthlyPlan?.note ?? "");
  const plannedTotal =
    (parseAmountInput(fixedCosts) ?? 0) +
    (parseAmountInput(flexibleBudget) ?? 0) +
    (parseAmountInput(savingsTarget) ?? 0);
  const expectedIncomeAmount = parseAmountInput(expectedIncome) ?? 0;
  const plannedLeft = expectedIncomeAmount - plannedTotal;
  const flexibleRemaining = (parseAmountInput(flexibleBudget) ?? 0) - monthlySummary.flexibleExpense;

  useEffect(() => {
    setExpectedIncome(monthlyPlan ? formatAmountInput(String(monthlyPlan.expectedIncome)) : "");
    setFixedCosts(monthlyPlan ? formatAmountInput(String(monthlyPlan.fixedCosts)) : "");
    setFlexibleBudget(monthlyPlan ? formatAmountInput(String(monthlyPlan.flexibleBudget)) : "");
    setSavingsTarget(monthlyPlan ? formatAmountInput(String(monthlyPlan.savingsTarget)) : "");
    setNote(monthlyPlan?.note ?? "");
  }, [monthlyPlan]);

  return (
    <View style={styles.analyticsBlock}>
      <View style={styles.capturePanel}>
        <Text style={styles.microLabel}>Monthly spending plan</Text>
        <TextInput keyboardType="number-pad" onChangeText={(value) => setExpectedIncome(formatAmountInput(value))} placeholder="Expected income" placeholderTextColor={colors.muted} style={styles.input} value={expectedIncome} />
        <TextInput keyboardType="number-pad" onChangeText={(value) => setFixedCosts(formatAmountInput(value))} placeholder="Fixed costs" placeholderTextColor={colors.muted} style={styles.input} value={fixedCosts} />
        <TextInput keyboardType="number-pad" onChangeText={(value) => setFlexibleBudget(formatAmountInput(value))} placeholder="Flexible budget" placeholderTextColor={colors.muted} style={styles.input} value={flexibleBudget} />
        <TextInput keyboardType="number-pad" onChangeText={(value) => setSavingsTarget(formatAmountInput(value))} placeholder="Savings target" placeholderTextColor={colors.muted} style={styles.input} value={savingsTarget} />
        <TextInput multiline onChangeText={setNote} placeholder="One adjustment for this month, optional" placeholderTextColor={colors.muted} style={[styles.input, styles.noteInput]} value={note} />
        <View style={styles.planSummaryRow}>
          <Text style={styles.settingCopy}>Flexible remaining</Text>
          <Text style={[styles.analyticsTitle, flexibleRemaining < 0 && styles.expenseText]}>{formatSignedCompactRupiah(flexibleRemaining)}</Text>
        </View>
        <View style={styles.planSummaryRow}>
          <Text style={styles.settingCopy}>Planned left</Text>
          <Text style={[styles.analyticsTitle, plannedLeft < 0 && styles.expenseText]}>{formatSignedCompactRupiah(plannedLeft)}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => onSaveMonthlyPlan({ expectedIncome, fixedCosts, flexibleBudget, note, savingsTarget })} style={styles.primaryButton}>
          <Ionicons name="save-outline" size={18} color={colors.surface} />
          <Text style={styles.primaryButtonText}>Save plan</Text>
        </Pressable>
      </View>
    </View>
  );
}
