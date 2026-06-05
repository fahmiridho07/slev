import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TextInput,
  ViewStyle,
  View
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { getAccountBrand } from "./src/data/accountBrands";
import { BRAND } from "./src/data/brand";
import { CONTEXT_HINTS } from "./src/data/spendingMemory";
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
  MonthlyClosing,
  MonthlyPlan,
  PatternFeedback,
  PatternFeedbackResponse,
  SavingsGoal,
  SpendingContext,
  SpendingMoment,
  SpendingPattern
} from "./src/features/spendingMemory.types";
import {
  formatCompactRupiah,
  formatRupiah,
  generateSpendingPatterns,
  getHomeObservation
} from "./src/lib/spendingMemoryPatterns";
import {
  AccountReconciliationRow,
  AllocationPlan,
  buildAccountReconciliation,
  buildAllocationPlan,
  buildCurrentMonthSummary,
  buildMonthlyBreakdown,
  FinanceBreakdownRow,
  FinanceMonthSummary,
  getLatestBalanceSnapshots,
  getLatestBalanceTotal,
  getModeByCategory
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
  deleteManualTemplate,
  deleteSavingsGoal,
  getMonthlyPlan,
  listBalanceSnapshots,
  listCategoryModes,
  listManualTemplates,
  listMonthlyClosings,
  listSavingsGoals,
  saveBalanceSnapshot,
  saveCategoryMode,
  saveManualTemplate,
  saveMonthlyClosing,
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
import { colors, shadows } from "./src/theme/colors";

type TabKey = "home" | "memory" | "budget" | "patterns" | "settings";
type CategoryModeValue = CategoryMode["mode"];
type CaptureType = EntryType | "transfer";

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
  const [monthlyClosings, setMonthlyClosings] = useState<MonthlyClosing[]>([]);
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
  const [editingMomentId, setEditingMomentId] = useState<string | null>(null);
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
      storedMonthlyClosings,
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
      listMonthlyClosings(),
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
    setMonthlyClosings(storedMonthlyClosings);
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
  const homeObservation = useMemo(() => getHomeObservation(moments), [moments]);
  const repeatSuggestions = useMemo(() => getRepeatSuggestions(moments), [moments]);
  const monthlySummary = useMemo(
    () => buildCurrentMonthSummary(moments, categoryModes),
    [categoryModes, moments]
  );
  const latestBalanceTotal = useMemo(
    () => getLatestBalanceTotal(balanceSnapshots),
    [balanceSnapshots]
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

    if (editingMomentId) {
      const updated = await updateSpendingMoment(editingMomentId, {
        amount,
        label: entryType === "expense" ? label : undefined,
        context: entryType === "expense" ? context : "Other",
        note,
        type: entryType,
        source: entryType === "income" ? source : undefined,
        accountLabel
      });
      setMoments(updated);
      setEditingMomentId(null);
      setMessage("Memory updated.");
    } else {
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
    }

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

  async function undoLastMoment(moment: SpendingMoment) {
    const updated = await deleteSpendingMoment(moment.id);
    setMoments(updated);
    setEditingMomentId(null);
    setMessage("Last memory undone.");
  }

  function editLastMoment(moment: SpendingMoment) {
    setEditingMomentId(moment.id);
    setAmountText(formatAmountInput(String(moment.amount)));
    setLabel(moment.label ?? "");
    setContext(moment.context);
    setNote(moment.note ?? "");
    setEntryType(moment.type);
    setSource(moment.source ?? "");
    setAccountLabel(moment.accountLabel ?? getDefaultMomentAccount(moment.type, accounts));
    setMessage("Editing the last saved memory.");
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
    setFromAccount((current) => labels.includes(current) ? current : labels[0] ?? "BRI");
    setToAccount((current) => labels.includes(current) ? current : labels[1] ?? labels[0] ?? "Jago");
    setMessage("Account removed.");
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
    setExpenseCategories(updatedCategories);
    setBudgetLimits(updatedLimits);
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

  async function completeMonthlyClose(input: {
    nextMonthAdjustment: string;
    totalExpenses: number;
    totalIncome: number;
  }) {
    const updated = await saveMonthlyClosing({
      month: getMonthKey(new Date()),
      netCashflow: input.totalIncome - input.totalExpenses,
      nextMonthAdjustment: input.nextMonthAdjustment,
      totalExpenses: input.totalExpenses,
      totalIncome: input.totalIncome
    });
    setMonthlyClosings(updated);
    setMessage("Monthly close saved.");
  }

  async function answerPattern(patternId: string, response: PatternFeedbackResponse) {
    const updated = await savePatternFeedback(patternId, response);
    setFeedback(updated);
  }

  async function clearAll() {
    Alert.alert("Clear local finance memory?", "This removes entries, plans, goals, balances, limits, accounts, transfers, and categories from this device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
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
          setMonthlyClosings([]);
          setAccounts(resetAccounts);
          setTransfers([]);
          setExpenseCategories(resetCategories);
          setMessage("Local finance memory cleared.");
        }
      }
    ]);
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
                homeObservation={homeObservation}
                isEditing={Boolean(editingMomentId)}
                label={label}
                lastSavedMoment={moments[0]}
                latestBalanceTotal={latestBalanceTotal}
                manualTemplates={manualTemplates}
                monthlyPlan={monthlyPlan}
                monthlySummary={monthlySummary}
                note={note}
                recentMoments={moments.slice(0, 5)}
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
                onEditLast={editLastMoment}
                onDeleteTemplate={removeManualTemplate}
                onOpenSettings={() => setActiveTab("settings")}
                onSave={saveCurrentMoment}
                onSaveTemplate={saveCurrentAsTemplate}
                onUndoLast={undoLastMoment}
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
                monthlyClosings={monthlyClosings}
                monthlyPlan={monthlyPlan}
                moments={moments}
                transfers={transfers}
                onDeleteAccount={removeAccount}
                onDeleteLimit={removeCategoryBudget}
                onDeleteGoal={removeSavingsGoal}
                onOpenSettings={() => setActiveTab("settings")}
                onSaveAccount={saveAccount}
                onSaveBalance={saveBalance}
                onSaveCategoryMode={changeCategoryMode}
                onSaveGoal={saveGoal}
                onSaveLimit={saveCategoryBudget}
                onSaveMonthlyClose={completeMonthlyClose}
                onSaveMonthlyPlan={savePlan}
                savingsGoals={savingsGoals}
              />
            )}
            {isReady && activeTab === "patterns" && (
              <PatternsScreen
                accounts={accounts}
                balanceSnapshots={balanceSnapshots}
                categoryModes={categoryModes}
                feedbackByPattern={feedbackByPattern}
                monthlyPlan={monthlyPlan}
                moments={moments}
                patterns={patterns}
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function HomeScreen({
  accountLabel,
  accounts,
  amountText,
  categoryLabels,
  context,
  entryType,
  fromAccount,
  homeObservation,
  isEditing,
  label,
  lastSavedMoment,
  latestBalanceTotal,
  manualTemplates,
  monthlyPlan,
  monthlySummary,
  note,
  recentMoments,
  repeatSuggestions,
  source,
  toAccount,
  onChangeAmount,
  onChangeAccount,
  onChangeContext,
  onChangeEntryType,
  onChangeFromAccount,
  onChangeLabel,
  onChangeNote,
  onChangeSource,
  onChangeToAccount,
  onDeleteTemplate,
  onEditLast,
  onSave,
  onSaveTemplate,
  onOpenSettings,
  onUndoLast,
  onUseTemplate,
  onUseRepeat
}: {
  accountLabel: string;
  accounts: MoneyAccount[];
  amountText: string;
  categoryLabels: SpendingContext[];
  context: SpendingContext;
  entryType: CaptureType;
  fromAccount: string;
  homeObservation: SpendingPattern;
  isEditing: boolean;
  label: string;
  lastSavedMoment?: SpendingMoment;
  latestBalanceTotal: number;
  manualTemplates: ManualTemplate[];
  monthlyPlan: MonthlyPlan | null;
  monthlySummary: MonthlySummary;
  note: string;
  recentMoments: SpendingMoment[];
  repeatSuggestions: RepeatSuggestion[];
  source: string;
  toAccount: string;
  onChangeAmount: (value: string) => void;
  onChangeAccount: (value: string) => void;
  onChangeContext: (value: SpendingContext) => void;
  onChangeEntryType: (value: CaptureType) => void;
  onChangeFromAccount: (value: string) => void;
  onChangeLabel: (value: string) => void;
  onChangeNote: (value: string) => void;
  onChangeSource: (value: string) => void;
  onChangeToAccount: (value: string) => void;
  onDeleteTemplate: (id: string) => void;
  onEditLast: (moment: SpendingMoment) => void;
  onSave: () => void;
  onSaveTemplate: () => void;
  onOpenSettings: () => void;
  onUndoLast: (moment: SpendingMoment) => void;
  onUseTemplate: (template: ManualTemplate) => void;
  onUseRepeat: (suggestion: RepeatSuggestion) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(Boolean(note));

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <HomeMoneyPulse
        latestBalanceTotal={latestBalanceTotal}
        monthlyPlan={monthlyPlan}
        monthlySummary={monthlySummary}
      />

      <View style={styles.capturePanel}>
        <Text style={styles.kicker}>{isEditing ? "Edit memory" : "Quick capture"}</Text>
        {manualTemplates.length > 0 && (
          <View style={styles.repeatBlock}>
            <Text style={styles.microLabel}>Manual shortcuts</Text>
            <View style={styles.templateGrid}>
              {manualTemplates.slice(0, 6).map((template) => (
                <View key={template.id} style={styles.templateChip}>
                  <Pressable onPress={() => onUseTemplate(template)} style={styles.templateMain}>
                    <Text style={styles.repeatText}>{getTemplateLabel(template)}</Text>
                    <Text style={styles.repeatAmount}>
                      {template.amount > 0 ? formatRupiah(template.amount) : template.type === "income" ? "Income" : template.context}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => onDeleteTemplate(template.id)} style={styles.templateRemoveButton}>
                    <Ionicons name="close-outline" size={14} color={colors.muted} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}
        <SegmentedControl
          options={
            isEditing
              ? [
                  { label: "Expense", value: "expense" },
                  { label: "Income", value: "income" }
                ]
              : [
                  { label: "Expense", value: "expense" },
                  { label: "Income", value: "income" },
                  { label: "Transfer", value: "transfer" }
                ]
          }
          selected={entryType}
          onSelect={onChangeEntryType}
        />
        <View style={styles.amountRow}>
          <Text style={styles.currencyPrefix}>Rp</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={onChangeAmount}
            placeholder="0"
            placeholderTextColor={colors.muted}
            style={styles.amountInput}
            value={amountText}
          />
        </View>

        {entryType === "transfer" ? (
          <View style={styles.transferPickerBlock}>
            <AccountPicker
              accounts={accounts}
              label="From"
              selected={fromAccount}
              onSelect={onChangeFromAccount}
            />
            <AccountPicker
              accounts={accounts.filter((account) => account.label !== fromAccount)}
              label="To"
              selected={toAccount === fromAccount ? "" : toAccount}
              onSelect={onChangeToAccount}
            />
          </View>
        ) : entryType === "income" ? (
          <TextInput
            onChangeText={onChangeSource}
            placeholder="Source, optional"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={source}
          />
        ) : (
          <TextInput
            onChangeText={onChangeLabel}
            placeholder="Label, optional"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={label}
          />
        )}

        {entryType !== "transfer" && (
          <AccountPicker
            accounts={accounts}
            label={entryType === "income" ? "Received in" : "Paid from"}
            selected={accountLabel}
            onSelect={onChangeAccount}
          />
        )}

        {entryType === "expense" && repeatSuggestions.length > 0 && (
          <View style={styles.repeatBlock}>
            <Text style={styles.microLabel}>Repeat faster</Text>
            <View style={styles.suggestionRow}>
              {repeatSuggestions.map((item) => (
                <Pressable key={`${item.label}-${item.context}`} onPress={() => onUseRepeat(item)} style={styles.repeatChip}>
                  <Text style={styles.repeatText}>{item.label}</Text>
                  <Text style={styles.repeatAmount}>{formatCompactRupiah(item.amount)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {entryType === "expense" && (
          categoryLabels.length === 0 ? (
            <EmptyState
              text="No expense categories are active. Add one before saving expenses."
              actionLabel="Open Settings"
              onAction={onOpenSettings}
            />
          ) : (
          <>
            <View style={styles.contextHeaderRow}>
              <Text style={styles.microLabel}>Context</Text>
              <Text style={styles.contextDefault}>Defaults to last used</Text>
            </View>
            <ContextPicker categories={categoryLabels} selected={context} onSelect={onChangeContext} />
          </>
          )
        )}

        {noteOpen ? (
          <TextInput
            multiline
            onChangeText={onChangeNote}
            placeholder="Tiny note, optional"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.noteInput]}
            value={note}
          />
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setNoteOpen(true)} style={styles.addNoteButton}>
            <Ionicons name="create-outline" size={16} color={colors.muted} />
            <Text style={styles.addNoteText}>Add note only if it helps recall</Text>
          </Pressable>
        )}

        <Pressable accessibilityRole="button" onPress={onSave} style={styles.primaryButton}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.surface} />
          <Text style={styles.primaryButtonText}>
            {isEditing ? "Update memory" : entryType === "income" ? "Save income" : entryType === "transfer" ? "Save transfer" : "Save memory"}
          </Text>
        </Pressable>
        {!isEditing && (
          <Pressable accessibilityRole="button" onPress={onSaveTemplate} style={styles.secondaryInlineButton}>
            <Ionicons name="bookmark-outline" size={16} color={colors.greenDark} />
            <Text style={styles.textButtonLabel}>Save as shortcut</Text>
          </Pressable>
        )}
      </View>

      {lastSavedMoment && !isEditing && (
        <View style={styles.lastSavedPanel}>
          <View style={styles.lastSavedText}>
            <Text style={styles.microLabel}>Last saved</Text>
            <Text style={styles.lastSavedTitle}>
              {formatMomentAmount(lastSavedMoment)} - {getMomentTitle(lastSavedMoment)}
            </Text>
          </View>
          <View style={styles.lastSavedActions}>
            <Pressable onPress={() => onEditLast(lastSavedMoment)} style={styles.textButton}>
              <Ionicons name="create-outline" size={16} color={colors.greenDark} />
              <Text style={styles.textButtonLabel}>Edit</Text>
            </Pressable>
            <Pressable onPress={() => onUndoLast(lastSavedMoment)} style={styles.textButton}>
              <Ionicons name="arrow-undo-outline" size={16} color={colors.coral} />
              <Text style={[styles.textButtonLabel, styles.deleteText]}>Undo</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ObservationPanel pattern={homeObservation} />

      <SectionHeader title="Recent memory" />
      {recentMoments.length === 0 ? (
        <EmptyState text="Saved moments will collect here quietly." />
      ) : (
        <View style={styles.listPanel}>
          {recentMoments.slice(0, 3).map((moment) => (
            <MomentRow
              key={moment.id}
              moment={moment}
              repeatHint={getRepeatHint(moment, recentMoments)}
              compact
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function HomeMoneyPulse({
  latestBalanceTotal,
  monthlyPlan,
  monthlySummary
}: {
  latestBalanceTotal: number;
  monthlyPlan: MonthlyPlan | null;
  monthlySummary: MonthlySummary;
}) {
  const savingsTarget = monthlyPlan?.savingsTarget ?? 0;
  const estimatedSavings = Math.max(0, monthlySummary.net);

  return (
    <View style={styles.pulsePanel}>
      <View style={styles.pulseItem}>
        <Text style={styles.microLabel}>Net this month</Text>
        <Text style={[styles.pulseValue, monthlySummary.net < 0 && styles.expenseText]}>
          {formatSignedCompactRupiah(monthlySummary.net)}
        </Text>
      </View>
      <View style={styles.pulseItem}>
        <Text style={styles.microLabel}>Spending</Text>
        <Text style={styles.pulseValue}>{formatCompactRupiah(monthlySummary.expense)}</Text>
      </View>
      <View style={styles.pulseItem}>
        <Text style={styles.microLabel}>Balance</Text>
        <Text style={styles.pulseValue}>{formatCompactRupiah(latestBalanceTotal)}</Text>
      </View>
      {savingsTarget > 0 && (
        <View style={styles.pulseWideItem}>
          <Text style={styles.settingCopy}>
            Savings target: {formatCompactRupiah(savingsTarget)} - current pace {formatCompactRupiah(estimatedSavings)}
          </Text>
        </View>
      )}
    </View>
  );
}

function MemoryScreen({
  accounts,
  categoryLabels,
  moments,
  onDelete,
  onUpdate
}: {
  accounts: MoneyAccount[];
  categoryLabels: SpendingContext[];
  moments: SpendingMoment[];
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    input: {
      amountText: string;
      label: string;
      context: SpendingContext;
      note: string;
      type: EntryType;
      source: string;
      accountLabel: string;
    }
  ) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editContext, setEditContext] = useState<SpendingContext>("Other");
  const [editNote, setEditNote] = useState("");
  const [editType, setEditType] = useState<EntryType>("expense");
  const [editSource, setEditSource] = useState("");
  const [editAccountLabel, setEditAccountLabel] = useState("");
  const [query, setQuery] = useState("");
  const filteredMoments = useMemo(() => filterMoments(moments, query), [moments, query]);
  const grouped = useMemo(() => groupMomentsByRecallRange(filteredMoments), [filteredMoments]);

  function startEditing(moment: SpendingMoment) {
    setEditingId(moment.id);
    setEditAmount(formatAmountInput(String(moment.amount)));
    setEditLabel(moment.label ?? "");
    setEditContext(moment.context);
    setEditNote(moment.note ?? "");
    setEditType(moment.type);
    setEditSource(moment.source ?? "");
    setEditAccountLabel(moment.accountLabel ?? getDefaultMomentAccount(moment.type, accounts));
  }

  function confirmDelete(moment: SpendingMoment) {
    Alert.alert("Delete this memory?", moment.label ?? formatRupiah(moment.amount), [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(moment.id) }
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.heroPanel}>
        <Text style={styles.kickerDark}>Memory</Text>
        <Text style={styles.heroTitle}>A quiet list of where money went.</Text>
      </View>

      {moments.length > 0 && (
        <TextInput
          onChangeText={setQuery}
          placeholder="Search label, context, or amount"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={query}
        />
      )}

      {moments.length === 0 ? (
        <EmptyState text="No saved spending memory yet." />
      ) : filteredMoments.length === 0 ? (
        <EmptyState text="No memory matches that search." />
      ) : (
        grouped.map((group) => (
          <View key={group.key} style={styles.memoryGroup}>
            <Text style={styles.groupTitle}>{group.label}</Text>
            <View style={styles.listPanel}>
              {group.items.map((moment) => (
                <View key={moment.id}>
                  <MomentRow moment={moment} repeatHint={getRepeatHint(moment, moments)} />
                  <View style={styles.rowActions}>
                    <Pressable onPress={() => startEditing(moment)} style={styles.textButton}>
                      <Ionicons name="create-outline" size={16} color={colors.greenDark} />
                      <Text style={styles.textButtonLabel}>Edit</Text>
                    </Pressable>
                    <Pressable onPress={() => confirmDelete(moment)} style={styles.textButton}>
                      <Ionicons name="trash-outline" size={16} color={colors.coral} />
                      <Text style={[styles.textButtonLabel, styles.deleteText]}>Delete</Text>
                    </Pressable>
                  </View>

                  {editingId === moment.id && (
                    <View style={styles.editPanel}>
                      <TextInput
                        keyboardType="number-pad"
                        onChangeText={(value) => setEditAmount(formatAmountInput(value))}
                        placeholder="Amount"
                        placeholderTextColor={colors.muted}
                        style={styles.input}
                        value={editAmount}
                      />
                      <TextInput
                        onChangeText={editType === "income" ? setEditSource : setEditLabel}
                        placeholder={editType === "income" ? "Source" : "Label"}
                        placeholderTextColor={colors.muted}
                        style={styles.input}
                        value={editType === "income" ? editSource : editLabel}
                      />
                      <SegmentedControl
                        compact
                        options={[
                          { label: "Expense", value: "expense" },
                          { label: "Income", value: "income" }
                        ]}
                        selected={editType}
                        onSelect={setEditType}
                      />
                      {editType === "expense" && (
                        <ContextPicker categories={categoryLabels} selected={editContext} onSelect={setEditContext} compact />
                      )}
                      <AccountPicker
                        accounts={accounts}
                        label={editType === "income" ? "Received in" : "Paid from"}
                        selected={editAccountLabel}
                        onSelect={setEditAccountLabel}
                      />
                      <TextInput
                        multiline
                        onChangeText={setEditNote}
                        placeholder="Note"
                        placeholderTextColor={colors.muted}
                        style={[styles.input, styles.noteInput]}
                        value={editNote}
                      />
                      <View style={styles.editActions}>
                        <Pressable onPress={() => setEditingId(null)} style={styles.secondaryButton}>
                          <Text style={styles.secondaryButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            onUpdate(moment.id, {
                              amountText: editAmount,
                              label: editLabel,
                              context: editContext,
                              note: editNote,
                              type: editType,
                              source: editSource,
                              accountLabel: editAccountLabel
                            });
                            setEditingId(null);
                          }}
                          style={styles.smallPrimaryButton}
                        >
                          <Text style={styles.primaryButtonText}>Save</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function BudgetScreen({
  accounts,
  balanceSnapshots,
  budgetLimits,
  categoryLabels,
  categoryModes,
  expenseCategories,
  monthlyClosings,
  monthlyPlan,
  moments,
  transfers,
  onDeleteAccount,
  onDeleteLimit,
  onDeleteGoal,
  onOpenSettings,
  onSaveAccount,
  onSaveBalance,
  onSaveCategoryMode,
  onSaveGoal,
  onSaveLimit,
  onSaveMonthlyClose,
  onSaveMonthlyPlan,
  savingsGoals
}: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  budgetLimits: BudgetLimit[];
  categoryLabels: SpendingContext[];
  categoryModes: CategoryMode[];
  expenseCategories: ExpenseCategory[];
  monthlyClosings: MonthlyClosing[];
  monthlyPlan: MonthlyPlan | null;
  moments: SpendingMoment[];
  transfers: MoneyTransfer[];
  onDeleteAccount: (id: string) => void;
  onDeleteLimit: (category: SpendingContext) => void;
  onDeleteGoal: (id: string) => void;
  onOpenSettings: () => void;
  onSaveAccount: (input: {
    id?: string;
    isIncomeHub: boolean;
    kind: MoneyAccount["kind"];
    label: string;
  }) => void;
  onSaveBalance: (input: { accountLabel: string; amount: string }) => void;
  onSaveCategoryMode: (category: SpendingContext, mode: CategoryModeValue) => void;
  onSaveGoal: (input: {
    id?: string;
    label: string;
    savedAmount: string;
    targetAmount: string;
  }) => void;
  onSaveLimit: (category: SpendingContext, amountText: string, period: BudgetPeriod) => void;
  onSaveMonthlyClose: (input: {
    nextMonthAdjustment: string;
    totalExpenses: number;
    totalIncome: number;
  }) => void;
  onSaveMonthlyPlan: (input: {
    expectedIncome: string;
    fixedCosts: string;
    flexibleBudget: string;
    note: string;
    savingsTarget: string;
  }) => void;
  savingsGoals: SavingsGoal[];
}) {
  const [activeBudgetTab, setActiveBudgetTab] = useState<BudgetTabKey>("allocation");
  const monthlySummary = useMemo(
    () => buildCurrentMonthSummary(moments, categoryModes),
    [categoryModes, moments]
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.heroPanel}>
        <Text style={styles.kickerDark}>Money plan</Text>
        <Text style={styles.heroTitle}>Plan the month, then keep manual capture easy.</Text>
      </View>

      <SegmentedControl
        options={[
          { label: "Alloc", value: "allocation" },
          { label: "Limit", value: "limits" },
          { label: "Plan", value: "plan" },
          { label: "Goal", value: "goals" },
          { label: "Bal", value: "balance" },
          { label: "Close", value: "close" }
        ]}
        selected={activeBudgetTab}
        onSelect={setActiveBudgetTab}
      />

      {activeBudgetTab === "allocation" && (
        <AllocationPanel
          accounts={accounts}
          balanceSnapshots={balanceSnapshots}
          monthlyPlan={monthlyPlan}
          monthlySummary={monthlySummary}
          transfers={transfers}
          onOpenBalance={() => setActiveBudgetTab("balance")}
          onOpenPlan={() => setActiveBudgetTab("plan")}
        />
      )}
      {activeBudgetTab === "limits" && (
        <BudgetLimitsPanel
          budgetLimits={budgetLimits}
          categoryLabels={categoryLabels}
          categoryModes={categoryModes}
          expenseCategories={expenseCategories}
          moments={moments}
          onDeleteLimit={onDeleteLimit}
          onOpenSettings={onOpenSettings}
          onSaveCategoryMode={onSaveCategoryMode}
          onSaveLimit={onSaveLimit}
        />
      )}
      {activeBudgetTab === "plan" && (
        <MonthlyPlanPanel
          monthlyPlan={monthlyPlan}
          monthlySummary={monthlySummary}
          onSaveMonthlyPlan={onSaveMonthlyPlan}
        />
      )}
      {activeBudgetTab === "goals" && (
        <SavingsGoalsPanel
          savingsGoals={savingsGoals}
          onDeleteGoal={onDeleteGoal}
          onSaveGoal={onSaveGoal}
        />
      )}
      {activeBudgetTab === "balance" && (
        <BalancePanel
          accounts={accounts}
          balanceSnapshots={balanceSnapshots}
          onDeleteAccount={onDeleteAccount}
          onSaveAccount={onSaveAccount}
          onSaveBalance={onSaveBalance}
        />
      )}
      {activeBudgetTab === "close" && (
        <MonthlyClosePanel
          monthlyClosings={monthlyClosings}
          monthlyPlan={monthlyPlan}
          monthlySummary={monthlySummary}
          onSaveMonthlyClose={onSaveMonthlyClose}
        />
      )}
    </ScrollView>
  );
}

function BudgetLimitsPanel({
  budgetLimits,
  categoryLabels,
  categoryModes,
  expenseCategories,
  moments,
  onDeleteLimit,
  onOpenSettings,
  onSaveCategoryMode,
  onSaveLimit
}: {
  budgetLimits: BudgetLimit[];
  categoryLabels: SpendingContext[];
  categoryModes: CategoryMode[];
  expenseCategories: ExpenseCategory[];
  moments: SpendingMoment[];
  onDeleteLimit: (category: SpendingContext) => void;
  onOpenSettings: () => void;
  onSaveCategoryMode: (category: SpendingContext, mode: CategoryModeValue) => void;
  onSaveLimit: (category: SpendingContext, amountText: string, period: BudgetPeriod) => void;
}) {
  const [editingCategory, setEditingCategory] = useState<SpendingContext | null>(null);
  const [draftAmount, setDraftAmount] = useState("");
  const [draftPeriod, setDraftPeriod] = useState<BudgetPeriod>("weekly");
  const limitByCategory = useMemo(
    () => new Map(budgetLimits.map((limit) => [limit.category, limit])),
    [budgetLimits]
  );
  const modeByCategory = useMemo(() => getModeByCategory(categoryModes), [categoryModes]);
  const rows = useMemo(
    () =>
      categoryLabels.map((category) => {
        const categoryMeta = expenseCategories.find((item) => item.label === category);
        const limit = limitByCategory.get(category);
        const period = limit?.period ?? "monthly";
        const spent = sumExpenseMoments(getMomentsInPeriod(moments, period).filter((moment) => moment.context === category));
        return {
          category,
          isDefault: categoryMeta?.isDefault ?? false,
          limit,
          mode: modeByCategory.get(category) ?? "flexible",
          period,
          spent,
          progress: limit ? spent / limit.limitAmount : 0
        };
      }),
    [categoryLabels, expenseCategories, limitByCategory, modeByCategory, moments]
  );

  function startEditing(category: SpendingContext) {
    const limit = limitByCategory.get(category);
    setEditingCategory(category);
    setDraftAmount(limit ? formatAmountInput(String(limit.limitAmount)) : "");
    setDraftPeriod(limit?.period ?? "weekly");
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        text="No expense categories are active, so budget limits have nowhere to attach."
        actionLabel="Open Settings"
        onAction={onOpenSettings}
      />
    );
  }

  return (
      <View style={styles.listPanel}>
        {rows.map((row) => (
          <Pressable
            key={row.category}
            onLongPress={() => {
              if (row.limit) {
                onDeleteLimit(row.category);
              }
            }}
            style={styles.budgetRow}
          >
            <View style={styles.budgetHeader}>
              <View style={styles.budgetTitleBlock}>
                <Text style={styles.budgetCategory}>{row.category}</Text>
                <Text style={styles.budgetMeta}>
                  {row.limit
                    ? `${formatCompactRupiah(row.spent)} of ${formatCompactRupiah(row.limit.limitAmount)} ${row.period}`
                    : `No limit set - ${formatCompactRupiah(row.spent)} this month`}
                </Text>
              </View>
              <Pressable onPress={() => startEditing(row.category)} style={styles.textButton}>
                <Ionicons name={row.limit ? "create-outline" : "add-circle-outline"} size={16} color={colors.greenDark} />
                <Text style={styles.textButtonLabel}>{row.limit ? "Edit" : "Set"}</Text>
              </Pressable>
            </View>

            <SegmentedControl
              compact
              options={[
                { label: "Fixed", value: "fixed" },
                { label: "Flexible", value: "flexible" }
              ]}
              selected={row.mode}
              onSelect={(mode) => onSaveCategoryMode(row.category, mode)}
            />

            {row.limit && (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, getProgressFillStyle(row.progress)]} />
              </View>
            )}

            {editingCategory === row.category && (
              <View style={styles.inlineEditor}>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={(value) => setDraftAmount(formatAmountInput(value))}
                  placeholder="Limit amount"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={draftAmount}
                />
                <SegmentedControl
                  compact
                  options={[
                    { label: "Weekly", value: "weekly" },
                    { label: "Monthly", value: "monthly" }
                  ]}
                  selected={draftPeriod}
                  onSelect={setDraftPeriod}
                />
                <View style={styles.editActions}>
                  {row.limit && (
                    <Pressable
                      onPress={() => {
                        onDeleteLimit(row.category);
                        setEditingCategory(null);
                      }}
                      style={styles.secondaryButton}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => setEditingCategory(null)} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      onSaveLimit(row.category, draftAmount, draftPeriod);
                      setEditingCategory(null);
                    }}
                    style={styles.smallPrimaryButton}
                  >
                    <Text style={styles.primaryButtonText}>Save</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </Pressable>
        ))}
      </View>
  );
}

function AllocationPanel({
  accounts,
  balanceSnapshots,
  monthlyPlan,
  monthlySummary,
  transfers,
  onOpenBalance,
  onOpenPlan
}: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  monthlyPlan: MonthlyPlan | null;
  monthlySummary: MonthlySummary;
  transfers: MoneyTransfer[];
  onOpenBalance: () => void;
  onOpenPlan: () => void;
}) {
  const latestSnapshots = useMemo(() => getLatestBalanceSnapshots(balanceSnapshots), [balanceSnapshots]);
  const allocation = useMemo(
    () =>
      buildAllocationPlan({
        accounts,
        latestSnapshots,
        monthlyPlan,
        monthlySummary
      }),
    [accounts, latestSnapshots, monthlyPlan, monthlySummary]
  );
  const pocketFundingThisMonth = useMemo(
    () => getPocketFundingThisMonth(accounts, transfers),
    [accounts, transfers]
  );
  const actionCopy = getAllocationActionCopy(allocation);

  return (
    <View style={styles.analyticsBlock}>
      <ObservationPanel
        pattern={{
          id: "allocation-next-action",
          group: "Repeated lately",
          title: actionCopy.title,
          detail: actionCopy.detail,
          tone: actionCopy.tone
        }}
      />

      {!monthlyPlan ? (
        <EmptyState
          text="Set expected income, fixed costs, flexible budget, and savings target to make allocation useful."
          actionLabel="Open Plan"
          onAction={onOpenPlan}
        />
      ) : (
        <>
          <View style={styles.allocationGrid}>
            <View style={styles.allocationMetric}>
              <Text style={styles.microLabel}>Income</Text>
              <Text style={styles.allocationValue}>{formatCompactRupiah(allocation.incomeReceived)}</Text>
              <Text style={styles.settingCopy}>of {formatCompactRupiah(allocation.expectedIncome)}</Text>
            </View>
            <View style={styles.allocationMetric}>
              <Text style={styles.microLabel}>Daily room</Text>
              <Text style={styles.allocationValue}>{formatCompactRupiah(allocation.dailyFlexibleRoom)}</Text>
              <Text style={styles.settingCopy}>flexible until month end</Text>
            </View>
            <View style={styles.allocationMetric}>
              <Text style={styles.microLabel}>Pocket cash</Text>
              <Text style={styles.allocationValue}>{formatCompactRupiah(allocation.pocketBalance)}</Text>
              <Text style={styles.settingCopy}>{allocation.pocketCoverageDays} day coverage</Text>
            </View>
            <View style={styles.allocationMetric}>
              <Text style={styles.microLabel}>Savings pace</Text>
              <Text style={[styles.allocationValue, allocation.savingsGap > 0 && styles.expenseText]}>
                {formatSignedCompactRupiah(allocation.possibleSavings - (monthlyPlan.savingsTarget ?? 0))}
              </Text>
              <Text style={styles.settingCopy}>against target</Text>
            </View>
          </View>

          <View style={styles.listPanel}>
            <SectionHeader title="Monthly allocation" />
            {allocation.rows.map((row) => {
              const rowCopy = getAllocationRowCopy(row);
              return (
                <View key={row.key} style={styles.analyticsRow}>
                  <View style={styles.analyticsRowHeader}>
                    <Text style={styles.analyticsTitle}>{rowCopy.title}</Text>
                    <Text style={styles.analyticsAmount}>
                      {formatCompactRupiah(row.actual)} / {formatCompactRupiah(row.planned)}
                    </Text>
                  </View>
                  {row.planned > 0 && (
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, getAllocationFillStyle(row)]} />
                    </View>
                  )}
                  <Text style={styles.settingCopy}>{rowCopy.detail}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.settingsPanel}>
            <View style={styles.settingRow}>
              <Ionicons name="swap-horizontal-outline" size={20} color={colors.greenDark} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Hub to pocket funding</Text>
                <Text style={styles.settingCopy}>
                  {pocketFundingThisMonth > 0
                    ? `${formatCompactRupiah(pocketFundingThisMonth)} moved from income hub to spending pockets this month.`
                    : "No hub-to-pocket transfer is logged this month yet."}
                </Text>
              </View>
            </View>
            <View style={styles.settingRow}>
              <Ionicons name="wallet-outline" size={20} color={colors.greenDark} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Pocket top-up check</Text>
                <Text style={styles.settingCopy}>
                  {latestSnapshots.length === 0
                    ? "Add balance snapshots to compare pocket cash against the remaining flexible budget."
                    : allocation.pocketTopUpNeed > 0
                      ? `${formatCompactRupiah(allocation.pocketTopUpNeed)} more would fully fund remaining flexible spending.`
                      : "Current pocket balance already covers remaining flexible spending."}
                </Text>
              </View>
            </View>
          </View>

          {latestSnapshots.length === 0 && (
            <EmptyState
              text="Allocation gets sharper after a quick snapshot for BRI, Jago, wallets, and cash."
              actionLabel="Open Balance"
              onAction={onOpenBalance}
            />
          )}
        </>
      )}
    </View>
  );
}

function MonthlyPlanPanel({
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
      <View style={styles.settingsPanel}>
        <View style={styles.settingRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>This month so far</Text>
            <Text style={styles.settingCopy}>
              Income {formatCompactRupiah(monthlySummary.income)} - spending {formatCompactRupiah(monthlySummary.expense)} - net {formatSignedCompactRupiah(monthlySummary.net)}
            </Text>
          </View>
        </View>
      </View>

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

function SavingsGoalsPanel({
  savingsGoals,
  onDeleteGoal,
  onSaveGoal
}: {
  savingsGoals: SavingsGoal[];
  onDeleteGoal: (id: string) => void;
  onSaveGoal: (input: {
    id?: string;
    label: string;
    savedAmount: string;
    targetAmount: string;
  }) => void;
}) {
  const [editingGoalId, setEditingGoalId] = useState<string | undefined>(undefined);
  const [goalLabel, setGoalLabel] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");

  function editGoal(goal: SavingsGoal) {
    setEditingGoalId(goal.id);
    setGoalLabel(goal.label);
    setTargetAmount(formatAmountInput(String(goal.targetAmount)));
    setSavedAmount(formatAmountInput(String(goal.savedAmount)));
  }

  function resetDraft() {
    setEditingGoalId(undefined);
    setGoalLabel("");
    setTargetAmount("");
    setSavedAmount("");
  }

  return (
    <View style={styles.analyticsBlock}>
      <View style={styles.capturePanel}>
        <Text style={styles.microLabel}>{editingGoalId ? "Edit savings goal" : "New savings goal"}</Text>
        <TextInput onChangeText={setGoalLabel} placeholder="Goal name" placeholderTextColor={colors.muted} style={styles.input} value={goalLabel} />
        <TextInput keyboardType="number-pad" onChangeText={(value) => setTargetAmount(formatAmountInput(value))} placeholder="Target amount" placeholderTextColor={colors.muted} style={styles.input} value={targetAmount} />
        <TextInput keyboardType="number-pad" onChangeText={(value) => setSavedAmount(formatAmountInput(value))} placeholder="Saved so far" placeholderTextColor={colors.muted} style={styles.input} value={savedAmount} />
        <View style={styles.editActions}>
          {editingGoalId && (
            <Pressable onPress={resetDraft} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              onSaveGoal({ id: editingGoalId, label: goalLabel, savedAmount, targetAmount });
              resetDraft();
            }}
            style={styles.smallPrimaryButton}
          >
            <Text style={styles.primaryButtonText}>Save</Text>
          </Pressable>
        </View>
      </View>

      {savingsGoals.length === 0 ? (
        <EmptyState text="Savings goals can stay simple: target, current amount, and a small note." />
      ) : (
        <View style={styles.cardGrid}>
          {savingsGoals.map((goal) => {
            const progress = goal.targetAmount > 0 ? goal.savedAmount / goal.targetAmount : 0;
            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.analyticsRowHeader}>
                  <Text style={styles.analyticsTitle}>{goal.label}</Text>
                  <Text style={styles.analyticsAmount}>{formatRupiah(goal.savedAmount)} / {formatRupiah(goal.targetAmount)}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.trendFill, getPercentWidthStyle(progress)]} />
                </View>
                <View style={styles.editActions}>
                  <Pressable onPress={() => editGoal(goal)} style={styles.textButton}>
                    <Ionicons name="create-outline" size={16} color={colors.greenDark} />
                    <Text style={styles.textButtonLabel}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => onDeleteGoal(goal.id)} style={styles.textButton}>
                    <Ionicons name="trash-outline" size={16} color={colors.coral} />
                    <Text style={[styles.textButtonLabel, styles.deleteText]}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function BalancePanel({
  accounts,
  balanceSnapshots,
  onDeleteAccount,
  onSaveAccount,
  onSaveBalance
}: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  onDeleteAccount: (id: string) => void;
  onSaveAccount: (input: {
    id?: string;
    isIncomeHub: boolean;
    kind: MoneyAccount["kind"];
    label: string;
  }) => void;
  onSaveBalance: (input: { accountLabel: string; amount: string }) => void;
}) {
  const [accountLabel, setAccountLabel] = useState(accounts[0]?.label ?? "");
  const [amount, setAmount] = useState("");
  const [editingAccountId, setEditingAccountId] = useState<string | undefined>(undefined);
  const [accountDraftLabel, setAccountDraftLabel] = useState("");
  const [accountDraftKind, setAccountDraftKind] = useState<MoneyAccount["kind"]>("bank");
  const [accountDraftHub, setAccountDraftHub] = useState<"hub" | "pocket">("pocket");
  const latestBalanceTotal = useMemo(() => getLatestBalanceTotal(balanceSnapshots), [balanceSnapshots]);
  const latestSnapshots = useMemo(() => getLatestBalanceSnapshots(balanceSnapshots), [balanceSnapshots]);

  useEffect(() => {
    if (!accountLabel && accounts[0]) {
      setAccountLabel(accounts[0].label);
    }
  }, [accountLabel, accounts]);

  function editAccount(account: MoneyAccount) {
    setEditingAccountId(account.id);
    setAccountDraftLabel(account.label);
    setAccountDraftKind(account.kind);
    setAccountDraftHub(account.isIncomeHub ? "hub" : "pocket");
  }

  function resetAccountDraft() {
    setEditingAccountId(undefined);
    setAccountDraftLabel("");
    setAccountDraftKind("bank");
    setAccountDraftHub("pocket");
  }

  return (
    <View style={styles.analyticsBlock}>
      <View style={styles.settingsPanel}>
        <View style={styles.settingRow}>
          <Ionicons name="albums-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Latest manual balance</Text>
            <Text style={styles.settingCopy}>{formatCompactRupiah(latestBalanceTotal)} across latest account snapshots.</Text>
          </View>
        </View>
      </View>

      <View style={styles.capturePanel}>
        <Text style={styles.microLabel}>Balance snapshot</Text>
        <AccountPicker
          accounts={accounts}
          label="Account"
          selected={accountLabel}
          onSelect={setAccountLabel}
        />
        <TextInput keyboardType="number-pad" onChangeText={(value) => setAmount(formatAmountInput(value))} placeholder="Current balance" placeholderTextColor={colors.muted} style={styles.input} value={amount} />
        <Pressable
          onPress={() => {
            onSaveBalance({ accountLabel, amount });
            setAmount("");
          }}
          style={styles.primaryButton}
        >
          <Ionicons name="camera-outline" size={18} color={colors.surface} />
          <Text style={styles.primaryButtonText}>Save snapshot</Text>
        </Pressable>
      </View>

      <View style={styles.capturePanel}>
        <Text style={styles.microLabel}>{editingAccountId ? "Edit account" : "Add account or wallet"}</Text>
        <TextInput onChangeText={setAccountDraftLabel} placeholder="BRI, Jago, GoPay, Cash..." placeholderTextColor={colors.muted} style={styles.input} value={accountDraftLabel} />
        <SegmentedControl
          compact
          options={[
            { label: "Bank", value: "bank" },
            { label: "Wallet", value: "wallet" },
            { label: "Cash", value: "cash" },
            { label: "Other", value: "other" }
          ]}
          selected={accountDraftKind}
          onSelect={setAccountDraftKind}
        />
        <SegmentedControl
          compact
          options={[
            { label: "Income hub", value: "hub" },
            { label: "Pocket", value: "pocket" }
          ]}
          selected={accountDraftHub}
          onSelect={setAccountDraftHub}
        />
        <View style={styles.editActions}>
          {editingAccountId && (
            <Pressable onPress={resetAccountDraft} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              onSaveAccount({
                id: editingAccountId,
                isIncomeHub: accountDraftHub === "hub",
                kind: accountDraftKind,
                label: accountDraftLabel
              });
              resetAccountDraft();
            }}
            style={styles.smallPrimaryButton}
          >
            <Text style={styles.primaryButtonText}>Save account</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.listPanel}>
        {accounts.map((account) => (
          <View key={account.id} style={styles.analyticsRow}>
            <View style={styles.analyticsRowHeader}>
              <AccountTitle kind={account.kind} label={account.label} />
              <Text style={styles.analyticsAmount}>{account.isIncomeHub ? "Income hub" : account.kind}</Text>
            </View>
            <View style={styles.editActions}>
              <Pressable onPress={() => editAccount(account)} style={styles.textButton}>
                <Ionicons name="create-outline" size={16} color={colors.greenDark} />
                <Text style={styles.textButtonLabel}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => onDeleteAccount(account.id)} style={styles.textButton}>
                <Ionicons name="trash-outline" size={16} color={colors.coral} />
                <Text style={[styles.textButtonLabel, styles.deleteText]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {latestSnapshots.length === 0 ? (
        <EmptyState text="A weekly manual balance check is enough for a clear picture." />
      ) : (
        <View style={styles.listPanel}>
          {latestSnapshots.map((snapshot) => (
            <View key={snapshot.id} style={styles.analyticsRow}>
              <View style={styles.analyticsRowHeader}>
                <AccountTitle label={snapshot.accountLabel} />
                <Text style={styles.analyticsAmount}>{formatRupiah(snapshot.amount)}</Text>
              </View>
              <Text style={styles.settingCopy}>
                {formatDate(dateKey(new Date(snapshot.snapshotDate)))}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function MonthlyClosePanel({
  monthlyClosings,
  monthlyPlan,
  monthlySummary,
  onSaveMonthlyClose
}: {
  monthlyClosings: MonthlyClosing[];
  monthlyPlan: MonthlyPlan | null;
  monthlySummary: MonthlySummary;
  onSaveMonthlyClose: (input: {
    nextMonthAdjustment: string;
    totalExpenses: number;
    totalIncome: number;
  }) => void;
}) {
  const [nextMonthAdjustment, setNextMonthAdjustment] = useState("");
  const currentMonthKey = getMonthKey(new Date());
  const closing = monthlyClosings.find((item) => item.month === currentMonthKey);
  const savingsTarget = monthlyPlan?.savingsTarget ?? 0;
  const estimatedSavings = Math.max(0, monthlySummary.net);
  const savingsGap = estimatedSavings - savingsTarget;

  return (
    <View style={styles.analyticsBlock}>
      <View style={styles.settingsPanel}>
        <View style={styles.settingRow}>
          <Ionicons name="checkmark-done-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{closing ? "This month is closed" : "Monthly closing ritual"}</Text>
            <Text style={styles.settingCopy}>
              Income {formatCompactRupiah(monthlySummary.income)} - spending {formatCompactRupiah(monthlySummary.expense)} - possible savings {formatCompactRupiah(estimatedSavings)}.
            </Text>
          </View>
        </View>
        <View style={styles.settingRow}>
          <Ionicons name="flag-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Savings target check</Text>
            <Text style={styles.settingCopy}>
              {savingsTarget > 0
                ? `Against target: ${formatSignedCompactRupiah(savingsGap)}.`
                : "Set a monthly savings target in Plan when it helps."}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.capturePanel}>
        <Text style={styles.microLabel}>Next month adjustment</Text>
        <TextInput multiline onChangeText={setNextMonthAdjustment} placeholder="One thing to keep, reduce, or plan differently" placeholderTextColor={colors.muted} style={[styles.input, styles.noteInput]} value={nextMonthAdjustment} />
        <Pressable
          onPress={() => {
            onSaveMonthlyClose({
              nextMonthAdjustment,
              totalExpenses: monthlySummary.expense,
              totalIncome: monthlySummary.income
            });
            setNextMonthAdjustment("");
          }}
          style={styles.primaryButton}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color={colors.surface} />
          <Text style={styles.primaryButtonText}>{closing ? "Update close" : "Complete close"}</Text>
        </Pressable>
      </View>

      {closing?.nextMonthAdjustment && (
        <ObservationPanel
          pattern={{
            id: "closing-note",
            group: "Repeated lately",
            title: "Saved adjustment",
            detail: closing.nextMonthAdjustment,
            tone: "calm"
          }}
        />
      )}

      {monthlyClosings.length > 0 && (
        <View style={styles.listPanel}>
          {monthlyClosings.map((item) => (
            <View key={item.id} style={styles.analyticsRow}>
              <View style={styles.analyticsRowHeader}>
                <Text style={styles.analyticsTitle}>{item.month}</Text>
                <Text style={[styles.analyticsAmount, item.netCashflow >= 0 ? styles.incomeText : styles.expenseText]}>
                  {formatSignedCompactRupiah(item.netCashflow)}
                </Text>
              </View>
              <Text style={styles.settingCopy}>
                Income {formatRupiah(item.totalIncome)} - expenses {formatRupiah(item.totalExpenses)}
              </Text>
              {item.nextMonthAdjustment && <Text style={styles.settingCopy}>{item.nextMonthAdjustment}</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function PatternsScreen({
  accounts,
  balanceSnapshots,
  categoryModes,
  feedbackByPattern,
  monthlyPlan,
  moments,
  patterns,
  transfers,
  onDeleteTransfer,
  onAnswer
}: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  categoryModes: CategoryMode[];
  feedbackByPattern: Map<string, PatternFeedbackResponse>;
  monthlyPlan: MonthlyPlan | null;
  moments: SpendingMoment[];
  patterns: SpendingPattern[];
  transfers: MoneyTransfer[];
  onDeleteTransfer: (id: string) => void;
  onAnswer: (patternId: string, response: PatternFeedbackResponse) => void;
}) {
  const [activePatternTab, setActivePatternTab] = useState<PatternTabKey>("overview");

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.heroPanel}>
        <Text style={styles.kickerDark}>Analysis</Text>
        <Text style={styles.heroTitle}>Cashflow, pockets, and spending rhythm without bank access.</Text>
      </View>

      <SegmentedControl
        options={[
          { label: "Recap", value: "overview" },
          { label: "Split", value: "breakdown" },
          { label: "Flow", value: "cashflow" },
          { label: "Pocket", value: "accounts" },
          { label: "Trend", value: "trends" }
        ]}
        selected={activePatternTab}
        onSelect={setActivePatternTab}
      />

      {activePatternTab === "overview" && (
        <PatternOverview
          feedbackByPattern={feedbackByPattern}
          moments={moments}
          patterns={patterns}
          onAnswer={onAnswer}
        />
      )}
      {activePatternTab === "breakdown" && <BreakdownPanel moments={moments} />}
      {activePatternTab === "cashflow" && <CashflowPanel moments={moments} />}
      {activePatternTab === "accounts" && (
        <AccountAnalysisPanel
          accounts={accounts}
          balanceSnapshots={balanceSnapshots}
          categoryModes={categoryModes}
          moments={moments}
          monthlyPlan={monthlyPlan}
          transfers={transfers}
          onDeleteTransfer={onDeleteTransfer}
        />
      )}
      {activePatternTab === "trends" && <TrendsPanel moments={moments} />}
    </ScrollView>
  );
}

function PatternOverview({
  feedbackByPattern,
  moments,
  patterns,
  onAnswer
}: {
  feedbackByPattern: Map<string, PatternFeedbackResponse>;
  moments: SpendingMoment[];
  patterns: SpendingPattern[];
  onAnswer: (patternId: string, response: PatternFeedbackResponse) => void;
}) {
  const enoughForRecap = moments.filter((moment) => moment.type === "expense" && Date.parse(moment.occurredAt) >= Date.now() - 14 * 24 * 60 * 60 * 1000).length >= 6;
  const groups = useMemo(() => groupPatterns(patterns), [patterns]);

  return (
    <>
      {patterns.length === 0 ? (
        <EmptyState text="Patterns appear after a few saved moments." />
      ) : (
        groups.map((group) => (
          <View key={group.title} style={styles.patternGroup}>
            <SectionHeader title={group.title} />
            {group.items.map((pattern) => (
              <View key={pattern.id} style={[styles.patternCard, patternStyle(pattern.tone)]}>
                <View style={styles.patternTitleRow}>
                  <Ionicons name={patternIcon(pattern.tone)} size={18} color={patternColor(pattern.tone)} />
                  <Text style={styles.patternTitle}>{pattern.title}</Text>
                </View>
                <Text style={styles.patternDetail}>{pattern.detail}</Text>

                {enoughForRecap && pattern.recapQuestion && (
                  <View style={styles.recapBlock}>
                    <Text style={styles.recapQuestion}>{pattern.recapQuestion}</Text>
                    <View style={styles.feedbackRow}>
                      <FeedbackButton
                        active={feedbackByPattern.get(pattern.id) === "keep"}
                        label="Keep"
                        onPress={() => onAnswer(pattern.id, "keep")}
                      />
                      <FeedbackButton
                        active={feedbackByPattern.get(pattern.id) === "less_often"}
                        label="Less often"
                        onPress={() => onAnswer(pattern.id, "less_often")}
                      />
                      <FeedbackButton
                        active={feedbackByPattern.get(pattern.id) === "not_sure"}
                        label="Not sure"
                        onPress={() => onAnswer(pattern.id, "not_sure")}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))
      )}
    </>
  );
}

function BreakdownPanel({ moments }: { moments: SpendingMoment[] }) {
  const [breakdownType, setBreakdownType] = useState<EntryType>("expense");
  const rows = useMemo(() => buildMonthlyBreakdown(moments, breakdownType), [breakdownType, moments]);

  return (
    <View style={styles.analyticsBlock}>
      <SegmentedControl
        compact
        options={[
          { label: "Expense", value: "expense" },
          { label: "Income", value: "income" }
        ]}
        selected={breakdownType}
        onSelect={setBreakdownType}
      />
      {rows.length === 0 ? (
        <EmptyState text={breakdownType === "income" ? "Income breakdown appears after an income entry." : "Expense breakdown appears after a saved expense."} />
      ) : (
        <View style={styles.listPanel}>
          {rows.map((row) => (
            <View key={row.key} style={styles.analyticsRow}>
              <View style={styles.analyticsRowHeader}>
                <Text style={styles.analyticsTitle}>{row.label}</Text>
                <Text style={styles.analyticsAmount}>{formatCompactRupiah(row.amount)} - {Math.round(row.share * 100)}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.breakdownFill, getPercentWidthStyle(row.share)]} />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function CashflowPanel({ moments }: { moments: SpendingMoment[] }) {
  const weeks = useMemo(() => buildCashflowWeeks(moments), [moments]);
  const maxWeeklyAmount = useMemo(
    () => Math.max(1, ...weeks.flatMap((week) => [week.income, week.expense])),
    [weeks]
  );

  if (weeks.every((week) => week.income === 0 && week.expense === 0)) {
    return <EmptyState text="Cashflow appears after income or spending entries." />;
  }

  return (
    <View style={styles.listPanel}>
      {weeks.map((week, index) => (
        <View key={week.key} style={[styles.cashflowRow, index === weeks.length - 1 && styles.cashflowRowRecent]}>
          <View style={styles.analyticsRowHeader}>
            <Text style={styles.analyticsTitle}>{week.label}</Text>
            <Text style={[styles.analyticsAmount, week.net >= 0 ? styles.incomeText : styles.expenseText]}>
              Net {formatSignedCompactRupiah(week.net)}
            </Text>
          </View>
          <View style={styles.cashflowBars}>
            <View style={styles.cashflowBarLine}>
              <Text style={styles.cashflowLabel}>Income</Text>
              <View style={styles.cashflowTrack}>
                <View style={[styles.incomeFill, getPercentWidthStyle(week.income / maxWeeklyAmount)]} />
              </View>
              <Text style={styles.cashflowAmount}>{formatCompactRupiah(week.income)}</Text>
            </View>
            <View style={styles.cashflowBarLine}>
              <Text style={styles.cashflowLabel}>Expense</Text>
              <View style={styles.cashflowTrack}>
                <View style={[styles.expenseFill, getPercentWidthStyle(week.expense / maxWeeklyAmount)]} />
              </View>
              <Text style={styles.cashflowAmount}>{formatCompactRupiah(week.expense)}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function AccountAnalysisPanel({
  accounts,
  balanceSnapshots,
  categoryModes,
  moments,
  monthlyPlan,
  transfers,
  onDeleteTransfer
}: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  categoryModes: CategoryMode[];
  moments: SpendingMoment[];
  monthlyPlan: MonthlyPlan | null;
  transfers: MoneyTransfer[];
  onDeleteTransfer: (id: string) => void;
}) {
  const monthlySummary = useMemo(
    () => buildCurrentMonthSummary(moments, categoryModes),
    [categoryModes, moments]
  );
  const latestSnapshots = useMemo(() => getLatestBalanceSnapshots(balanceSnapshots), [balanceSnapshots]);
  const distribution = useMemo(
    () => buildAccountDistribution(accounts, latestSnapshots),
    [accounts, latestSnapshots]
  );
  const transferFlows = useMemo(() => buildTransferFlows(transfers), [transfers]);
  const accountActivity = useMemo(() => buildAccountActivity(moments), [moments]);
  const reconciliationRows = useMemo(
    () => buildAccountReconciliation({ accounts, balanceSnapshots, moments, transfers }),
    [accounts, balanceSnapshots, moments, transfers]
  );
  const recentTransfers = useMemo(() => transfers.slice(0, 6), [transfers]);
  const monthMath = useMemo(() => buildMonthMath(monthlySummary, monthlyPlan), [monthlyPlan, monthlySummary]);
  const reconciliationCopy = getReconciliationCopy(reconciliationRows);
  const incomeHub = accounts.find((account) => account.isIncomeHub);
  const hubBalance = incomeHub
    ? latestSnapshots.find((snapshot) => snapshot.accountLabel === incomeHub.label)?.amount ?? 0
    : 0;
  const pocketBalance = latestSnapshots
    .filter((snapshot) => snapshot.accountLabel !== incomeHub?.label)
    .reduce((sum, snapshot) => sum + snapshot.amount, 0);
  const topSpendingAccount = accountActivity.find((row) => row.expense > 0);

  return (
    <View style={styles.analyticsBlock}>
      <View style={styles.settingsPanel}>
        <View style={styles.settingRow}>
          <Ionicons name="speedometer-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Flexible daily room</Text>
            <Text style={styles.settingCopy}>
              {monthlyPlan
                ? `${formatCompactRupiah(monthMath.safeDailyFlexible)} per day until month end.`
                : "Set a monthly plan to see daily flexible room."}
            </Text>
          </View>
        </View>
        <View style={styles.settingRow}>
          <Ionicons name="trending-up-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Projected month expense</Text>
            <Text style={styles.settingCopy}>
              {formatCompactRupiah(monthMath.projectedExpense)} from the current spending pace.
            </Text>
          </View>
        </View>
        <View style={styles.settingRow}>
          <Ionicons name="swap-horizontal-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Hub and pockets</Text>
            <Text style={styles.settingCopy}>
              Hub {formatCompactRupiah(hubBalance)} - daily pockets {formatCompactRupiah(pocketBalance)}.
            </Text>
          </View>
        </View>
        <View style={styles.settingRow}>
          <Ionicons name="card-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Most active spending pocket</Text>
            <Text style={styles.settingCopy}>
              {topSpendingAccount
                ? `${topSpendingAccount.label} has ${formatCompactRupiah(topSpendingAccount.expense)} spending logged this month.`
                : "Spending by account appears after entries include an account."}
            </Text>
          </View>
        </View>
        <View style={styles.settingRow}>
          <Ionicons name="leaf-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Savings rate</Text>
            <Text style={styles.settingCopy}>
              {monthlySummary.income > 0
                ? `${Math.round(monthMath.savingsRate * 100)}% of income remains visible this month.`
                : "Savings rate appears after income is logged."}
            </Text>
          </View>
        </View>
      </View>

      <ObservationPanel
        pattern={{
          id: "reconciliation-summary",
          group: "Stands out this week",
          title: reconciliationCopy.title,
          detail: reconciliationCopy.detail,
          tone: reconciliationCopy.tone
        }}
      />

      {latestSnapshots.length === 0 ? (
        <EmptyState text="Reconciliation starts after the first balance snapshot. Two snapshots per account make the check meaningful." />
      ) : (
        <View style={styles.listPanel}>
          <SectionHeader title="Balance reconciliation" />
          {reconciliationRows.map((row) => (
            <View key={row.label} style={styles.analyticsRow}>
              <View style={styles.analyticsRowHeader}>
                <AccountTitle label={row.label} />
                <Text style={[styles.analyticsAmount, getReconciliationAmountStyle(row)]}>
                  {formatReconciliationDifference(row)}
                </Text>
              </View>
              <Text style={styles.settingCopy}>{getReconciliationDetail(row)}</Text>
              {row.expectedAmount !== null && row.latestAmount !== null && (
                <Text style={styles.settingCopy}>
                  Expected {formatCompactRupiah(row.expectedAmount)} - actual {formatCompactRupiah(row.latestAmount)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {distribution.length === 0 ? (
        <EmptyState text="Account distribution appears after balance snapshots." />
      ) : (
        <View style={styles.listPanel}>
          {distribution.map((row) => (
            <View key={row.label} style={styles.analyticsRow}>
              <View style={styles.analyticsRowHeader}>
                <AccountTitle label={row.label} />
                <Text style={styles.analyticsAmount}>{formatCompactRupiah(row.amount)} - {Math.round(row.share * 100)}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.incomeFill, getPercentWidthStyle(row.share)]} />
              </View>
            </View>
          ))}
        </View>
      )}

      {accountActivity.length > 0 && (
        <View style={styles.listPanel}>
          <SectionHeader title="Spending by account this month" />
          {accountActivity.map((row) => (
            <View key={row.label} style={styles.analyticsRow}>
              <View style={styles.analyticsRowHeader}>
                <AccountTitle label={row.label} />
                <Text style={styles.analyticsAmount}>{formatCompactRupiah(row.expense)}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.expenseFill, getPercentWidthStyle(row.share)]} />
              </View>
              <Text style={styles.settingCopy}>
                Income {formatCompactRupiah(row.income)} - net {formatSignedCompactRupiah(row.net)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {transferFlows.length > 0 && (
        <View style={styles.listPanel}>
          <SectionHeader title="Transfer flow this month" />
          {transferFlows.map((flow) => (
            <View key={flow.key} style={styles.analyticsRow}>
              <View style={styles.analyticsRowHeader}>
                <TransferTitle fromLabel={flow.fromAccount} toLabel={flow.toAccount} />
                <Text style={styles.analyticsAmount}>{formatCompactRupiah(flow.amount)}</Text>
              </View>
              <Text style={styles.settingCopy}>{flow.count} transfer{flow.count === 1 ? "" : "s"} recorded manually.</Text>
            </View>
          ))}
        </View>
      )}

      {recentTransfers.length > 0 && (
        <View style={styles.listPanel}>
          <SectionHeader title="Recent transfers" />
          {recentTransfers.map((transfer) => (
            <View key={transfer.id} style={styles.analyticsRow}>
              <View style={styles.analyticsRowHeader}>
                <TransferTitle fromLabel={transfer.fromAccount} toLabel={transfer.toAccount} />
                <Text style={styles.analyticsAmount}>{formatCompactRupiah(transfer.amount)}</Text>
              </View>
              <Text style={styles.settingCopy}>
                {formatDate(dateKey(new Date(transfer.occurredAt)))}{transfer.note ? ` - ${transfer.note}` : ""}
              </Text>
              <View style={styles.editActions}>
                <Pressable onPress={() => onDeleteTransfer(transfer.id)} style={styles.textButton}>
                  <Ionicons name="trash-outline" size={16} color={colors.coral} />
                  <Text style={[styles.textButtonLabel, styles.deleteText]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function TrendsPanel({ moments }: { moments: SpendingMoment[] }) {
  const trend = useMemo(() => buildSpendingTrend(moments), [moments]);

  if (trend.months.every((month) => month.amount === 0)) {
    return <EmptyState text="Trends appear after spending builds across months." />;
  }

  return (
    <View style={styles.analyticsBlock}>
      <View style={styles.listPanel}>
        {trend.months.map((month) => (
          <View key={month.key} style={styles.analyticsRow}>
            <View style={styles.analyticsRowHeader}>
              <Text style={styles.analyticsTitle}>{month.label}</Text>
              <Text style={styles.analyticsAmount}>{formatCompactRupiah(month.amount)}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.trendFill, getPercentWidthStyle(month.share)]} />
            </View>
          </View>
        ))}
      </View>

      {trend.midpointMessage && (
        <ObservationPanel
          pattern={{
            id: "midpoint-trend",
            group: "Stands out this week",
            title: "Current month pace is visible",
            detail: trend.midpointMessage,
            tone: "warm"
          }}
        />
      )}

      <View style={styles.settingsPanel}>
        <View style={styles.settingRow}>
          <Ionicons name="podium-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Top categories this month</Text>
            <Text style={styles.settingCopy}>
              {trend.topCategories.length > 0
                ? trend.topCategories.map((category) => `${category.label} ${formatCompactRupiah(category.amount)}`).join(" - ")
                : "No category has stood out yet this month."}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function SettingsScreen({
  expenseCategories,
  momentCount,
  onDeleteCategory,
  onClear,
  onSaveCategory
}: {
  expenseCategories: ExpenseCategory[];
  momentCount: number;
  onDeleteCategory: (category: ExpenseCategory) => void;
  onClear: () => void;
  onSaveCategory: (input: { id?: string; label: string }) => void;
}) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>(undefined);
  const [categoryDraft, setCategoryDraft] = useState("");

  function editCategory(category: ExpenseCategory) {
    setEditingCategoryId(category.id);
    setCategoryDraft(category.label);
  }

  function resetCategoryDraft() {
    setEditingCategoryId(undefined);
    setCategoryDraft("");
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.heroPanel}>
        <Text style={styles.kickerDark}>Settings</Text>
        <Text style={styles.heroTitle}>Categories and local data.</Text>
        <Text style={styles.settingCopy}>{momentCount} money memor{momentCount === 1 ? "y" : "ies"} saved on this device.</Text>
      </View>

      <View style={styles.capturePanel}>
        <Text style={styles.microLabel}>{editingCategoryId ? "Edit category" : "Add expense category"}</Text>
        <TextInput
          onChangeText={setCategoryDraft}
          placeholder="e.g. Health, Subscriptions, Hobby"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={categoryDraft}
        />
        <View style={styles.editActions}>
          {editingCategoryId && (
            <Pressable onPress={resetCategoryDraft} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              onSaveCategory({ id: editingCategoryId, label: categoryDraft });
              resetCategoryDraft();
            }}
            style={styles.smallPrimaryButton}
          >
            <Text style={styles.primaryButtonText}>Save category</Text>
          </Pressable>
        </View>
      </View>

      {expenseCategories.length === 0 ? (
        <EmptyState text="No active categories. Add a category above to start assigning expenses again." />
      ) : (
      <View style={styles.listPanel}>
        {expenseCategories.map((category) => (
          <View key={category.id} style={styles.analyticsRow}>
            <View style={styles.analyticsRowHeader}>
              <Text style={styles.analyticsTitle}>{category.label}</Text>
              <Text style={styles.analyticsAmount}>{category.isDefault ? "Default" : "Custom"}</Text>
            </View>
            <View style={styles.editActions}>
              {!category.isDefault && (
                <Pressable onPress={() => editCategory(category)} style={styles.textButton}>
                  <Ionicons name="create-outline" size={16} color={colors.greenDark} />
                  <Text style={styles.textButtonLabel}>Edit</Text>
                </Pressable>
              )}
              <Pressable onPress={() => onDeleteCategory(category)} style={styles.textButton}>
                <Ionicons name="trash-outline" size={16} color={colors.coral} />
                <Text style={[styles.textButtonLabel, styles.deleteText]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
      )}

      <Pressable accessibilityRole="button" onPress={onClear} style={styles.dangerButton}>
        <Ionicons name="trash-outline" size={18} color={colors.coral} />
        <Text style={styles.dangerButtonText}>Clear local finance memory</Text>
      </Pressable>
    </ScrollView>
  );
}

function SegmentedControl<T extends string>({
  compact = false,
  options,
  selected,
  onSelect
}: {
  compact?: boolean;
  options: { label: string; value: T }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.segmentedControl, compact && styles.segmentedControlCompact]}
      contentContainerStyle={styles.segmentedControlContent}
    >
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            accessibilityRole="button"
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[styles.segmentButton, compact && styles.segmentButtonCompact, active && styles.segmentButtonActive]}
          >
            <Text numberOfLines={1} style={[styles.segmentButtonText, active && styles.segmentButtonTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function AccountPicker({
  accounts,
  label,
  selected,
  onSelect
}: {
  accounts: MoneyAccount[];
  label: string;
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.accountPickerBlock}>
      <Text style={styles.microLabel}>{label}</Text>
      <View style={styles.accountChipRow}>
        {accounts.map((account) => {
          const active = selected === account.label;
          return (
            <Pressable
              accessibilityRole="button"
              key={account.id}
              onPress={() => onSelect(account.label)}
              style={[styles.accountChip, active && styles.accountChipActive]}
            >
              <AccountMark kind={account.kind} label={account.label} size="small" />
              <Text style={[styles.accountChipText, active && styles.accountChipTextActive]}>{account.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ContextPicker({
  categories,
  compact = false,
  selected,
  onSelect
}: {
  categories: SpendingContext[];
  compact?: boolean;
  selected: SpendingContext;
  onSelect: (context: SpendingContext) => void;
}) {
  return (
    <View style={compact ? styles.contextWrapCompact : styles.contextWrap}>
      {categories.map((item) => (
        <Pressable
          accessibilityRole="button"
          key={item}
          onPress={() => onSelect(item)}
          style={[styles.contextChip, selected === item && styles.contextChipActive]}
        >
          <Text style={[styles.contextChipText, selected === item && styles.contextChipTextActive]}>
            {item}
          </Text>
          {!compact && selected === item && (
            <Text style={styles.contextHint}>{CONTEXT_HINTS[item] ?? "Custom spending category"}</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

function AccountTitle({
  kind,
  label
}: {
  kind?: MoneyAccount["kind"];
  label: string;
}) {
  return (
    <View style={styles.accountTitleRow}>
      <AccountMark kind={kind} label={label} />
      <Text style={styles.analyticsTitle}>{label}</Text>
    </View>
  );
}

function TransferTitle({
  fromLabel,
  toLabel
}: {
  fromLabel: string;
  toLabel: string;
}) {
  return (
    <View style={styles.transferTitleRow}>
      <AccountMark label={fromLabel} size="small" />
      <Ionicons name="arrow-forward-outline" size={14} color={colors.muted} />
      <AccountMark label={toLabel} size="small" />
      <Text style={styles.analyticsTitle}>{fromLabel} to {toLabel}</Text>
    </View>
  );
}

function AccountMark({
  kind = "other",
  label,
  size = "medium"
}: {
  kind?: MoneyAccount["kind"];
  label: string;
  size?: "small" | "medium";
}) {
  const brand = getAccountBrand(label, kind);
  const markStyle = {
    backgroundColor: brand.backgroundColor,
    borderColor: brand.borderColor
  };
  const textStyle = {
    color: brand.foregroundColor
  };

  return (
    <View style={[styles.accountMark, size === "small" && styles.accountMarkSmall, markStyle]}>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        numberOfLines={1}
        style={[styles.accountMarkText, size === "small" && styles.accountMarkTextSmall, textStyle]}
      >
        {brand.shortLabel}
      </Text>
    </View>
  );
}

function ObservationPanel({ pattern }: { pattern: SpendingPattern }) {
  return (
    <View style={[styles.observationPanel, patternStyle(pattern.tone)]}>
      <View style={styles.patternTitleRow}>
        <Ionicons name={patternIcon(pattern.tone)} size={18} color={patternColor(pattern.tone)} />
        <Text style={styles.patternTitle}>{pattern.title}</Text>
      </View>
      <Text style={styles.patternDetail}>{pattern.detail}</Text>
    </View>
  );
}

function FeedbackButton({
  active,
  label,
  onPress
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.feedbackButton, active && styles.feedbackButtonActive]}>
      <Text style={[styles.feedbackText, active && styles.feedbackTextActive]}>{label}</Text>
    </Pressable>
  );
}

function MomentRow({
  compact = false,
  moment,
  repeatHint
}: {
  compact?: boolean;
  moment: SpendingMoment;
  repeatHint?: string;
}) {
  const isIncome = moment.type === "income";

  return (
    <View style={[styles.momentRow, compact && styles.momentRowCompact]}>
      <View style={[styles.momentIcon, isIncome && styles.incomeMomentIcon]}>
        <Ionicons
          name={isIncome ? "cash-outline" : contextIcon(moment.context)}
          size={18}
          color={isIncome ? colors.blue : colors.greenDark}
        />
      </View>
      <View style={styles.momentText}>
        <Text style={styles.momentTitle}>{getMomentTitle(moment)}</Text>
        <Text style={styles.momentMeta}>
          {isIncome ? "Income" : moment.context} - {formatTime(moment.occurredAt)}
          {moment.accountLabel ? ` - ${moment.accountLabel}` : ""}
          {moment.note ? ` - ${moment.note}` : ""}
        </Text>
        {repeatHint && !isIncome && <Text style={styles.repeatHint}>{repeatHint}</Text>}
      </View>
      <Text style={[styles.momentAmount, isIncome && styles.incomeText]}>{formatMomentAmount(moment)}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function EmptyState({
  actionLabel,
  onAction,
  text
}: {
  actionLabel?: string;
  onAction?: () => void;
  text: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="leaf-outline" size={22} color={colors.greenDark} />
      <Text style={styles.emptyText}>{text}</Text>
      {actionLabel && onAction && (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.emptyActionButton}>
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

function parseAmountInput(value: string): number | null {
  const amount = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function formatAmountInput(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

type PatternTabKey = "overview" | "breakdown" | "cashflow" | "accounts" | "trends";
type BudgetTabKey = "allocation" | "limits" | "plan" | "goals" | "balance" | "close";

type MonthlySummary = FinanceMonthSummary;
type BreakdownRow = FinanceBreakdownRow;

type CashflowWeek = {
  expense: number;
  income: number;
  key: string;
  label: string;
  net: number;
};

type SpendingTrend = {
  midpointMessage?: string;
  months: {
    amount: number;
    key: string;
    label: string;
    share: number;
  }[];
  topCategories: {
    amount: number;
    label: string;
  }[];
};

type AccountDistributionRow = {
  amount: number;
  label: string;
  share: number;
};

type TransferFlowRow = {
  amount: number;
  count: number;
  fromAccount: string;
  key: string;
  toAccount: string;
};

type AccountActivityRow = {
  expense: number;
  income: number;
  label: string;
  net: number;
  share: number;
};

type MonthMath = {
  projectedExpense: number;
  safeDailyFlexible: number;
  savingsRate: number;
};

type RepeatSuggestion = {
  accountLabel?: string;
  amount: number;
  context: SpendingContext;
  label: string;
};

function getMomentTitle(moment: SpendingMoment): string {
  if (moment.type === "income") return moment.source || moment.label || "Income";
  return moment.label || moment.context;
}

function getTemplateLabel(template: ManualTemplate): string {
  if (template.type === "income") return template.source || "Income";
  return template.label || template.context;
}

function formatMomentAmount(moment: SpendingMoment): string {
  return moment.type === "income"
    ? `+${formatCompactRupiah(moment.amount)}`
    : formatCompactRupiah(moment.amount);
}

function formatSignedCompactRupiah(amount: number): string {
  if (amount > 0) return `+${formatCompactRupiah(amount)}`;
  if (amount < 0) return `-${formatCompactRupiah(Math.abs(amount))}`;
  return formatCompactRupiah(0);
}

function getAllocationActionCopy(allocation: AllocationPlan): {
  detail: string;
  title: string;
  tone: SpendingPattern["tone"];
} {
  const amount = allocation.nextAction.amount ?? 0;

  switch (allocation.nextAction.kind) {
    case "set_plan":
      return {
        detail: "Add expected income, fixed costs, flexible spending, and savings target for this month.",
        title: "Set the monthly envelope",
        tone: "calm"
      };
    case "snapshot_balances":
      return {
        detail: "Add quick snapshots for BRI, Jago, wallets, and cash so pocket funding can be checked.",
        title: "Snapshot balances first",
        tone: "calm"
      };
    case "plan_exceeds_income":
      return {
        detail: `The plan is ${formatCompactRupiah(amount)} above expected income. Lower one allocation or raise the expected income only if it is realistic.`,
        title: "Plan is above income",
        tone: "notice"
      };
    case "flexible_over_plan":
      return {
        detail: `Flexible spending is ${formatCompactRupiah(amount)} over the monthly envelope. Treat the rest of the month as a slower-spend period.`,
        title: "Flexible budget is already crossed",
        tone: "notice"
      };
    case "top_up_pockets":
      return {
        detail: `Moving up to ${formatCompactRupiah(amount)} from the income hub would fully fund the remaining flexible budget. Hub snapshot shows ${formatCompactRupiah(allocation.hubBalance)}.`,
        title: "Pocket top-up is visible",
        tone: "warm"
      };
    case "hold":
      return {
        detail: "The current pocket balance covers remaining flexible spending. Keep logging normally and update snapshots when balances change.",
        title: "Allocation is steady",
        tone: "calm"
      };
  }
}

function getAllocationRowCopy(row: AllocationPlan["rows"][number]): {
  detail: string;
  title: string;
} {
  const remainingAmount = Math.abs(row.remaining);

  if (row.key === "income") {
    if (row.planned <= 0) {
      return {
        detail: "No expected income is set for this month.",
        title: "Income received"
      };
    }
    return {
      detail: row.remaining > 0
        ? `${formatCompactRupiah(remainingAmount)} expected income is not logged yet.`
        : `Income is ${formatCompactRupiah(remainingAmount)} above plan.`,
      title: "Income received"
    };
  }

  if (row.key === "fixed") {
    if (row.planned <= 0) {
      return {
        detail: "No fixed-cost envelope is set.",
        title: "Fixed costs"
      };
    }
    return {
      detail: row.remaining >= 0
        ? `${formatCompactRupiah(remainingAmount)} fixed-cost room remains.`
        : `Fixed costs are ${formatCompactRupiah(remainingAmount)} above plan.`,
      title: "Fixed costs"
    };
  }

  if (row.key === "flexible") {
    if (row.planned <= 0) {
      return {
        detail: "No flexible spending envelope is set.",
        title: "Flexible spending"
      };
    }
    return {
      detail: row.remaining >= 0
        ? `${formatCompactRupiah(remainingAmount)} flexible spending remains.`
        : `Flexible spending is ${formatCompactRupiah(remainingAmount)} above plan.`,
      title: "Flexible spending"
    };
  }

  if (row.planned <= 0) {
    return {
      detail: "No savings target is set.",
      title: "Savings target"
    };
  }

  return {
    detail: row.remaining > 0
      ? `${formatCompactRupiah(remainingAmount)} still needed to hit the savings target.`
      : `Savings pace is ${formatCompactRupiah(remainingAmount)} above target.`,
    title: "Savings target"
  };
}

function getAllocationFillStyle(row: AllocationPlan["rows"][number]): Pick<ViewStyle, "backgroundColor" | "width"> {
  const isSpendingRow = row.key === "fixed" || row.key === "flexible";
  const backgroundColor = isSpendingRow
    ? row.progress > 1
      ? colors.coral
      : row.progress >= 0.8
        ? colors.amber
        : colors.blue
    : colors.green;

  return {
    backgroundColor,
    width: getPercentWidthStyle(row.progress).width
  };
}

function getPocketFundingThisMonth(accounts: MoneyAccount[], transfers: MoneyTransfer[]): number {
  const incomeHubLabel = accounts.find((account) => account.isIncomeHub)?.label;
  if (!incomeHubLabel) return 0;

  const currentMonth = getMonthRange(new Date(), 0);
  return transfers
    .filter(
      (transfer) =>
        transfer.fromAccount === incomeHubLabel &&
        transfer.toAccount !== incomeHubLabel &&
        isWithinRange(transfer.occurredAt, currentMonth.start, currentMonth.end)
    )
    .reduce((sum, transfer) => sum + transfer.amount, 0);
}

function getReconciliationCopy(rows: AccountReconciliationRow[]): {
  detail: string;
  title: string;
  tone: SpendingPattern["tone"];
} {
  const rowsWithSnapshots = rows.filter((row) => row.status !== "no_snapshot");
  const reviewRows = rows.filter((row) => row.status === "needs_review");
  const smallGapRows = rows.filter((row) => row.status === "small_gap");
  const historyRows = rows.filter((row) => row.status === "needs_history");
  const totalGap = rows.reduce((sum, row) => sum + Math.abs(row.difference ?? 0), 0);

  if (rowsWithSnapshots.length === 0) {
    return {
      detail: "Add balance snapshots first. Reconciliation becomes useful after two snapshots for the same account.",
      title: "No balance check yet",
      tone: "calm"
    };
  }

  if (reviewRows.length > 0) {
    return {
      detail: `${reviewRows.length} account${reviewRows.length === 1 ? "" : "s"} need checking. Total visible gap is ${formatCompactRupiah(totalGap)}.`,
      title: "Some balances need review",
      tone: "notice"
    };
  }

  if (smallGapRows.length > 0) {
    return {
      detail: `${smallGapRows.length} account${smallGapRows.length === 1 ? "" : "s"} have small gaps. They may be fees, rounding, or one missing entry.`,
      title: "Small balance gaps are visible",
      tone: "warm"
    };
  }

  if (historyRows.length > 0) {
    return {
      detail: "At least one account has only one snapshot. Add the next snapshot to compare logged movement.",
      title: "One more snapshot will unlock checks",
      tone: "calm"
    };
  }

  return {
    detail: "Latest snapshots match the movement logged between balance checks.",
    title: "Logged movement matches balances",
    tone: "calm"
  };
}

function formatReconciliationDifference(row: AccountReconciliationRow): string {
  if (row.status === "no_snapshot") return "No snapshot";
  if (row.status === "needs_history") return "Need 2 snapshots";
  if (row.difference === null || Math.abs(row.difference) <= 1000) return "Matched";
  return formatSignedCompactRupiah(row.difference);
}

function getReconciliationDetail(row: AccountReconciliationRow): string {
  if (row.status === "no_snapshot") {
    return "Add a manual balance snapshot for this account.";
  }

  if (row.status === "needs_history") {
    return "Add one more snapshot later; Slev will compare the movement between both checks.";
  }

  const movement = `Logged movement over ${row.daysCovered} day${row.daysCovered === 1 ? "" : "s"}: income ${formatCompactRupiah(row.income)}, spending ${formatCompactRupiah(row.expense)}, transfer in ${formatCompactRupiah(row.transferIn)}, transfer out ${formatCompactRupiah(row.transferOut)}.`;
  if (row.difference === null || Math.abs(row.difference) <= 1000) {
    return movement;
  }

  const gap = formatCompactRupiah(Math.abs(row.difference));
  const direction = row.difference > 0
    ? `Actual balance is ${gap} higher than expected. Check missing income, transfer in, or an overstated expense.`
    : `Actual balance is ${gap} lower than expected. Check missing expense, transfer out, or a balance typo.`;

  return `${direction} ${movement}`;
}

function getReconciliationAmountStyle(row: AccountReconciliationRow): Pick<TextStyle, "color"> | undefined {
  if (row.difference === null || Math.abs(row.difference) <= 1000) return undefined;
  return row.difference > 0 ? styles.incomeText : styles.expenseText;
}

function buildAccountDistribution(
  accounts: MoneyAccount[],
  latestSnapshots: BalanceSnapshot[]
): AccountDistributionRow[] {
  const snapshotByLabel = new Map(latestSnapshots.map((snapshot) => [snapshot.accountLabel, snapshot.amount]));
  const labels = new Set([
    ...accounts.map((account) => account.label),
    ...latestSnapshots.map((snapshot) => snapshot.accountLabel)
  ]);
  const rows = Array.from(labels)
    .map((label) => ({
      amount: snapshotByLabel.get(label) ?? 0,
      label,
      share: 0
    }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  return rows.map((row) => ({
    ...row,
    share: total > 0 ? row.amount / total : 0
  }));
}

function buildTransferFlows(transfers: MoneyTransfer[]): TransferFlowRow[] {
  const range = getMonthRange(new Date(), 0);
  const grouped = transfers
    .filter((transfer) => isWithinRange(transfer.occurredAt, range.start, range.end))
    .reduce<Record<string, TransferFlowRow>>((acc, transfer) => {
      const key = `${transfer.fromAccount}->${transfer.toAccount}`;
      const current = acc[key] ?? {
        amount: 0,
        count: 0,
        fromAccount: transfer.fromAccount,
        key,
        toAccount: transfer.toAccount
      };
      acc[key] = {
        ...current,
        amount: current.amount + transfer.amount,
        count: current.count + 1
      };
      return acc;
    }, {});
  return Object.values(grouped).sort((a, b) => b.amount - a.amount);
}

function buildAccountActivity(moments: SpendingMoment[]): AccountActivityRow[] {
  const range = getMonthRange(new Date(), 0);
  const grouped = moments
    .filter((moment) => isWithinRange(moment.occurredAt, range.start, range.end))
    .reduce<Record<string, AccountActivityRow>>((acc, moment) => {
      const label = moment.accountLabel || "Unassigned";
      const current = acc[label] ?? {
        expense: 0,
        income: 0,
        label,
        net: 0,
        share: 0
      };
      const income = current.income + (moment.type === "income" ? moment.amount : 0);
      const expense = current.expense + (moment.type === "expense" ? moment.amount : 0);
      acc[label] = {
        ...current,
        expense,
        income,
        net: income - expense
      };
      return acc;
    }, {});
  const rows = Object.values(grouped).sort((a, b) => b.expense - a.expense);
  const maxExpense = Math.max(1, ...rows.map((row) => row.expense));
  return rows.map((row) => ({
    ...row,
    share: row.expense / maxExpense
  }));
}

function buildMonthMath(monthlySummary: MonthlySummary, monthlyPlan: MonthlyPlan | null): MonthMath {
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - dayOfMonth + 1);
  const projectedExpense = Math.round((monthlySummary.expense / Math.max(1, dayOfMonth)) * daysInMonth);
  const remainingFlexible = (monthlyPlan?.flexibleBudget ?? 0) - monthlySummary.flexibleExpense;
  const safeDailyFlexible = monthlyPlan ? Math.max(0, Math.round(remainingFlexible / daysRemaining)) : 0;
  const savingsRate = monthlySummary.income > 0
    ? Math.max(0, monthlySummary.net) / monthlySummary.income
    : 0;

  return {
    projectedExpense,
    safeDailyFlexible,
    savingsRate
  };
}

function buildCashflowWeeks(moments: SpendingMoment[]): CashflowWeek[] {
  const currentWeekStart = getStartOfWeek(new Date());
  return Array.from({ length: 8 }, (_, index) => {
    const start = new Date(currentWeekStart.getTime() - (7 - index) * 7 * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const weekMoments = moments.filter((moment) => isWithinRange(moment.occurredAt, start, end));
    const income = sumMoments(weekMoments.filter((moment) => moment.type === "income"));
    const expense = sumExpenseMoments(weekMoments);
    return {
      expense,
      income,
      key: dateKey(start),
      label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      net: income - expense
    };
  });
}

function buildSpendingTrend(moments: SpendingMoment[]): SpendingTrend {
  const today = new Date();
  const months = [-2, -1, 0].map((offset) => {
    const range = getMonthRange(today, offset);
    const amount = sumExpenseMoments(
      moments.filter((moment) => isWithinRange(moment.occurredAt, range.start, range.end))
    );
    return {
      amount,
      key: dateKey(range.start),
      label: range.start.toLocaleDateString("en-US", { month: "short" }),
      share: 0
    };
  });
  const maxAmount = Math.max(1, ...months.map((month) => month.amount));
  const monthsWithShare = months.map((month) => ({
    ...month,
    share: month.amount / maxAmount
  }));
  const currentMonth = monthsWithShare[2];
  const lastMonth = monthsWithShare[1];
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const expectedPace = lastMonth.amount * (dayOfMonth / daysInMonth);
  const midpointMessage =
    dayOfMonth >= Math.ceil(daysInMonth / 2) && lastMonth.amount > 0 && currentMonth.amount > expectedPace
      ? `${currentMonth.label} is running above last month's pace at this point.`
      : undefined;
  const currentRange = getMonthRange(today, 0);
  const topCategories = buildMonthlyBreakdown(
    moments.filter((moment) => isWithinRange(moment.occurredAt, currentRange.start, currentRange.end)),
    "expense"
  )
    .slice(0, 2)
    .map((row) => ({ amount: row.amount, label: row.label }));

  return {
    midpointMessage,
    months: monthsWithShare,
    topCategories
  };
}

function getMomentsInPeriod(moments: SpendingMoment[], period: BudgetPeriod, referenceDate = new Date()): SpendingMoment[] {
  const range = period === "weekly" ? getWeekRange(referenceDate) : getMonthRange(referenceDate, 0);
  return moments.filter((moment) => isWithinRange(moment.occurredAt, range.start, range.end));
}

function sumExpenseMoments(moments: SpendingMoment[]): number {
  return sumMoments(moments.filter((moment) => moment.type === "expense"));
}

function sumMoments(moments: SpendingMoment[]): number {
  return moments.reduce((sum, moment) => sum + moment.amount, 0);
}

function getProgressFillStyle(progress: number): Pick<ViewStyle, "backgroundColor" | "width"> {
  const clampedProgress = clampPercent(progress);
  const backgroundColor = progress > 1 ? "#d98272" : progress >= 0.8 ? "#d6a94a" : colors.green;
  return {
    backgroundColor,
    width: `${Math.round(clampedProgress * 100)}%` as ViewStyle["width"]
  };
}

function getPercentWidthStyle(value: number): Pick<ViewStyle, "width"> {
  const clamped = clampPercent(value);
  const width = clamped > 0 && clamped < 0.02 ? 2 : Math.round(clamped * 100);
  return { width: `${width}%` as ViewStyle["width"] };
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

function getStartOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + offset);
  return start;
}

function getMonthRange(date: Date, monthOffset: number): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);
  const end = new Date(date.getFullYear(), date.getMonth() + monthOffset + 1, 1);
  return { start, end };
}

function isWithinRange(value: string, start: Date, end: Date): boolean {
  const time = Date.parse(value);
  return time >= start.getTime() && time < end.getTime();
}

function getRepeatSuggestions(moments: SpendingMoment[]): RepeatSuggestion[] {
  const seen = new Set<string>();
  const suggestions: RepeatSuggestion[] = [];

  for (const moment of moments) {
    if (moment.type === "income") continue;
    const label = moment.label || moment.context;
    const key = `${label.toLowerCase()}-${moment.context}`;
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push({
      accountLabel: moment.accountLabel,
      amount: moment.amount,
      context: moment.context,
      label
    });
    if (suggestions.length >= 4) break;
  }

  return suggestions;
}

function filterMoments(moments: SpendingMoment[], query: string): SpendingMoment[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return moments;

  return moments.filter((moment) => {
    const haystack = [
      moment.label,
      moment.source,
      moment.accountLabel,
      moment.type,
      moment.context,
      moment.note,
      String(moment.amount),
      formatCompactRupiah(moment.amount)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

function getRepeatHint(moment: SpendingMoment, moments: SpendingMoment[]): string | undefined {
  if (moment.type === "income") return undefined;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const count = moments.filter(
    (item) => item.type === "expense" && item.context === moment.context && Date.parse(item.occurredAt) >= weekAgo
  ).length;
  return count >= 3 ? `${count} this week` : undefined;
}

function groupMomentsByRecallRange(moments: SpendingMoment[]) {
  const now = new Date();
  const todayKey = dateKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = dateKey(yesterday);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const groups = [
    { key: "today", label: "Today", items: [] as SpendingMoment[] },
    { key: "yesterday", label: "Yesterday", items: [] as SpendingMoment[] },
    { key: "this-week", label: "This week", items: [] as SpendingMoment[] },
    { key: "earlier", label: "Earlier", items: [] as SpendingMoment[] }
  ];

  moments.forEach((moment) => {
    const key = dateKey(new Date(moment.occurredAt));
    const time = Date.parse(moment.occurredAt);
    if (key === todayKey) {
      groups[0].items.push(moment);
    } else if (key === yesterdayKey) {
      groups[1].items.push(moment);
    } else if (time >= weekAgo) {
      groups[2].items.push(moment);
    } else {
      groups[3].items.push(moment);
    }
  });

  return groups.filter((group) => group.items.length > 0);
}

function groupPatterns(patterns: SpendingPattern[]) {
  const byGroup = patterns.reduce<Record<string, SpendingPattern[]>>((acc, pattern) => {
    acc[pattern.group] = [...(acc[pattern.group] ?? []), pattern];
    return acc;
  }, {});

  return Object.entries(byGroup).map(([title, items]) => ({ title, items }));
}

function formatDate(key: string): string {
  return new Date(`${key}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getIncomeHubLabel(accounts: MoneyAccount[]): string {
  return accounts.find((account) => account.isIncomeHub)?.label ?? accounts[0]?.label ?? "BRI";
}

function getDailyPocketLabel(accounts: MoneyAccount[]): string {
  return accounts.find((account) => !account.isIncomeHub)?.label ?? accounts[0]?.label ?? "Jago";
}

function getDefaultMomentAccount(type: EntryType, accounts: MoneyAccount[]): string {
  return type === "income" ? getIncomeHubLabel(accounts) : getDailyPocketLabel(accounts);
}

function contextIcon(context: SpendingContext): keyof typeof Ionicons.glyphMap {
  if (context === "Meal") return "restaurant-outline";
  if (context === "Coffee") return "cafe-outline";
  if (context === "Transport") return "car-outline";
  if (context === "Groceries") return "basket-outline";
  if (context === "Bills") return "receipt-outline";
  if (context === "Treat") return "sparkles-outline";
  if (context === "Home") return "home-outline";
  return "ellipse-outline";
}

function patternIcon(tone: SpendingPattern["tone"]): keyof typeof Ionicons.glyphMap {
  if (tone === "notice") return "radio-button-on-outline";
  if (tone === "warm") return "sunny-outline";
  return "leaf-outline";
}

function patternColor(tone: SpendingPattern["tone"]): string {
  if (tone === "notice") return colors.blue;
  if (tone === "warm") return colors.amber;
  return colors.greenDark;
}

function patternStyle(tone: SpendingPattern["tone"]) {
  if (tone === "notice") return styles.patternNotice;
  if (tone === "warm") return styles.patternWarm;
  return styles.patternCalm;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  appShell: {
    flex: 1
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12
  },
  headerTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  brandMark: {
    height: 42,
    width: 42
  },
  brandName: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0
  },
  brandLine: {
    color: colors.muted,
    fontSize: 13,
    letterSpacing: 0
  },
  headerMessage: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  iconButton: {
    alignItems: "center",
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  iconButtonActive: {
    backgroundColor: colors.mint,
    borderColor: colors.green
  },
  content: {
    flex: 1
  },
  bootState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24
  },
  bootText: {
    color: colors.muted,
    fontSize: 14,
    letterSpacing: 0
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 112,
    gap: 18
  },
  capturePanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    ...shadows.soft
  },
  pulsePanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 14
  },
  pulseItem: {
    flex: 1,
    gap: 4,
    minWidth: 92
  },
  pulseWideItem: {
    borderTopColor: colors.faint,
    borderTopWidth: 1,
    flexBasis: "100%",
    paddingTop: 10
  },
  pulseValue: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0
  },
  allocationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  allocationMetric: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    gap: 5,
    minHeight: 104,
    minWidth: 138,
    padding: 14
  },
  allocationValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0
  },
  kicker: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  kickerDark: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  amountRow: {
    alignItems: "center",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 70
  },
  currencyPrefix: {
    color: colors.greenDark,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0
  },
  amountInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 0,
    paddingVertical: 8
  },
  input: {
    backgroundColor: colors.faint,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    letterSpacing: 0,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  segmentedControl: {
    backgroundColor: colors.faint,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: "100%"
  },
  segmentedControlCompact: {
    alignSelf: "flex-start",
    maxWidth: "100%"
  },
  segmentedControlContent: {
    flexDirection: "row",
    gap: 3,
    padding: 4
  },
  segmentButton: {
    alignItems: "center",
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 6,
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: "center",
    minHeight: 40,
    minWidth: 88,
    paddingHorizontal: 10
  },
  segmentButtonCompact: {
    minHeight: 34,
    minWidth: 84
  },
  segmentButtonActive: {
    backgroundColor: colors.surface,
    borderColor: colors.line
  },
  segmentButtonText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "center"
  },
  segmentButtonTextActive: {
    color: colors.greenDark
  },
  transferPickerBlock: {
    gap: 12
  },
  accountPickerBlock: {
    gap: 8
  },
  accountChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  accountChip: {
    alignItems: "center",
    backgroundColor: colors.canvas,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 10
  },
  accountChipActive: {
    backgroundColor: colors.mint,
    borderColor: colors.green
  },
  accountChipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0
  },
  accountChipTextActive: {
    color: colors.greenDark
  },
  accountMark: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32
  },
  accountMarkSmall: {
    borderRadius: 6,
    height: 24,
    width: 24
  },
  accountMarkText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 13,
    textAlign: "center"
  },
  accountMarkTextSmall: {
    fontSize: 9,
    lineHeight: 11
  },
  accountTitleRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minWidth: 0
  },
  transferTitleRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 6,
    minWidth: 0
  },
  noteInput: {
    minHeight: 64,
    textAlignVertical: "top"
  },
  suggestionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  repeatBlock: {
    gap: 8
  },
  templateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  templateChip: {
    alignItems: "stretch",
    backgroundColor: colors.mint,
    borderColor: "#c3e3cc",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    overflow: "hidden"
  },
  templateMain: {
    gap: 2,
    minWidth: 104,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  templateRemoveButton: {
    alignItems: "center",
    borderLeftColor: "#c3e3cc",
    borderLeftWidth: 1,
    justifyContent: "center",
    minWidth: 30
  },
  microLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  repeatChip: {
    backgroundColor: colors.mint,
    borderColor: "#c3e3cc",
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  repeatText: {
    color: colors.greenDark,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0
  },
  repeatAmount: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0
  },
  suggestionChip: {
    backgroundColor: colors.canvas,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  suggestionText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "700"
  },
  contextWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  contextWrapCompact: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  contextHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  contextDefault: {
    color: colors.muted,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right"
  },
  contextChip: {
    backgroundColor: colors.canvas,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 42,
    minWidth: "30%",
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  contextChipActive: {
    backgroundColor: colors.mint,
    borderColor: colors.green
  },
  contextChipText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0
  },
  contextChipTextActive: {
    color: colors.greenDark
  },
  contextHint: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2
  },
  addNoteButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 2
  },
  addNoteText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.greenDark,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 16
  },
  smallPrimaryButton: {
    alignItems: "center",
    backgroundColor: colors.greenDark,
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 18
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 18
  },
  secondaryButtonText: {
    color: colors.greenDark,
    fontSize: 14,
    fontWeight: "800"
  },
  secondaryInlineButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 2
  },
  lastSavedPanel: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 14
  },
  lastSavedText: {
    flex: 1,
    gap: 3
  },
  lastSavedTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0
  },
  lastSavedActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  observationPanel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 8
  },
  heroPanel: {
    backgroundColor: colors.mint,
    borderColor: "#c3e3cc",
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
    gap: 8
  },
  heroTitle: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 30
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0
  },
  listPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden"
  },
  momentRow: {
    alignItems: "center",
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 68,
    padding: 14
  },
  momentRowCompact: {
    minHeight: 62
  },
  momentIcon: {
    alignItems: "center",
    backgroundColor: colors.mint,
    borderRadius: 8,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  incomeMomentIcon: {
    backgroundColor: "#eef6fa"
  },
  momentText: {
    flex: 1,
    gap: 3
  },
  momentTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0
  },
  momentMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16
  },
  repeatHint: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16
  },
  momentAmount: {
    color: colors.greenDark,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0
  },
  incomeText: {
    color: colors.blue
  },
  expenseText: {
    color: colors.coral
  },
  memoryGroup: {
    gap: 8
  },
  groupTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  rowActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
    paddingBottom: 12,
    paddingHorizontal: 14
  },
  textButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    minHeight: 32
  },
  textButtonLabel: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "800"
  },
  deleteText: {
    color: colors.coral
  },
  editPanel: {
    backgroundColor: colors.canvas,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    gap: 10,
    padding: 14
  },
  editActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end"
  },
  inlineEditor: {
    backgroundColor: colors.canvas,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    gap: 10,
    marginHorizontal: -14,
    marginTop: 12,
    padding: 14
  },
  budgetRow: {
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    gap: 10,
    padding: 14
  },
  budgetHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  budgetTitleBlock: {
    flex: 1,
    gap: 4
  },
  budgetCategory: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0
  },
  budgetMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16
  },
  progressTrack: {
    backgroundColor: colors.faint,
    borderRadius: 8,
    height: 10,
    overflow: "hidden"
  },
  progressFill: {
    borderRadius: 8,
    height: 10
  },
  planSummaryRow: {
    alignItems: "center",
    backgroundColor: colors.faint,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: 12
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14
  },
  patternGroup: {
    gap: 10
  },
  patternCard: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16
  },
  patternCalm: {
    backgroundColor: colors.surface,
    borderColor: colors.line
  },
  patternNotice: {
    backgroundColor: "#eef6fa",
    borderColor: "#cfe3ed"
  },
  patternWarm: {
    backgroundColor: "#fff8e8",
    borderColor: "#f3dfad"
  },
  patternTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  patternTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 22
  },
  patternDetail: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  recapBlock: {
    borderTopColor: "rgba(24,32,28,0.08)",
    borderTopWidth: 1,
    gap: 10,
    marginTop: 4,
    paddingTop: 12
  },
  recapQuestion: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19
  },
  feedbackRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  feedbackButton: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  feedbackButtonActive: {
    backgroundColor: colors.greenDark,
    borderColor: colors.greenDark
  },
  feedbackText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "800"
  },
  feedbackTextActive: {
    color: colors.surface
  },
  analyticsBlock: {
    gap: 14
  },
  analyticsRow: {
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    gap: 10,
    padding: 14
  },
  analyticsRowHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  analyticsTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0
  },
  analyticsAmount: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "right"
  },
  breakdownFill: {
    backgroundColor: colors.blue,
    borderRadius: 8,
    height: 10
  },
  trendFill: {
    backgroundColor: colors.green,
    borderRadius: 8,
    height: 10
  },
  cashflowRow: {
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    gap: 12,
    padding: 14
  },
  cashflowRowRecent: {
    backgroundColor: "#f3f7f0"
  },
  cashflowBars: {
    gap: 8
  },
  cashflowBarLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    minHeight: 24
  },
  cashflowLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    width: 56
  },
  cashflowTrack: {
    backgroundColor: colors.faint,
    borderRadius: 8,
    flex: 1,
    height: 9,
    overflow: "hidden"
  },
  incomeFill: {
    backgroundColor: colors.blue,
    borderRadius: 8,
    height: 9
  },
  expenseFill: {
    backgroundColor: colors.amber,
    borderRadius: 8,
    height: 9
  },
  cashflowAmount: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "right",
    width: 64
  },
  settingsPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden"
  },
  settingRow: {
    alignItems: "flex-start",
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 16
  },
  settingText: {
    flex: 1,
    gap: 4
  },
  settingTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0
  },
  settingCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  cardGrid: {
    gap: 10
  },
  dangerButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: "#f3c8c0",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 14
  },
  dangerButtonText: {
    color: colors.coral,
    fontSize: 14,
    fontWeight: "800"
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    justifyContent: "center",
    minHeight: 112,
    padding: 18
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  },
  emptyActionButton: {
    alignItems: "center",
    borderColor: colors.green,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  emptyActionText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0
  },
  tabBar: {
    backgroundColor: "rgba(247, 248, 244, 0.96)",
    borderTopColor: colors.line,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    gap: 6,
    left: 0,
    paddingBottom: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    position: "absolute",
    right: 0
  },
  tabItem: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    gap: 3,
    justifyContent: "center",
    minHeight: 54
  },
  tabItemActive: {
    backgroundColor: colors.mint
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0
  },
  tabLabelActive: {
    color: colors.greenDark
  }
});
