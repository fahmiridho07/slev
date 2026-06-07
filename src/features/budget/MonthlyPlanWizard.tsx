import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { formatString } from "../../i18n";
import { MonthlySummary } from "../app.types";
import { formatAmountInput, formatSignedCompactRupiah, parseAmountInput } from "../../lib/formatMoney";
import { formatCompactRupiah } from "../../lib/spendingMemoryPatterns";
import { useTheme } from "../../hooks/useTheme";

const WIZARD_STEPS = 3;

export function MonthlyPlanWizard({
  monthlySummary,
  onSaveMonthlyPlan
}: {
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
  const [step, setStep] = useState(0);
  const [expectedIncome, setExpectedIncome] = useState("");
  const [fixedCosts, setFixedCosts] = useState("");
  const [savingsTarget, setSavingsTarget] = useState("");
  const [note, setNote] = useState("");

  const expectedIncomeAmount = parseAmountInput(expectedIncome) ?? 0;
  const fixedCostsAmount = parseAmountInput(fixedCosts) ?? 0;
  const savingsTargetAmount = parseAmountInput(savingsTarget) ?? 0;
  const flexibleBudget = Math.max(0, expectedIncomeAmount - fixedCostsAmount - savingsTargetAmount);
  const overCommitted = fixedCostsAmount + savingsTargetAmount - expectedIncomeAmount;
  const flexibleRemaining = flexibleBudget - monthlySummary.flexibleExpense;
  const loggedIncome = Math.round(monthlySummary.income);
  const showIncomeSuggestion = step === 0 && expectedIncome.trim() === "" && loggedIncome > 0;

  function goNext() {
    setStep((current) => Math.min(current + 1, WIZARD_STEPS - 1));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  return (
    <View style={styles.capturePanel}>
      <Text style={styles.microLabel}>{planStrings.wizardTitle}</Text>
      <Text style={styles.settingCopy}>
        {formatString(planStrings.wizardStep, { current: step + 1, total: WIZARD_STEPS })}
      </Text>

      {step === 0 && (
        <>
          <Text style={styles.settingCopy}>{planStrings.stepIncomeCopy}</Text>
          <TextInput
            accessibilityLabel={planStrings.expectedIncome}
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
        </>
      )}

      {step === 1 && (
        <>
          <Text style={styles.settingCopy}>{planStrings.stepFixedCopy}</Text>
          <TextInput
            accessibilityLabel={planStrings.fixedCosts}
            keyboardType="number-pad"
            onChangeText={(value) => setFixedCosts(formatAmountInput(value))}
            placeholder={planStrings.fixedCosts}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={fixedCosts}
          />
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.settingCopy}>{planStrings.stepSavingsCopy}</Text>
          <TextInput
            accessibilityLabel={planStrings.savingsTarget}
            keyboardType="number-pad"
            onChangeText={(value) => setSavingsTarget(formatAmountInput(value))}
            placeholder={planStrings.savingsTarget}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={savingsTarget}
          />
          <TextInput
            accessibilityLabel={planStrings.notePlaceholder}
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
        </>
      )}

      <View style={styles.editActions}>
        {step > 0 && (
          <Pressable accessibilityRole="button" onPress={goBack} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{planStrings.wizardBack}</Text>
          </Pressable>
        )}
        {step < WIZARD_STEPS - 1 ? (
          <Pressable accessibilityRole="button" onPress={goNext} style={styles.smallPrimaryButton}>
            <Text style={styles.primaryButtonText}>{planStrings.wizardNext}</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              onSaveMonthlyPlan({
                expectedIncome,
                fixedCosts,
                flexibleBudget: String(flexibleBudget),
                note,
                savingsTarget
              })
            }
            style={styles.primaryButton}
          >
            <Ionicons name="save-outline" size={18} color={colors.surface} />
            <Text style={styles.primaryButtonText}>{planStrings.wizardFinish}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}