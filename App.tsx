import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BRAND } from "./src/data/brand";
import { CATEGORIES, DEFAULT_SOURCES, MANUAL_METHODS, SAMPLE_NOTIFICATIONS } from "./src/data/catalog";
import {
  FinanceSource,
  NotificationPayload,
  SyncSettings,
  TransactionCategory,
  TransactionDraft,
  TransactionMethod
} from "./src/features/transactions.types";
import {
  CategoryTotal,
  SpendingInsight,
  TrendPoint,
  buildDailyTrend,
  formatCompactRupiah,
  generateWeeklyInsights,
  getCategoryTotals
} from "./src/lib/spendingAnalytics";
import { formatRupiah, parseFinancialNotification } from "./src/lib/transactionParser";
import { hasSyncEndpoint, syncTransactionToSheets } from "./src/services/googleSheetsSync";
import { notificationCaptureService } from "./src/services/notificationCaptureService";
import {
  clearTransactions,
  loadCategories,
  listTransactions,
  loadSources,
  loadSyncSettings,
  saveCategories,
  saveSources,
  saveSyncSettings,
  saveParsedTransaction,
  updateTransactionCategory,
  updateTransactionSyncState,
  updateTransactionStatus
} from "./src/services/transactionRepository";
import { colors, shadows } from "./src/theme/colors";

type TabKey = "home" | "inbox" | "analytics" | "capture" | "settings";

const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "home", label: "Home", icon: "grid-outline" },
  { key: "inbox", label: "Inbox", icon: "file-tray-outline" },
  { key: "analytics", label: "Trends", icon: "bar-chart-outline" },
  { key: "capture", label: "Capture", icon: "scan-outline" },
  { key: "settings", label: "Settings", icon: "shield-checkmark-outline" }
];

const SLEV_MARK = require("./assets/brand/slev-mark-transparent.png");

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [transactions, setTransactions] = useState<TransactionDraft[]>([]);
  const [sources, setSources] = useState<FinanceSource[]>(DEFAULT_SOURCES);
  const [categories, setCategories] = useState<TransactionCategory[]>(CATEGORIES);
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({ endpointUrl: "", sheetUrl: "" });
  const [rawNotification, setRawNotification] = useState(SAMPLE_NOTIFICATIONS[0]);
  const [lastParseMessage, setLastParseMessage] = useState("Ready to parse a finance notification.");
  const [listenerAvailable, setListenerAvailable] = useState(false);
  const [listenerGranted, setListenerGranted] = useState(false);
  const [syncQueueActive, setSyncQueueActive] = useState(false);
  const sourcesRef = useRef<FinanceSource[]>(DEFAULT_SOURCES);
  const syncSettingsRef = useRef<SyncSettings>({ endpointUrl: "", sheetUrl: "" });

  const reloadTransactions = useCallback(async () => {
    const next = await listTransactions();
    setTransactions(next);
  }, []);

  useEffect(() => {
    reloadTransactions();
    loadSources(DEFAULT_SOURCES).then((storedSources) => {
      sourcesRef.current = storedSources;
      setSources(storedSources);
    });
    loadCategories(CATEGORIES).then(setCategories);
    loadSyncSettings().then((storedSettings) => {
      syncSettingsRef.current = storedSettings;
      setSyncSettings(storedSettings);
    });

    notificationCaptureService.isAvailable().then(setListenerAvailable);
    notificationCaptureService.isPermissionGranted().then(setListenerGranted);

    const subscription = notificationCaptureService.subscribe((payload) => {
      handleIncomingNotification(payload);
    });

    return () => subscription.remove();
  }, [reloadTransactions]);

  useEffect(() => {
    sourcesRef.current = sources;
  }, [sources]);

  useEffect(() => {
    syncSettingsRef.current = syncSettings;
  }, [syncSettings]);

  const draftTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.status === "draft"),
    [transactions]
  );

  const confirmedTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.status === "confirmed"),
    [transactions]
  );

  const unsyncedTransactions = useMemo(
    () => confirmedTransactions.filter((transaction) => transaction.syncStatus !== "synced"),
    [confirmedTransactions]
  );

  const todayTotal = useMemo(() => {
    const today = new Date().toDateString();
    return confirmedTransactions
      .filter((transaction) => new Date(transaction.timestamp).toDateString() === today)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [confirmedTransactions]);

  const weekTotal = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return confirmedTransactions
      .filter((transaction) => Date.parse(transaction.timestamp) >= weekAgo)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [confirmedTransactions]);

  const biggestCategory = useMemo(() => {
    const totals = confirmedTransactions.reduce<Record<string, number>>((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] ?? 0) + transaction.amount;
      return acc;
    }, {});

    const [category] = Object.entries(totals).sort((a, b) => b[1] - a[1])[0] ?? ["None"];
    return category;
  }, [confirmedTransactions]);

  const dailyTrend = useMemo(() => buildDailyTrend(confirmedTransactions), [confirmedTransactions]);
  const categoryTotals = useMemo(() => getCategoryTotals(confirmedTransactions), [confirmedTransactions]);
  const weeklyInsights = useMemo(() => generateWeeklyInsights(confirmedTransactions), [confirmedTransactions]);

  async function handleIncomingNotification(payload: NotificationPayload) {
    const result = parseFinancialNotification(payload, { sources: sourcesRef.current });

    if (!result.ok) {
      setLastParseMessage(result.reason);
      return;
    }

    const matchedSource = sourcesRef.current.find((source) => source.id === result.transaction.source);
    if (matchedSource && !matchedSource.enabled && result.transaction.source !== "unknown") {
      setLastParseMessage(`${result.transaction.sourceLabel} is disabled in Settings.`);
      return;
    }

    await saveParsedTransaction(result.transaction);
    await reloadTransactions();
    setLastParseMessage(`Captured ${formatRupiah(result.transaction.amount)} at ${result.transaction.merchant}.`);
  }

  async function parseManualNotification(text = rawNotification) {
    await handleIncomingNotification({
      body: text,
      receivedAt: new Date().toISOString()
    });
  }

  async function quickAddTransaction(input: {
    amountText: string;
    category: TransactionCategory;
    merchant: string;
    method: TransactionMethod;
  }) {
    const amount = parseAmountInput(input.amountText);
    const merchant = input.merchant.trim() || "Manual entry";

    if (!amount) {
      setLastParseMessage("Enter a valid amount before saving a manual transaction.");
      return;
    }

    const saved = await saveParsedTransaction({
      amount,
      merchant,
      category: input.category,
      method: input.method,
      source: "manual",
      sourceLabel: "Manual",
      transactionType: "expense",
      timestamp: new Date().toISOString(),
      confidence: 1
    });

    const settings = syncSettingsRef.current;
    const updated = await updateTransactionStatus(
      saved.id,
      "confirmed",
      hasSyncEndpoint(settings) ? "pending" : "not_configured"
    );
    setTransactions(updated);

    const confirmed = updated.find((transaction) => transaction.id === saved.id);
    if (confirmed && hasSyncEndpoint(settings)) {
      await syncSingleTransaction(confirmed, settings);
      return;
    }

    setLastParseMessage(`Saved ${formatRupiah(amount)} at ${merchant}.`);
  }

  async function updateStatus(id: string, status: TransactionDraft["status"]) {
    const updated = await updateTransactionStatus(id, status);
    setTransactions(updated);
  }

  async function confirmTransaction(id: string) {
    const settings = syncSettingsRef.current;
    const initialSyncStatus = hasSyncEndpoint(settings) ? "pending" : "not_configured";
    const updated = await updateTransactionStatus(id, "confirmed", initialSyncStatus);
    setTransactions(updated);

    const transaction = updated.find((item) => item.id === id);
    if (!transaction) return;

    if (!hasSyncEndpoint(settings)) {
      setLastParseMessage("Confirmed locally. Add a Google Apps Script endpoint to sync it.");
      return;
    }

    await syncSingleTransaction(transaction, settings);
  }

  async function syncSingleTransaction(transaction: TransactionDraft, settings = syncSettingsRef.current) {
    if (!hasSyncEndpoint(settings)) {
      const updated = await updateTransactionSyncState(transaction.id, {
        syncStatus: "not_configured",
        syncError: "Missing Google Apps Script endpoint."
      });
      setTransactions(updated);
      return;
    }

    setTransactions(
      await updateTransactionSyncState(transaction.id, {
        syncStatus: "syncing",
        syncError: undefined
      })
    );

    try {
      await syncTransactionToSheets(transaction, settings);
      const updated = await updateTransactionSyncState(transaction.id, {
        syncStatus: "synced",
        syncError: undefined,
        syncedAt: new Date().toISOString()
      });
      setTransactions(updated);
      setLastParseMessage(`Synced ${transaction.merchant} to Google Sheets.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed.";
      const updated = await updateTransactionSyncState(transaction.id, {
        syncStatus: "failed",
        syncError: message
      });
      setTransactions(updated);
      setLastParseMessage(message);
    }
  }

  async function syncPendingTransactions() {
    const settings = syncSettingsRef.current;
    if (syncQueueActive) return;

    if (!hasSyncEndpoint(settings)) {
      setLastParseMessage("Add a valid Google Apps Script Web App URL before syncing.");
      return;
    }

    const pending = (await listTransactions()).filter(
      (transaction) => transaction.status === "confirmed" && transaction.syncStatus !== "synced"
    );

    if (pending.length === 0) {
      setLastParseMessage("Everything confirmed is already synced.");
      return;
    }

    setSyncQueueActive(true);
    setLastParseMessage(`Syncing ${pending.length} transaction${pending.length === 1 ? "" : "s"} to Google Sheets.`);

    try {
      for (const transaction of pending) {
        await syncSingleTransaction(transaction, settings);
      }
    } finally {
      setSyncQueueActive(false);
    }
  }

  async function updateCategory(id: string, category: TransactionCategory) {
    const updated = await updateTransactionCategory(id, category);
    setTransactions(updated);
  }

  async function addCategory(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;

    if (categories.some((category) => category.toLowerCase() === trimmed.toLowerCase())) {
      setLastParseMessage(`${trimmed} is already in your categories.`);
      return;
    }

    const next = [...categories, trimmed];
    setCategories(next);
    await saveCategories(next);
    setLastParseMessage(`${trimmed} added as a category.`);
  }

  async function toggleSource(sourceId: string) {
    const next = sources.map((source) =>
      source.id === sourceId
        ? {
            ...source,
            enabled: !source.enabled
          }
        : source
    );

    setSources(next);
    await saveSources(next);
  }

  async function addSource(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;

    const id = createSourceId(trimmed);
    if (sources.some((source) => source.id === id)) {
      setLastParseMessage(`${trimmed} is already in your sources.`);
      return;
    }

    const next = [
      ...sources,
      {
        id,
        label: trimmed,
        keywords: createSourceKeywords(trimmed),
        enabled: true,
        builtIn: false
      }
    ];

    setSources(next);
    await saveSources(next);
    setLastParseMessage(`${trimmed} added as a notification source.`);
  }

  async function updateSyncSettings(settings: SyncSettings) {
    const next = {
      endpointUrl: settings.endpointUrl.trim(),
      sheetUrl: settings.sheetUrl.trim()
    };
    syncSettingsRef.current = next;
    setSyncSettings(next);
    await saveSyncSettings(next);
    setLastParseMessage("Google Sheets sync settings saved.");
  }

  async function clearLocalData() {
    Alert.alert("Clear local data?", "This removes drafts and confirmed local records from this device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearTransactions();
          setTransactions([]);
        }
      }
    ]);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.app}>
          <View style={styles.header}>
            <View style={styles.brandLockup}>
              <View style={styles.logoTile}>
                <Image accessibilityIgnoresInvertColors source={SLEV_MARK} style={styles.logoImage} />
              </View>
              <View style={styles.brandTextBlock}>
                <Text style={styles.brand}>{BRAND.name}</Text>
                <Text style={styles.subtitle}>{BRAND.shortTagline}</Text>
              </View>
            </View>
            <View style={styles.badge}>
              <Ionicons name="lock-closed-outline" size={14} color={colors.greenDark} />
              <Text style={styles.badgeText}>Private</Text>
            </View>
          </View>

          <View style={styles.tabs}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.tab, isActive && styles.tabActive]}
                >
                  <Ionicons name={tab.icon} size={20} color={isActive ? colors.greenDark : colors.muted} />
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {activeTab === "home" && (
              <HomeScreen
                biggestCategory={biggestCategory}
                confirmedTransactions={confirmedTransactions}
                draftCount={draftTransactions.length}
                syncConfigured={hasSyncEndpoint(syncSettings)}
                syncQueueActive={syncQueueActive}
                todayTotal={todayTotal}
                unsyncedCount={unsyncedTransactions.length}
                weeklyInsights={weeklyInsights}
                weekTotal={weekTotal}
                onSyncPending={syncPendingTransactions}
              />
            )}

            {activeTab === "inbox" && (
              <InboxScreen
                categories={categories}
                transactions={draftTransactions}
                onConfirm={confirmTransaction}
                onIgnore={(id) => updateStatus(id, "ignored")}
                onUpdateCategory={updateCategory}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsScreen
                categoryTotals={categoryTotals}
                confirmedTransactions={confirmedTransactions}
                dailyTrend={dailyTrend}
                insights={weeklyInsights}
              />
            )}

          {activeTab === "capture" && (
            <CaptureScreen
              categories={categories}
              lastParseMessage={lastParseMessage}
              rawNotification={rawNotification}
              onChangeRawNotification={setRawNotification}
              onManualAdd={quickAddTransaction}
              onParse={() => parseManualNotification()}
              onUseSample={(sample) => {
                  setRawNotification(sample);
                  parseManualNotification(sample);
                }}
              />
            )}

            {activeTab === "settings" && (
              <SettingsScreen
                listenerAvailable={listenerAvailable}
                listenerGranted={listenerGranted}
                categories={categories}
                sources={sources}
                syncSettings={syncSettings}
                syncQueueActive={syncQueueActive}
                unsyncedCount={unsyncedTransactions.length}
                onAddCategory={addCategory}
                onAddSource={addSource}
                onClearLocalData={clearLocalData}
                onOpenPermissionSettings={async () => {
                  await notificationCaptureService.openPermissionSettings();
                  setListenerGranted(await notificationCaptureService.isPermissionGranted());
                }}
                onSaveSyncSettings={updateSyncSettings}
                onSyncPending={syncPendingTransactions}
                onToggleSource={toggleSource}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function HomeScreen({
  biggestCategory,
  confirmedTransactions,
  draftCount,
  syncConfigured,
  syncQueueActive,
  todayTotal,
  unsyncedCount,
  weeklyInsights,
  weekTotal,
  onSyncPending
}: {
  biggestCategory: string;
  confirmedTransactions: TransactionDraft[];
  draftCount: number;
  syncConfigured: boolean;
  syncQueueActive: boolean;
  todayTotal: number;
  unsyncedCount: number;
  weeklyInsights: SpendingInsight[];
  weekTotal: number;
  onSyncPending: () => void;
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.heroPanel}>
        <Text style={styles.kicker}>Spending awareness</Text>
        <Text style={styles.heroTitle}>{BRAND.name} keeps spending tucked into view.</Text>
        <Text style={styles.heroCopy}>
          Confirm drafts, sync structured records, and let weekly patterns surface naturally.
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <MetricCard label="Today" value={formatRupiah(todayTotal)} icon="today-outline" />
        <MetricCard label="This week" value={formatRupiah(weekTotal)} icon="calendar-outline" />
        <MetricCard label="Drafts" value={`${draftCount}`} icon="file-tray-outline" />
        <MetricCard label="Synced" value={`${confirmedTransactions.filter((item) => item.syncStatus === "synced").length}`} icon="cloud-done-outline" />
      </View>

      <View style={styles.syncPanel}>
        <View style={styles.syncPanelText}>
          <Text style={styles.panelTitle}>{syncConfigured ? "Sheets sync ready" : "Sheets sync not connected"}</Text>
          <Text style={styles.panelCopy}>
            {syncConfigured
              ? `${unsyncedCount} confirmed transaction${unsyncedCount === 1 ? "" : "s"} waiting. Top category: ${biggestCategory}.`
              : "Add your Apps Script Web App URL in Settings before confirmed records can sync."}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={syncQueueActive}
          onPress={onSyncPending}
          style={[styles.iconButton, syncQueueActive && styles.iconButtonDisabled]}
        >
          <Ionicons name={syncQueueActive ? "hourglass-outline" : "sync-outline"} size={20} color={colors.surface} />
        </Pressable>
      </View>

      <SectionHeader title="Weekly insight" />
      <InsightList insights={weeklyInsights.slice(0, 2)} />

      <SectionHeader title="Recent confirmed" />
      {confirmedTransactions.length === 0 ? (
        <EmptyState text="Confirmed transactions will appear here after you review drafts." />
      ) : (
        confirmedTransactions.slice(0, 5).map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} compact />
        ))
      )}
    </View>
  );
}

function createSourceId(label: string): string {
  const normalized = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || `source-${Date.now()}`;
}

function createSourceKeywords(label: string): string[] {
  const normalized = label.trim().toLowerCase();
  const compact = normalized.replace(/\s+/g, "");

  return Array.from(new Set([normalized, compact].filter(Boolean)));
}

function parseAmountInput(value: string): number | null {
  const amount = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function InboxScreen({
  categories,
  transactions,
  onConfirm,
  onIgnore,
  onUpdateCategory
}: {
  categories: TransactionCategory[];
  transactions: TransactionDraft[];
  onConfirm: (id: string) => void;
  onIgnore: (id: string) => void;
  onUpdateCategory: (id: string, category: TransactionCategory) => void;
}) {
  return (
    <View style={styles.screen}>
      <SectionHeader title="Review inbox" />
      {transactions.length === 0 ? (
        <EmptyState text="No drafts yet. Try the Capture tab with a sample notification." />
      ) : (
        transactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <TransactionRow transaction={transaction} />
            <View style={styles.categoryWrap}>
              {categories.map((category) => (
                <Pressable
                  accessibilityRole="button"
                  key={category}
                  onPress={() => onUpdateCategory(transaction.id, category)}
                  style={[styles.categoryChip, transaction.category === category && styles.categoryChipActive]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      transaction.category === category && styles.categoryChipTextActive
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => onIgnore(transaction.id)}
                style={[styles.actionButton, styles.ghostButton]}
              >
                <Ionicons name="close-outline" size={18} color={colors.muted} />
                <Text style={styles.ghostButtonText}>Ignore</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => onConfirm(transaction.id)}
                style={[styles.actionButton, styles.primaryButton]}
              >
                <Ionicons name="checkmark-outline" size={18} color={colors.surface} />
                <Text style={styles.primaryButtonText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function AnalyticsScreen({
  categoryTotals,
  confirmedTransactions,
  dailyTrend,
  insights
}: {
  categoryTotals: CategoryTotal[];
  confirmedTransactions: TransactionDraft[];
  dailyTrend: TrendPoint[];
  insights: SpendingInsight[];
}) {
  const total = confirmedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const trendTotal = dailyTrend.reduce((sum, point) => sum + point.amount, 0);
  const average = dailyTrend.length > 0 ? trendTotal / dailyTrend.length : 0;
  const maxTrendAmount = Math.max(...dailyTrend.map((point) => point.amount), 1);

  return (
    <View style={styles.screen}>
      <View style={styles.analyticsHeader}>
        <View>
          <Text style={styles.kickerDark}>Simple trends</Text>
          <Text style={styles.analyticsTitle}>{formatCompactRupiah(total)} tracked</Text>
          <Text style={styles.panelCopy}>Daily average: {formatCompactRupiah(Math.round(average))}</Text>
        </View>
        <View style={styles.analyticsIcon}>
          <Ionicons name="trending-up-outline" size={22} color={colors.greenDark} />
        </View>
      </View>

      <SectionHeader title="7-day trend" />
      <View style={styles.chartPanel}>
        {dailyTrend.map((point) => (
          <View key={point.key} style={styles.barColumn}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${Math.max((point.amount / maxTrendAmount) * 100, point.amount > 0 ? 8 : 0)}%`
                  }
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{point.label}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Top categories" />
      {categoryTotals.length === 0 ? (
        <EmptyState text="Confirm transactions to see category patterns." />
      ) : (
        <View style={styles.categoryPanel}>
          {categoryTotals.slice(0, 5).map((item) => (
            <View key={item.category} style={styles.categoryTotalRow}>
              <View style={styles.categoryTotalText}>
                <Text style={styles.settingTitle}>{item.category}</Text>
                <Text style={styles.settingCopy}>
                  {item.count} transaction{item.count === 1 ? "" : "s"}
                </Text>
              </View>
              <View style={styles.categoryBarOuter}>
                <View style={[styles.categoryBarInner, { width: `${Math.max(item.share * 100, 4)}%` }]} />
              </View>
              <Text style={styles.categoryAmount}>{formatCompactRupiah(item.amount)}</Text>
            </View>
          ))}
        </View>
      )}

      <SectionHeader title="Weekly insights" />
      <InsightList insights={insights} />
    </View>
  );
}

function InsightList({ insights }: { insights: SpendingInsight[] }) {
  return (
    <View style={styles.insightList}>
      {insights.map((insight) => (
        <View key={insight.id} style={[styles.insightCard, insightStyle(insight.tone)]}>
          <Ionicons name={insightIcon(insight.tone)} size={18} color={insightColor(insight.tone)} />
          <View style={styles.insightText}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDetail}>{insight.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function insightIcon(tone: SpendingInsight["tone"]): keyof typeof Ionicons.glyphMap {
  if (tone === "good") return "checkmark-circle-outline";
  if (tone === "notice") return "pulse-outline";
  return "sparkles-outline";
}

function insightColor(tone: SpendingInsight["tone"]): string {
  if (tone === "good") return colors.green;
  if (tone === "notice") return colors.amber;
  return colors.blue;
}

function insightStyle(tone: SpendingInsight["tone"]) {
  if (tone === "good") return styles.insightGood;
  if (tone === "notice") return styles.insightNotice;
  return styles.insightCalm;
}

function CaptureScreen({
  categories,
  lastParseMessage,
  rawNotification,
  onChangeRawNotification,
  onManualAdd,
  onParse,
  onUseSample
}: {
  categories: TransactionCategory[];
  lastParseMessage: string;
  rawNotification: string;
  onChangeRawNotification: (value: string) => void;
  onManualAdd: (input: {
    amountText: string;
    category: TransactionCategory;
    merchant: string;
    method: TransactionMethod;
  }) => void;
  onParse: () => void;
  onUseSample: (sample: string) => void;
}) {
  const [manualAmount, setManualAmount] = useState("");
  const [manualMerchant, setManualMerchant] = useState("");
  const [manualCategory, setManualCategory] = useState(categories[0] ?? "Other");
  const [manualMethod, setManualMethod] = useState<TransactionMethod>("QRIS");

  useEffect(() => {
    if (!categories.includes(manualCategory)) {
      setManualCategory(categories[0] ?? "Other");
    }
  }, [categories, manualCategory]);

  function submitManualEntry() {
    onManualAdd({
      amountText: manualAmount,
      category: manualCategory,
      merchant: manualMerchant,
      method: manualMethod
    });
    setManualAmount("");
    setManualMerchant("");
  }

  return (
    <View style={styles.screen}>
      <SectionHeader title="Quick add" />
      <View style={styles.inputPanel}>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setManualAmount}
          placeholder="Amount, e.g. 18000"
          placeholderTextColor={colors.muted}
          style={styles.singleLineInput}
          value={manualAmount}
        />
        <TextInput
          onChangeText={setManualMerchant}
          placeholder="Merchant, e.g. Warung Nasi"
          placeholderTextColor={colors.muted}
          style={styles.singleLineInput}
          value={manualMerchant}
        />
        <View style={styles.categoryWrapTight}>
          {MANUAL_METHODS.map((method) => (
            <Pressable
              accessibilityRole="button"
              key={method}
              onPress={() => setManualMethod(method)}
              style={[styles.categoryChip, manualMethod === method && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryChipText, manualMethod === method && styles.categoryChipTextActive]}>
                {method}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.categoryWrapTight}>
          {categories.map((category) => (
            <Pressable
              accessibilityRole="button"
              key={category}
              onPress={() => setManualCategory(category)}
              style={[styles.categoryChip, manualCategory === category && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryChipText, manualCategory === category && styles.categoryChipTextActive]}>
                {category}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable accessibilityRole="button" onPress={submitManualEntry} style={styles.primaryButtonWide}>
          <Ionicons name="add-circle-outline" size={18} color={colors.surface} />
          <Text style={styles.primaryButtonText}>Save manual transaction</Text>
        </Pressable>
      </View>

      <SectionHeader title="Manual capture tester" />
      <View style={styles.inputPanel}>
        <TextInput
          multiline
          onChangeText={onChangeRawNotification}
          placeholder="Paste a finance notification here"
          placeholderTextColor={colors.muted}
          style={styles.textArea}
          value={rawNotification}
        />
        <Pressable accessibilityRole="button" onPress={onParse} style={styles.primaryButtonWide}>
          <Ionicons name="scan-outline" size={18} color={colors.surface} />
          <Text style={styles.primaryButtonText}>Parse into draft</Text>
        </Pressable>
      </View>

      <View style={styles.statusPanel}>
        <Ionicons name="sparkles-outline" size={18} color={colors.greenDark} />
        <Text style={styles.statusText}>{lastParseMessage}</Text>
      </View>

      <SectionHeader title="Samples" />
      {SAMPLE_NOTIFICATIONS.map((sample) => (
        <Pressable
          accessibilityRole="button"
          key={sample}
          onPress={() => onUseSample(sample)}
          style={styles.sampleRow}
        >
          <Text style={styles.sampleText}>{sample}</Text>
          <Ionicons name="chevron-forward-outline" size={18} color={colors.muted} />
        </Pressable>
      ))}
    </View>
  );
}

function SettingsScreen({
  listenerAvailable,
  listenerGranted,
  categories,
  sources,
  syncSettings,
  syncQueueActive,
  unsyncedCount,
  onAddCategory,
  onAddSource,
  onClearLocalData,
  onOpenPermissionSettings,
  onSaveSyncSettings,
  onSyncPending,
  onToggleSource
}: {
  listenerAvailable: boolean;
  listenerGranted: boolean;
  categories: TransactionCategory[];
  sources: FinanceSource[];
  syncSettings: SyncSettings;
  syncQueueActive: boolean;
  unsyncedCount: number;
  onAddCategory: (label: string) => void;
  onAddSource: (label: string) => void;
  onClearLocalData: () => void;
  onOpenPermissionSettings: () => void;
  onSaveSyncSettings: (settings: SyncSettings) => void;
  onSyncPending: () => void;
  onToggleSource: (sourceId: string) => void;
}) {
  const [newSourceLabel, setNewSourceLabel] = useState("");
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [endpointUrl, setEndpointUrl] = useState(syncSettings.endpointUrl);
  const [sheetUrl, setSheetUrl] = useState(syncSettings.sheetUrl);

  useEffect(() => {
    setEndpointUrl(syncSettings.endpointUrl);
    setSheetUrl(syncSettings.sheetUrl);
  }, [syncSettings.endpointUrl, syncSettings.sheetUrl]);

  function submitSource() {
    onAddSource(newSourceLabel);
    setNewSourceLabel("");
  }

  function submitCategory() {
    onAddCategory(newCategoryLabel);
    setNewCategoryLabel("");
  }

  return (
    <View style={styles.screen}>
      <View style={styles.privacyPanel}>
        <Ionicons name="shield-checkmark-outline" size={26} color={colors.greenDark} />
        <View style={styles.privacyTextBlock}>
          <Text style={styles.panelTitle}>Privacy-first by default</Text>
          <Text style={styles.panelCopy}>
            Raw notification text is parsed locally and discarded. OTP, balance, account, token, and verification
            messages are skipped.
          </Text>
        </View>
      </View>

      <SectionHeader title="Notification listener" />
      <View style={styles.settingRow}>
        <View>
          <Text style={styles.settingTitle}>Native listener bridge</Text>
          <Text style={styles.settingCopy}>
            {listenerAvailable ? "Available in this build" : "Needs Android development build"}
          </Text>
        </View>
        <View style={[styles.smallBadge, listenerAvailable && styles.smallBadgeGood]}>
          <Text style={[styles.smallBadgeText, listenerAvailable && styles.smallBadgeTextGood]}>
            {listenerAvailable ? "Ready" : "Expo Go"}
          </Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={onOpenPermissionSettings} style={styles.secondaryButtonWide}>
        <Ionicons name="settings-outline" size={18} color={colors.greenDark} />
        <Text style={styles.secondaryButtonText}>
          {listenerGranted ? "Notification access enabled" : "Open notification access"}
        </Text>
      </Pressable>

      <SectionHeader title="Google Sheets sync" />
      <View style={styles.inputPanel}>
        <View style={styles.syncHealthRow}>
          <View style={styles.syncHealthText}>
            <Text style={styles.settingTitle}>{hasSyncEndpoint(syncSettings) ? "Endpoint connected" : "Endpoint missing"}</Text>
            <Text style={styles.settingCopy}>
              {hasSyncEndpoint(syncSettings)
                ? `${unsyncedCount} confirmed transaction${unsyncedCount === 1 ? "" : "s"} not synced yet.`
                : "Paste a deployed Apps Script /exec URL to enable automatic sync."}
            </Text>
          </View>
          <View style={[styles.smallBadge, hasSyncEndpoint(syncSettings) && styles.smallBadgeGood]}>
            <Text style={[styles.smallBadgeText, hasSyncEndpoint(syncSettings) && styles.smallBadgeTextGood]}>
              {hasSyncEndpoint(syncSettings) ? "Ready" : "Local"}
            </Text>
          </View>
        </View>
        <TextInput
          autoCapitalize="none"
          onChangeText={setEndpointUrl}
          placeholder="Apps Script Web App URL"
          placeholderTextColor={colors.muted}
          style={styles.singleLineInput}
          value={endpointUrl}
        />
        <TextInput
          autoCapitalize="none"
          onChangeText={setSheetUrl}
          placeholder="Google Sheet link"
          placeholderTextColor={colors.muted}
          style={styles.singleLineInput}
          value={sheetUrl}
        />
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onSaveSyncSettings({ endpointUrl, sheetUrl })}
            style={[styles.actionButton, styles.primaryButton]}
          >
            <Ionicons name="save-outline" size={18} color={colors.surface} />
            <Text style={styles.primaryButtonText}>Save</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={syncQueueActive}
            onPress={onSyncPending}
            style={[styles.actionButton, styles.ghostButton, syncQueueActive && styles.disabledButton]}
          >
            <Ionicons name="sync-outline" size={18} color={colors.muted} />
            <Text style={styles.ghostButtonText}>{syncQueueActive ? "Syncing" : `Sync ${unsyncedCount}`}</Text>
          </Pressable>
        </View>
      </View>

      <SectionHeader title="Enabled sources" />
      {sources.map((source) => (
        <View key={source.id} style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>{source.label}</Text>
            <Text style={styles.settingCopy}>Parse expense notifications from this app.</Text>
          </View>
          <Switch
            onValueChange={() => onToggleSource(source.id)}
            thumbColor={colors.surface}
            trackColor={{ false: colors.line, true: colors.green }}
            value={source.enabled}
          />
        </View>
      ))}

      <View style={styles.addSourcePanel}>
        <TextInput
          onChangeText={setNewSourceLabel}
          placeholder="Add source, e.g. Jago"
          placeholderTextColor={colors.muted}
          style={styles.sourceInput}
          value={newSourceLabel}
        />
        <Pressable accessibilityRole="button" onPress={submitSource} style={styles.addSourceButton}>
          <Ionicons name="add-outline" size={20} color={colors.surface} />
        </Pressable>
      </View>

      <SectionHeader title="Categories" />
      <View style={styles.categoryWrap}>
        {categories.map((category) => (
          <View key={category} style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{category}</Text>
          </View>
        ))}
      </View>
      <View style={styles.addSourcePanel}>
        <TextInput
          onChangeText={setNewCategoryLabel}
          placeholder="Add category, e.g. Laundry"
          placeholderTextColor={colors.muted}
          style={styles.sourceInput}
          value={newCategoryLabel}
        />
        <Pressable accessibilityRole="button" onPress={submitCategory} style={styles.addSourceButton}>
          <Ionicons name="add-outline" size={20} color={colors.surface} />
        </Pressable>
      </View>

      <SectionHeader title="Local data" />
      <Pressable accessibilityRole="button" onPress={onClearLocalData} style={styles.dangerButton}>
        <Ionicons name="trash-outline" size={18} color={colors.coral} />
        <Text style={styles.dangerButtonText}>Clear local transactions</Text>
      </Pressable>
    </View>
  );
}

function MetricCard({
  icon,
  label,
  value
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Ionicons name={icon} size={20} color={colors.greenDark} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.metricValue}>
        {value}
      </Text>
    </View>
  );
}

function TransactionRow({ compact = false, transaction }: { compact?: boolean; transaction: TransactionDraft }) {
  return (
    <View style={[styles.transactionRow, compact && styles.transactionRowCompact]}>
      <View style={styles.transactionIcon}>
        <Ionicons name="receipt-outline" size={18} color={colors.greenDark} />
      </View>
      <View style={styles.transactionBody}>
        <Text style={styles.transactionMerchant}>{transaction.merchant}</Text>
        <Text style={styles.transactionMeta}>
          {transaction.category} - {transaction.method} - {transaction.sourceLabel}
        </Text>
      </View>
      <View style={styles.transactionAmountBlock}>
        <Text style={styles.transactionAmount}>{formatRupiah(transaction.amount)}</Text>
        <Text style={styles.confidenceText}>
          {transaction.status === "confirmed" ? syncStatusLabel(transaction) : `${Math.round(transaction.confidence * 100)}%`}
        </Text>
      </View>
    </View>
  );
}

function syncStatusLabel(transaction: TransactionDraft): string {
  if (transaction.syncStatus === "synced") return "Synced";
  if (transaction.syncStatus === "syncing") return "Syncing";
  if (transaction.syncStatus === "failed") return "Failed";
  if (transaction.syncStatus === "not_configured") return "Local";
  return "Pending";
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="leaf-outline" size={22} color={colors.greenDark} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  app: {
    flex: 1
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12
  },
  brandLockup: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: 10
  },
  brandTextBlock: {
    flexShrink: 1
  },
  logoTile: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
    ...shadows.soft
  },
  logoImage: {
    height: 32,
    resizeMode: "contain",
    width: 32
  },
  brand: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.mint,
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  badgeText: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "700"
  },
  tabs: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingBottom: 8
  },
  tab: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    gap: 2,
    minHeight: 56,
    justifyContent: "center"
  },
  tabActive: {
    backgroundColor: colors.surface,
    ...shadows.soft
  },
  tabText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700"
  },
  tabTextActive: {
    color: colors.greenDark
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  screen: {
    gap: 14
  },
  heroPanel: {
    backgroundColor: colors.greenDark,
    borderRadius: 8,
    padding: 20
  },
  kicker: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 31
  },
  heroCopy: {
    color: colors.mint,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  analyticsHeader: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16
  },
  kickerDark: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
    textTransform: "uppercase"
  },
  analyticsTitle: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0
  },
  analyticsIcon: {
    alignItems: "center",
    backgroundColor: colors.mint,
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  chartPanel: {
    alignItems: "flex-end",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    height: 170,
    padding: 12
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
    gap: 8,
    height: "100%"
  },
  barTrack: {
    backgroundColor: colors.faint,
    borderRadius: 8,
    flex: 1,
    justifyContent: "flex-end",
    overflow: "hidden",
    width: "100%"
  },
  barFill: {
    backgroundColor: colors.green,
    borderRadius: 8,
    minHeight: 0,
    width: "100%"
  },
  barLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700"
  },
  categoryPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12
  },
  categoryTotalRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  categoryTotalText: {
    width: 96
  },
  categoryBarOuter: {
    backgroundColor: colors.faint,
    borderRadius: 999,
    flex: 1,
    height: 9,
    overflow: "hidden"
  },
  categoryBarInner: {
    backgroundColor: colors.green,
    borderRadius: 999,
    height: "100%"
  },
  categoryAmount: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
    width: 58
  },
  insightList: {
    gap: 10
  },
  insightCard: {
    alignItems: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12
  },
  insightCalm: {
    backgroundColor: "#eef5f7",
    borderColor: "#d7e6eb"
  },
  insightNotice: {
    backgroundColor: "#fff6df",
    borderColor: "#f1dda6"
  },
  insightGood: {
    backgroundColor: colors.mint,
    borderColor: "#b8e2c4"
  },
  insightText: {
    flex: 1
  },
  insightTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  insightDetail: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3
  },
  syncPanel: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14
  },
  syncPanelText: {
    flex: 1
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  iconButtonDisabled: {
    opacity: 0.55
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 112,
    padding: 14,
    width: "48%"
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8
  },
  metricValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 23,
    marginTop: 4
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 18
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  },
  transactionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  },
  transactionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  transactionRowCompact: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  },
  transactionIcon: {
    alignItems: "center",
    backgroundColor: colors.mint,
    borderRadius: 8,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  transactionBody: {
    flex: 1
  },
  transactionMerchant: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  transactionMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
  },
  transactionAmountBlock: {
    alignItems: "flex-end",
    maxWidth: 120
  },
  transactionAmount: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right"
  },
  confidenceText: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3
  },
  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 14
  },
  categoryWrapTight: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7
  },
  categoryChip: {
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  categoryChipActive: {
    backgroundColor: colors.mint,
    borderColor: colors.green
  },
  categoryChipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  categoryChipTextActive: {
    color: colors.greenDark
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 44
  },
  primaryButton: {
    backgroundColor: colors.green
  },
  primaryButtonWide: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "800"
  },
  ghostButton: {
    backgroundColor: colors.faint
  },
  disabledButton: {
    opacity: 0.55
  },
  ghostButtonText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800"
  },
  inputPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12
  },
  textArea: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: "top"
  },
  singleLineInput: {
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 14,
    minHeight: 46,
    paddingHorizontal: 12
  },
  addSourcePanel: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 10
  },
  sourceInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    minHeight: 42
  },
  addSourceButton: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  statusPanel: {
    alignItems: "center",
    backgroundColor: colors.mint,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    padding: 12
  },
  statusText: {
    color: colors.greenDark,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  },
  sampleRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12
  },
  sampleText: {
    color: colors.ink,
    flex: 1,
    fontSize: 13,
    lineHeight: 19
  },
  privacyPanel: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14
  },
  privacyTextBlock: {
    flex: 1
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  panelCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5
  },
  settingRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    padding: 12
  },
  syncHealthRow: {
    alignItems: "center",
    backgroundColor: colors.faint,
    borderRadius: 8,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 12
  },
  syncHealthText: {
    flex: 1
  },
  settingTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  settingCopy: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
    maxWidth: 230
  },
  smallBadge: {
    backgroundColor: colors.faint,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  smallBadgeGood: {
    backgroundColor: colors.mint
  },
  smallBadgeText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800"
  },
  smallBadgeTextGood: {
    color: colors.greenDark
  },
  secondaryButtonWide: {
    alignItems: "center",
    backgroundColor: colors.mint,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48
  },
  secondaryButtonText: {
    color: colors.greenDark,
    fontSize: 14,
    fontWeight: "800"
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.coral,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48
  },
  dangerButtonText: {
    color: colors.coral,
    fontSize: 14,
    fontWeight: "800"
  }
});
