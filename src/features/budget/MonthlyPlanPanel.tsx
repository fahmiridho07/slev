import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { formatString } from "../../i18n";
import { MonthlySummary } from "../app.types";
import { formatAmountInput, formatSignedCompactRupiah, parseAmountInput } from "../../lib/formatMoney";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { MonthlyPlan } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";

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
  const { colors, strings, styles } = useTheme();
  const planStrings = strings.budget.monthlyPlan;
  const [expectedIncome, setExpectedIncome] = useState(monthlyPlan ? formatAmountInput(String(monthlyPlan.expectedIncome)) : "");
  const [fixedCosts, setFixedCosts] = useState(monthlyPlan ? formatAmountInput(String(monthlyPlan.fixedCosts)) : "");
  const [savingsTarget, setSavingsTarget] = useState(monthlyPlan ? formatAmountInput(String(monthlyPlan.savingsTarget)) : "");
  const [note, setNote] = useState(monthlyPlan?.note ?? "");

  useEffect(() => {
    setExpectedIncome(monthlyPlan ? formatAmountInput(String(monthlyPlan.expectedIncome)) : "");
    setFixedCosts(monthlyPlan ? formatAmountInput(String(monthlyPlan.fixedCosts)) : "");
    setSavingsTarget(monthlyPlan ? formatAmountInput(String(monthlyPlan.savingsTarget)) : "");
    setNote(monthlyPlan?.note ?? "");
  }, [monthlyPlan]);

  const expectedIncomeAmount = parseAmountInput(expectedIncome) ?? 0;
  const fixedCostsAmount = parseAmountInput(fixedCosts) ?? 0;
  const savingsTargetAmount = parseAmountInput(savingsTarget) ?? 0;
  const flexibleBudget = Math.max(0, expectedIncomeAmount - fixedCostsAmount - savingsTargetAmount);
  const overCommitted = fixedCostsAmount + savingsTargetAmount - expectedIncomeAmount;
  const flexibleRemaining = flexibleBudget - monthlySummary.flexibleExpense;
  const loggedIncome = Math.round(monthlySummary.income);
  const showIncomeSuggestion = !monthlyPlan && expectedIncome.trim() === "" && loggedIncome > 0;

  return (
    <View style={styles.analyticsBlock}>
      <View style={styles.capturePanel}>
        <Text style={styles.microLabel}>{planStrings.title}</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={(value) => setExpectedIncome(formatAmountInput(value))}
          placeholder={planStrings.expectedIncome}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={expectedIncome}
        />
        {showIncomeSuggestion && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setExpectedIncome(formatAmountInput(String(loggedIncome)))}
            style={styles.secondaryInlineButton}
          >
            <Ionicons name="sparkles-outline" size={16} color={colors.greenDark} />
            <Text style={styles.textButtonLabel}>
              {formatString(planStrings.useLoggedIncome, { amount: formatCompactRupiah(loggedIncome) })}
            </Text>
          </Pressable>
        )}
        <TextInput
          keyboardType="number-pad"
          onChangeText={(value) => setFixedCosts(formatAmountInput(value))}
          placeholder={planStrings.fixedCosts}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={fixedCosts}
        />
        <TextInput
          keyboardType="number-pad"
          onChangeText={(value) => setSavingsTarget(formatAmountInput(value))}
          placeholder={planStrings.savingsTarget}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={savingsTarget}
        />
        <TextInput
          multiline
          onChangeText={setNote}
          placeholder={planStrings.notePlaceholder}
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.noteInput]}
          value={note}
        />
        <View style={styles.planSummaryRow}>
          <Text style={styles.settingCopy}>{planStrings.flexibleBudget}</Text>
          <Text style={styles.analyticsTitle}>{formatCompactRupiah(flexibleBudget)}</Text>
        </View>
        <View style={styles.planSummaryRow}>
          <Text style={styles.settingCopy}>{planStrings.flexibleRemaining}</Text>
          <Text style={[styles.analyticsTitle, flexibleRemaining < 0 && styles.expenseText]}>
            {formatSignedCompactRupiah(flexibleRemaining)}
          </Text>
        </View>
        {overCommitted > 0 && (
          <View style={styles.planSummaryRow}>
            <Text style={styles.settingCopy}>{planStrings.overIncomeBy}</Text>
            <Text style={[styles.analyticsTitle, styles.expenseText]}>{formatCompactRupiah(overCommitted)}</Text>
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            onSaveMonthlyPlan({ expectedIncome, fixedCosts, flexibleBudget: String(flexibleBudget), note, savingsTarget })
          }
          style={styles.primaryButton}
        >
          <Ionicons name="save-outline" size={18} color={colors.surface} />
          <Text style={styles.primaryButtonText}>{planStrings.savePlan}</Text>
        </Pressable>
      </View>
    </View>
  );
}