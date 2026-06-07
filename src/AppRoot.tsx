import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Linking, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppToast, DeleteConfirmDialog } from "./components";
import { BRAND } from "./data/brand";
import { useLayoutInsets } from "./hooks/useLayoutInsets";
import { useTheme } from "./hooks/useTheme";
import { BudgetTabKey, PatternTabKey, SettingsTabKey } from "./features/app.types";
import { hapticSelection } from "./lib/haptics";
import { isAppTabKey, parseDeepLink } from "./navigation/deepLink";
import { AppNavigation, AppTabKey } from "./navigation/appNavigation";
import { getNavStatePreference, setNavStatePreference } from "./services/uiPreferences";
import { BudgetScreen, HomeScreen, MemoryScreen, PatternsScreen, SettingsScreen } from "./screens";
import { initialFinanceState } from "./state/financeReducer";
import { shallowEqual, useActions, useFinanceSelector } from "./state/useFinance";

const SLEV_MARK = require("../assets/brand/slev-mark-transparent.png");

const tabIcons: Record<AppTabKey, keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  memory: "albums-outline",
  budget: "wallet-outline",
  patterns: "analytics-outline",
  settings: "settings-outline"
};

function FinanceInitializer() {
  const actions = useActions();
  useEffect(() => {
    void actions.boot();
  }, [actions]);
  return null;
}

export function AppRoot() {
  const actions = useActions();
  const { colors, isDark, strings, styles } = useTheme();
  const { clearConfirmVisible, isReady, message, undoToast } = useFinanceSelector(
    (state) => ({
      clearConfirmVisible: state.clearConfirmVisible,
      isReady: state.isReady,
      message: state.message,
      undoToast: state.undoToast
    }),
    shallowEqual
  );
  const { scrollContentStyle, tabBarStyle } = useLayoutInsets();
  const [activeTab, setActiveTab] = useState<AppTabKey>("home");
  const [returnTab, setReturnTab] = useState<AppTabKey>("home");
  const [budgetTab, setBudgetTab] = useState<BudgetTabKey>("plan");
  const [patternTab, setPatternTab] = useState<PatternTabKey>("overview");
  const [settingsTab, setSettingsTab] = useState<SettingsTabKey>("bills");
  const [toastMessage, setToastMessage] = useState("");
  const [navHydrated, setNavHydrated] = useState(false);
  const [captureFocusRequest, setCaptureFocusRequest] = useState(0);

  const tabs: { key: AppTabKey; label: string }[] = [
    { key: "home", label: strings.tabs.home },
    { key: "memory", label: strings.tabs.memory },
    { key: "budget", label: strings.tabs.budget },
    { key: "patterns", label: strings.tabs.analysis }
  ];

  const openSettings = useCallback(() => {
    setActiveTab((current) => {
      if (current !== "settings") {
        setReturnTab(current);
      }
      return "settings";
    });
  }, []);
  const closeSettings = () => setActiveTab(returnTab);
  const inSettings = activeTab === "settings";

  const applyDeepLink = useCallback(
    (url: string) => {
      const target = parseDeepLink(url);
      if (!target) {
        return;
      }

      if (target.tab === "settings") {
        if (target.settingsTab) {
          setSettingsTab(target.settingsTab);
        }
        openSettings();
        return;
      }

      if (target.tab === "patterns") {
        setActiveTab("patterns");
        if (target.patternTab) {
          setPatternTab(target.patternTab);
        }
        return;
      }

      setActiveTab(target.tab);
      if (target.tab === "budget" && target.budgetTab) {
        setBudgetTab(target.budgetTab);
      }
    },
    [openSettings]
  );

  const navigation: AppNavigation = {
    openBudgetPlan: () => {
      setBudgetTab("plan");
      setActiveTab("budget");
    },
    openCapture: () => {
      setActiveTab("home");
      setCaptureFocusRequest((current) => current + 1);
    },
    openHome: () => setActiveTab("home"),
    openMemory: () => setActiveTab("memory"),
    openSettings
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      const stored = await getNavStatePreference();
      if (!active || !stored || !isAppTabKey(stored.activeTab) || stored.activeTab === "settings") {
        if (active) {
          setNavHydrated(true);
        }
        return;
      }

      setActiveTab(stored.activeTab);
      setBudgetTab(stored.budgetTab);
      setPatternTab(stored.patternTab);
      setSettingsTab(stored.settingsTab);
      if (active) {
        setNavHydrated(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    void Linking.getInitialURL().then((url) => {
      if (url) {
        applyDeepLink(url);
      }
    });
    const subscription = Linking.addEventListener("url", ({ url }) => applyDeepLink(url));
    return () => subscription.remove();
  }, [applyDeepLink]);

  useEffect(() => {
    if (!isReady || !navHydrated) {
      return;
    }
    void setNavStatePreference({
      activeTab: inSettings ? returnTab : activeTab,
      budgetTab,
      patternTab,
      settingsTab
    });
  }, [activeTab, budgetTab, inSettings, isReady, navHydrated, patternTab, returnTab, settingsTab]);

  useEffect(() => {
    if (!isReady) {
      setToastMessage("");
      return;
    }
    if (!message || message === initialFinanceState.message) {
      setToastMessage("");
      return;
    }
    setToastMessage(message);
    const timer = setTimeout(() => setToastMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [isReady, message]);

  useEffect(() => {
    if (!undoToast) {
      return;
    }

    const timer = setTimeout(() => actions.clearUndoToast(), 6000);
    return () => clearTimeout(timer);
  }, [actions, undoToast]);

  function selectTab(tab: AppTabKey) {
    hapticSelection();
    setActiveTab(tab);
  }

  const visibleToastMessage =
    toastMessage || (undoToast ? strings.toasts.memory.removed : "");

  return (
    <>
      <FinanceInitializer />
      <StatusBar style={isDark ? "light" : "dark"} />
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
                  <Text style={styles.brandLine}>
                    {inSettings ? strings.brand.settings : strings.brand.tagline}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityLabel={inSettings ? strings.common.back : strings.common.openSettings}
                accessibilityRole="button"
                onPress={inSettings ? closeSettings : openSettings}
                style={[styles.iconButton, inSettings && styles.iconButtonActive]}
              >
                <Ionicons
                  name={inSettings ? "chevron-back-outline" : "settings-outline"}
                  size={20}
                  color={inSettings ? colors.greenDark : colors.muted}
                />
              </Pressable>
            </View>
            {visibleToastMessage ? (
              <AppToast
                message={visibleToastMessage}
                onUndo={undoToast ? () => void actions.undoRemoveMoment() : undefined}
                undoLabel={undoToast ? strings.common.undo : undefined}
              />
            ) : null}
          </View>

          <View style={styles.content}>
            {isReady && activeTab === "home" && (
              <HomeScreen
                captureFocusRequest={captureFocusRequest}
                navigation={navigation}
                onOpenSettings={openSettings}
                scrollContentStyle={scrollContentStyle}
              />
            )}
            {isReady && activeTab === "memory" && (
              <MemoryScreen navigation={navigation} scrollContentStyle={scrollContentStyle} />
            )}
            {isReady && activeTab === "budget" && (
              <BudgetScreen
                activeBudgetTab={budgetTab}
                onBudgetTabChange={setBudgetTab}
                onOpenSettings={openSettings}
                scrollContentStyle={scrollContentStyle}
              />
            )}
            {isReady && activeTab === "patterns" && (
              <PatternsScreen
                activePatternTab={patternTab}
                onPatternTabChange={setPatternTab}
                scrollContentStyle={scrollContentStyle}
              />
            )}
            {isReady && activeTab === "settings" && (
              <SettingsScreen
                activeSettingsTab={settingsTab}
                onSettingsTabChange={setSettingsTab}
                scrollContentStyle={scrollContentStyle}
              />
            )}
          </View>

          <View accessibilityRole="tablist" style={tabBarStyle}>
            {tabs.map((tab) => {
              const isActive = !inSettings && activeTab === tab.key;
              return (
                <Pressable
                  accessibilityLabel={tab.label}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  key={tab.key}
                  onPress={() => selectTab(tab.key)}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                >
                  <Ionicons
                    name={tabIcons[tab.key]}
                    size={20}
                    color={isActive ? colors.greenDark : colors.muted}
                  />
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <DeleteConfirmDialog
            body={strings.dialogs.clearAllBody}
            confirmLabel={strings.dialogs.clearAllConfirm}
            onCancel={() => actions.setClearConfirmVisible(false)}
            onConfirm={() => void actions.confirmClearAll()}
            title={strings.dialogs.clearAllTitle}
            visible={clearConfirmVisible}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}