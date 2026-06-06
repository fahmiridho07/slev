import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { DeleteConfirmDialog } from "./src/components";
import { BRAND } from "./src/data/brand";
import { CaptureType } from "./src/features/app.types";
import {
  BalanceSnapshot,
  BudgetLimit,
  BudgetPeriod,
  CategoryMode,
  EntryType,
  ExpenseCategory,
  ManualTemplate,
  MoneyAccount,
  MoneyTransfer,
  MonthlyPlan,
  PatternFeedback,
  PatternFeedbackResponse,
  SavingsGoal,
  SpendingContext,
  SpendingMoment,
  SpendingPattern
} from "./src/features/spendingMemory.types";
import {
  getDailyPocketLabel,
  getDefaultMomentAccount,
  getIncomeHubLabel,
  getMonthKey,
  getRepeatSuggestions,
  getTemplateLabel,
  RepeatSuggestion
} from "./src/lib/analysis";
import { buildCurrentMonthSummary } from "./src/lib/financeEngine";
import { CategoryModeValue } from "./src/features/app.types";
import {
  formatAmountInput,
  parseAmountInput
} from "./src/lib/formatMoney";
import {
  formatCompactRupiah,
  formatRupiah,
  generateSpendingPatterns
} from "./src/lib/spendingMemoryPatterns";
import {
  getLatestBalanceTotal,
  getProjectedBalanceSnapshots
} from "./src/lib/financeEngine";
import {
  clearAccountsAndTransfers,
  deleteMoneyAccount,
  deleteMoneyTransfer,
  listMoneyAccounts,
  listMoneyTransfers,
  saveMoneyAccount,
  saveMoneyTransfer
} from "./src/services/accountRepository";
import {
  clearBudgetLimits,
  deleteBudgetLimit,
  listBudgetLimits,
  saveBudgetLimit
} from "./src/services/budgetRepository";
import {
  clearExpenseCategories,
  deleteExpenseCategory,
  getCategoryLabels,
  listExpenseCategories,
  saveExpenseCategory
} from "./src/services/categoryRepository";
import {
  clearManualFinance,
  deleteCategoryMode,
  deleteManualTemplate,
  deleteSavingsGoal,
  getMonthlyPlan,
  listBalanceSnapshots,
  listCategoryModes,
  listManualTemplates,
  listSavingsGoals,
  saveBalanceSnapshot,
  saveCategoryMode,
  saveManualTemplate,
  saveMonthlyPlan,
  saveSavingsGoal
} from "./src/services/manualFinanceRepository";
import {
  clearSpendingMemory,
  deleteSpendingMoment,
  listPatternFeedback,
  listSpendingMoments,
  savePatternFeedback,
  saveSpendingMoment,
  updateSpendingMoment
} from "./src/services/spendingMemoryRepository";
import {
  BudgetScreen,
  HomeScreen,
  MemoryScreen,
  PatternsScreen,
  SettingsScreen
} from "./src/screens";
import { colors } from "./src/theme/colors";
import { styles } from "./src/theme/styles/app";

type TabKey = "home" | "memory" | "budget" | "patterns" | "settings";

const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "home", label: "Home", icon: "home-outline" },
  { key: "memory", label: "Memory", icon: "albums-outline" },
  { key: "budget", label: "Budget", icon: "wallet-outline" },
  { key: "patterns", label: "Analysis", icon: "analytics-outline" }
];

const SLEV_MARK = require("./assets/brand/slev-mark-transparent.png");

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [isReady, setIsReady] = useState(false);
  const [moments, setMoments] = useState<SpendingMoment[]>([]);
  const [feedback, setFeedback] = useState<PatternFeedback[]>([]);
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>([]);
  const [categoryModes, setCategoryModes] = useState<CategoryMode[]>([]);
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyPlan | null>(null);
  const [manualTemplates, setManualTemplates] = useState<ManualTemplate[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [balanceSnapshots, setBalanceSnapshots] = useState<BalanceSnapshot[]>([]);
  const [accounts, setAccounts] = useState<MoneyAccount[]>([]);
  const [transfers, setTransfers] = useState<MoneyTransfer[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [amountText, setAmountText] = useState("");
  const [label, setLabel] = useState("");
  const [context, setContext] = useState<SpendingContext>("Other");
  const [note, setNote] = useState("");
  const [entryType, setEntryType] = useState<CaptureType>("expense");
  const [source, setSource] = useState("");
  const [accountLabel, setAccountLabel] = useState("Jago");
  const [fromAccount, setFromAccount] = useState("BRI");
  const [toAccount, setToAccount] = useState("Jago");
  const [clearConfirmVisible, setClearConfirmVisible] = useState(false);
  const [message, setMessage] = useState("A spending memory can be as small as an amount.");

  const reload = useCallback(async () => {
    const currentMonthKey = getMonthKey(new Date());
    const [
      storedMoments,
      storedFeedback,
      storedBudgetLimits,
      storedCategoryModes,
      storedMonthlyPlan,
      storedManualTemplates,
      storedSavingsGoals,
      storedBalanceSnapshots,
      storedAccounts,
      storedTransfers,
      storedExpenseCategories
    ] = await Promise.all([
      listSpendingMoments(),
      listPatternFeedback(),
      listBudgetLimits(),
      listCategoryModes(),
      getMonthlyPlan(currentMonthKey),
      listManualTemplates(),
      listSavingsGoals(),
      listBalanceSnapshots(),
      listMoneyAccounts(),
      listMoneyTransfers(),
      listExpenseCategories()
    ]);
    setMoments(storedMoments);
    setFeedback(storedFeedback);
    setBudgetLimits(storedBudgetLimits);
    setCategoryModes(storedCategoryModes);
    setMonthlyPlan(storedMonthlyPlan);
    setManualTemplates(storedManualTemplates);
    setSavingsGoals(storedSavingsGoals);
    setBalanceSnapshots(storedBalanceSnapshots);
    setAccounts(storedAccounts);
    setTransfers(storedTransfers);
    setExpenseCategories(storedExpenseCategories);
    const lastExpense = storedMoments.find((moment) => moment.type === "expense");
    if (lastExpense) {
      setContext(lastExpense.context);
    }
    const accountLabels = storedAccounts.map((account) => account.label);
    const incomeHub = storedAccounts.find((account) => account.isIncomeHub)?.label ?? accountLabels[0] ?? "BRI";
    const dailyPocket = storedAccounts.find((account) => !account.isIncomeHub)?.label ?? accountLabels[1] ?? "Jago";
    setAccountLabel((current) => accountLabels.includes(current) ? current : dailyPocket);
    setFromAccount((current) => accountLabels.includes(current) ? current : incomeHub);
    setToAccount((current) => accountLabels.includes(current) && current !== incomeHub ? current : dailyPocket);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      await reload();
      if (!cancelled) {
        setIsReady(true);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const patterns = useMemo(() => generateSpendingPatterns(moments), [moments]);
  const repeatSuggestions = useMemo(() => getRepeatSuggestions(moments), [moments]);
  const monthlySummary = useMemo(
    () => buildCurrentMonthSummary(moments, categoryModes),
    [categoryModes, moments]
  );
  const projectedBalanceSnapshots = useMemo(
    () =>
      getProjectedBalanceSnapshots({
        accounts,
        balanceSnapshots,
        moments,
        transfers
      }),
    [accounts, balanceSnapshots, moments, transfers]
  );
  const latestBalanceTotal = useMemo(
    () => getLatestBalanceTotal(projectedBalanceSnapshots),
    [projectedBalanceSnapshots]
  );
  const feedbackByPattern = useMemo(
    () => new Map(feedback.map((item) => [item.patternId, item.response])),
    [feedback]
  );
  const categoryLabels = useMemo(() => getCategoryLabels(expenseCategories), [expenseCategories]);

  useEffect(() => {
    if (categoryLabels.length > 0 && !categoryLabels.includes(context)) {
      setContext(categoryLabels.includes("Other") ? "Other" : categoryLabels[0]);
    }
  }, [categoryLabels, context]);

  function changeCaptureType(nextType: CaptureType) {
    setEntryType(nextType);
    if (nextType === "income") {
      setAccountLabel(getIncomeHubLabel(accounts));
    } else if (nextType === "expense") {
      setAccountLabel(getDailyPocketLabel(accounts));
    } else {
      const incomeHub = getIncomeHubLabel(accounts);
      const dailyPocket = getDailyPocketLabel(accounts);
      setFromAccount(incomeHub);
      setToAccount(dailyPocket === incomeHub ? accounts.find((account) => account.label !== incomeHub)?.label ?? dailyPocket : dailyPocket);
    }
  }

  function changeAmountText(value: string) {
    setAmountText(formatAmountInput(value));
  }

  async function saveCurrentMoment() {
    const amount = parseAmountInput(amountText);
    if (!amount) {
      setMessage("Enter an amount to save this memory.");
      return;
    }

    if (entryType === "expense" && categoryLabels.length === 0) {
      setMessage("Add at least one expense category in Settings before saving an expense.");
      return;
    }

    if (entryType === "transfer") {
      if (!fromAccount || !toAccount || fromAccount === toAccount) {
        setMessage("Choose two different accounts for this transfer.");
        return;
      }

      const updatedTransfers = await saveMoneyTransfer({
        amount,
        fromAccount,
        note,
        toAccount
      });
      setTransfers(updatedTransfers);
      setMessage(`${formatRupiah(amount)} moved from ${fromAccount} to ${toAccount}.`);
      setAmountText("");
      setNote("");
      return;
    }

    const saved = await saveSpendingMoment({
      amount,
      label: entryType === "expense" ? label : undefined,
      context: entryType === "expense" ? context : "Other",
      note,
      type: entryType,
      source: entryType === "income" ? source : undefined,
      accountLabel
    });
    setMoments(await listSpendingMoments());
    if (saved.type === "expense") {
      setContext(saved.context);
    }
    setMessage(
      saved.type === "income"
        ? `${formatRupiah(saved.amount)} income saved${saved.source ? ` from ${saved.source}` : ""}.`
        : `${formatRupiah(saved.amount)} saved${saved.label ? ` for ${saved.label}` : ""}.`
    );

    setAmountText("");
    setLabel("");
    setNote("");
    setSource("");
    setAccountLabel(getDailyPocketLabel(accounts));
    setEntryType("expense");
  }

  async function removeMoment(id: string) {
    const updated = await deleteSpendingMoment(id);
    setMoments(updated);
    setMessage("Memory removed.");
  }

  async function updateMoment(id: string, input: {
    amountText: string;
    label: string;
    context: SpendingContext;
    note: string;
    type: EntryType;
    source: string;
    accountLabel: string;
  }) {
    const amount = parseAmountInput(input.amountText);
    if (!amount) {
      setMessage("Enter an amount before saving changes.");
      return;
    }

    const updated = await updateSpendingMoment(id, {
      amount,
      label: input.type === "expense" ? input.label : undefined,
      context: input.type === "expense" ? input.context : "Other",
      note: input.note,
      type: input.type,
      source: input.type === "income" ? input.source : undefined,
      accountLabel: input.accountLabel
    });
    setMoments(updated);
    setMessage("Memory updated.");
  }

  function useRepeatSuggestion(suggestion: RepeatSuggestion) {
    setEntryType("expense");
    setLabel(suggestion.label);
    setContext(suggestion.context);
    setAccountLabel(suggestion.accountLabel ?? getDailyPocketLabel(accounts));
    if (!amountText.trim()) {
      setAmountText(formatAmountInput(String(suggestion.amount)));
    }
  }

  function useManualTemplate(template: ManualTemplate) {
    setEntryType(template.type);
    setLabel(template.type === "expense" ? template.label ?? "" : "");
    setContext(template.context);
    setSource(template.type === "income" ? template.source ?? "" : "");
    setAccountLabel(template.accountLabel ?? getDefaultMomentAccount(template.type, accounts));
    setNote(template.note ?? "");
    if (template.amount > 0) {
      setAmountText(formatAmountInput(String(template.amount)));
    }
    setMessage(`${getTemplateLabel(template)} ready to save.`);
  }

  async function saveCurrentAsTemplate() {
    if (entryType === "transfer") {
      setMessage("Transfer shortcuts can use the account chips directly.");
      return;
    }

    const amount = parseAmountInput(amountText);
    const templateLabel = entryType === "income" ? source.trim() : (label.trim() || context);
    if (!templateLabel) {
      setMessage("Add a label or source before saving a shortcut.");
      return;
    }

    const updated = await saveManualTemplate({
      amount: amount ?? undefined,
      context: entryType === "expense" ? context : "Other",
      label: entryType === "expense" ? templateLabel : undefined,
      note,
      accountLabel,
      source: entryType === "income" ? source : undefined,
      type: entryType
    });
    setManualTemplates(updated);
    setMessage(`${templateLabel} shortcut saved.`);
  }

  async function removeManualTemplate(id: string) {
    const updated = await deleteManualTemplate(id);
    setManualTemplates(updated);
    setMessage("Shortcut removed.");
  }

  async function removeTransfer(id: string) {
    const updated = await deleteMoneyTransfer(id);
    setTransfers(updated);
    setMessage("Transfer removed.");
  }

  async function saveAccount(input: {
    id?: string;
    isIncomeHub: boolean;
    kind: MoneyAccount["kind"];
    label: string;
  }) {
    if (!input.label.trim()) {
      setMessage("Add an account or wallet name.");
      return;
    }

    const updated = await saveMoneyAccount(input);
    setAccounts(updated);
    setMessage(`${input.label.trim()} account saved.`);
  }

  async function removeAccount(id: string) {
    const updated = await deleteMoneyAccount(id);
    setAccounts(updated);
    const labels = updated.map((account) => account.label);
    setAccountLabel((current) => labels.includes(current) ? current : labels[0] ?? "");
    setFromAccount((current) => labels.includes(current) ? current : labels[0] ?? "BRI");
    setToAccount((current) => labels.includes(current) ? current : labels[1] ?? labels[0] ?? "Jago");
    setMessage(updated.some((account) => account.id === id) ? "Keep at least one account for balances." : "Account removed.");
  }

  async function saveCategory(input: { id?: string; label: string }) {
    if (!input.label.trim()) {
      setMessage("Add a category name.");
      return;
    }

    const updated = await saveExpenseCategory(input);
    setExpenseCategories(updated);
    setMessage(`${input.label.trim()} category saved.`);
  }

  async function removeCategory(category: ExpenseCategory) {
    const updatedCategories = await deleteExpenseCategory(category.id);
    const updatedLimits = await deleteBudgetLimit(category.label);
    const updatedModes = await deleteCategoryMode(category.label);
    setExpenseCategories(updatedCategories);
    setBudgetLimits(updatedLimits);
    setCategoryModes(updatedModes);
    if (context === category.label) {
      setContext("Other");
    }
    setMessage(`${category.label} category removed.`);
  }

  async function saveCategoryBudget(category: SpendingContext, amountTextValue: string, period: BudgetPeriod) {
    const limitAmount = parseAmountInput(amountTextValue);
    if (!limitAmount) {
      setMessage("Enter an amount to save this limit.");
      return;
    }

    const updated = await saveBudgetLimit({ category, limitAmount, period });
    setBudgetLimits(updated);
    setMessage(`${category} limit saved for ${period === "weekly" ? "the week" : "the month"}.`);
  }

  async function removeCategoryBudget(category: SpendingContext) {
    const updated = await deleteBudgetLimit(category);
    setBudgetLimits(updated);
    setMessage(`${category} limit removed.`);
  }

  async function changeCategoryMode(category: SpendingContext, mode: CategoryModeValue) {
    const updated = await saveCategoryMode(category, mode);
    setCategoryModes(updated);
    setMessage(`${category} marked as ${mode}.`);
  }

  async function savePlan(input: {
    fixedCosts: string;
    flexibleBudget: string;
    note: string;
    expectedIncome: string;
    savingsTarget: string;
  }) {
    const currentMonthKey = getMonthKey(new Date());
    const saved = await saveMonthlyPlan({
      expectedIncome: parseAmountInput(input.expectedIncome) ?? 0,
      fixedCosts: parseAmountInput(input.fixedCosts) ?? 0,
      flexibleBudget: parseAmountInput(input.flexibleBudget) ?? 0,
      month: currentMonthKey,
      note: input.note,
      savingsTarget: parseAmountInput(input.savingsTarget) ?? 0
    });
    setMonthlyPlan(saved);
    setMessage("Monthly plan saved.");
  }

  async function saveGoal(input: {
    id?: string;
    label: string;
    savedAmount: string;
    targetAmount: string;
  }) {
    const targetAmount = parseAmountInput(input.targetAmount);
    if (!input.label.trim() || !targetAmount) {
      setMessage("Add a goal name and target amount.");
      return;
    }

    const updated = await saveSavingsGoal({
      id: input.id,
      label: input.label,
      savedAmount: parseAmountInput(input.savedAmount) ?? 0,
      targetAmount
    });
    setSavingsGoals(updated);
    setMessage("Savings goal saved.");
  }

  async function removeSavingsGoal(id: string) {
    const updated = await deleteSavingsGoal(id);
    setSavingsGoals(updated);
    setMessage("Savings goal removed.");
  }

  async function saveBalance(input: { accountLabel: string; amount: string }) {
    const amount = parseAmountInput(input.amount);
    if (!input.accountLabel.trim() || !amount) {
      setMessage("Add an account name and balance amount.");
      return;
    }

    const updated = await saveBalanceSnapshot({
      amount,
      accountLabel: input.accountLabel
    });
    setBalanceSnapshots(updated);
    setMessage("Balance snapshot saved.");
  }

  async function answerPattern(patternId: string, response: PatternFeedbackResponse) {
    const updated = await savePatternFeedback(patternId, response);
    setFeedback(updated);
  }

  function clearAll() {
    setClearConfirmVisible(true);
  }

  async function confirmClearAll() {
    await Promise.all([
      clearSpendingMemory(),
      clearBudgetLimits(),
      clearManualFinance(),
      clearAccountsAndTransfers(),
      clearExpenseCategories()
    ]);
    const [resetAccounts, resetCategories] = await Promise.all([
      listMoneyAccounts(),
      listExpenseCategories()
    ]);
    setMoments([]);
    setFeedback([]);
    setBudgetLimits([]);
    setCategoryModes([]);
    setMonthlyPlan(null);
    setManualTemplates([]);
    setSavingsGoals([]);
    setBalanceSnapshots([]);
    setAccounts(resetAccounts);
    setTransfers([]);
    setExpenseCategories(resetCategories);
    setClearConfirmVisible(false);
    setMessage("Local finance memory cleared.");
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.appShell}
        >
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View style={styles.brandRow}>
                <Image source={SLEV_MARK} style={styles.brandMark} />
                <View>
                  <Text style={styles.brandName}>{BRAND.name}</Text>
                  <Text style={styles.brandLine}>Spending memory</Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setActiveTab("settings")}
                style={[styles.iconButton, activeTab === "settings" && styles.iconButtonActive]}
              >
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={activeTab === "settings" ? colors.greenDark : colors.muted}
                />
              </Pressable>
            </View>
            <Text style={styles.headerMessage}>{message}</Text>
          </View>

          <View style={styles.content}>
            {!isReady && (
              <View style={styles.bootState}>
                <Text style={styles.bootText}>Preparing local memory...</Text>
              </View>
            )}
            {isReady && activeTab === "home" && (
              <HomeScreen
                accountLabel={accountLabel}
                accounts={accounts}
                amountText={amountText}
                categoryLabels={categoryLabels}
                context={context}
                entryType={entryType}
                fromAccount={fromAccount}
                label={label}
                latestBalanceTotal={latestBalanceTotal}
                manualTemplates={manualTemplates}
                monthlyPlan={monthlyPlan}
                monthlySummary={monthlySummary}
                note={note}
                repeatSuggestions={repeatSuggestions}
                source={source}
                toAccount={toAccount}
                onChangeAmount={changeAmountText}
                onChangeContext={setContext}
                onChangeEntryType={changeCaptureType}
                onChangeFromAccount={setFromAccount}
                onChangeAccount={setAccountLabel}
                onChangeLabel={setLabel}
                onChangeNote={setNote}
                onChangeSource={setSource}
                onChangeToAccount={setToAccount}
                onDeleteTemplate={removeManualTemplate}
                onOpenSettings={() => setActiveTab("settings")}
                onSave={saveCurrentMoment}
                onSaveTemplate={saveCurrentAsTemplate}
                onUseTemplate={useManualTemplate}
                onUseRepeat={useRepeatSuggestion}
              />
            )}
            {isReady && activeTab === "memory" && (
              <MemoryScreen
                accounts={accounts}
                categoryLabels={categoryLabels}
                moments={moments}
                onDelete={removeMoment}
                onUpdate={updateMoment}
              />
            )}
            {isReady && activeTab === "budget" && (
              <BudgetScreen
                accounts={accounts}
                balanceSnapshots={balanceSnapshots}
                budgetLimits={budgetLimits}
                categoryLabels={categoryLabels}
                categoryModes={categoryModes}
                expenseCategories={expenseCategories}
                monthlyPlan={monthlyPlan}
                moments={moments}
                projectedBalanceSnapshots={projectedBalanceSnapshots}
                transfers={transfers}
                onDeleteAccount={removeAccount}
                onDeleteCategory={removeCategory}
                onDeleteLimit={removeCategoryBudget}
                onDeleteGoal={removeSavingsGoal}
                onOpenSettings={() => setActiveTab("settings")}
                onSaveAccount={saveAccount}
                onSaveBalance={saveBalance}
                onSaveCategoryMode={changeCategoryMode}
                onSaveGoal={saveGoal}
                onSaveLimit={saveCategoryBudget}
                onSaveMonthlyPlan={savePlan}
                savingsGoals={savingsGoals}
              />
            )}
            {isReady && activeTab === "patterns" && (
              <PatternsScreen
                accounts={accounts}
                balanceSnapshots={balanceSnapshots}
                feedbackByPattern={feedbackByPattern}
                moments={moments}
                patterns={patterns}
                projectedBalanceSnapshots={projectedBalanceSnapshots}
                transfers={transfers}
                onDeleteTransfer={removeTransfer}
                onAnswer={answerPattern}
              />
            )}
            {isReady && activeTab === "settings" && (
              <SettingsScreen
                expenseCategories={expenseCategories}
                momentCount={moments.length}
                onDeleteCategory={removeCategory}
                onClear={clearAll}
                onSaveCategory={saveCategory}
              />
            )}
          </View>

          <View style={styles.tabBar}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={20}
                    color={isActive ? colors.greenDark : colors.muted}
                  />
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <DeleteConfirmDialog
            body="This removes entries, plans, goals, balances, limits, accounts, transfers, and categories from this device."
            confirmLabel="Clear"
            onCancel={() => setClearConfirmVisible(false)}
            onConfirm={confirmClearAll}
            title="Clear local finance memory?"
            visible={clearConfirmVisible}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
