import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DeleteConfirmDialog } from "./components";
import { BRAND } from "./data/brand";
import { useLayoutInsets } from "./hooks/useLayoutInsets";
import { useTheme } from "./hooks/useTheme";
import { BudgetTabKey } from "./features/app.types";
import { hapticSelection } from "./lib/haptics";
import { AppNavigation, AppTabKey } from "./navigation/appNavigation";
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
  const { clearConfirmVisible, isReady, message } = useFinanceSelector(
    (state) => ({
      clearConfirmVisible: state.clearConfirmVisible,
      isReady: state.isReady,
      message: state.message
    }),
    shallowEqual
  );
  const { scrollContentStyle, tabBarStyle } = useLayoutInsets();
  const [activeTab, setActiveTab] = useState<AppTabKey>("home");
  const [returnTab, setReturnTab] = useState<AppTabKey>("home");
  const [budgetTab, setBudgetTab] = useState<BudgetTabKey>("plan");
  const [toastMessage, setToastMessage] = useState("");

  const tabs: { key: AppTabKey; label: string }[] = [
    { key: "home", label: strings.tabs.home },
    { key: "memory", label: strings.tabs.memory },
    { key: "budget", label: strings.tabs.budget },
    { key: "patterns", label: strings.tabs.analysis }
  ];

  const openSettings = () => {
    if (activeTab !== "settings") {
      setReturnTab(activeTab);
    }
    setActiveTab("settings");
  };
  const closeSettings = () => setActiveTab(returnTab);
  const inSettings = activeTab === "settings";

  const navigation: AppNavigation = {
    openBudgetPlan: () => {
      setBudgetTab("plan");
      setActiveTab("budget");
    },
    openHome: () => setActiveTab("home"),
    openMemory: () => setActiveTab("memory"),
    openSettings: () => {
      if (activeTab !== "settings") {
        setReturnTab(activeTab);
      }
      setActiveTab("settings");
    }
  };

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

  function selectTab(tab: AppTabKey) {
    hapticSelection();
    setActiveTab(tab);
  }

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
            {toastMessage ? <Text style={styles.headerMessage}>{toastMessage}</Text> : null}
          </View>

          <View style={styles.content}>
            {!isReady && (
              <View style={styles.bootState}>
                <Text style={styles.bootText}>{strings.boot.preparing}</Text>
              </View>
            )}
            {isReady && activeTab === "home" && (
              <HomeScreen navigation={navigation} onOpenSettings={openSettings} scrollContentStyle={scrollContentStyle} />
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
            {isReady && activeTab === "patterns" && <PatternsScreen scrollContentStyle={scrollContentStyle} />}
            {isReady && activeTab === "settings" && <SettingsScreen scrollContentStyle={scrollContentStyle} />}
          </View>

          <View style={tabBarStyle}>
            {tabs.map((tab) => {
              const isActive = !inSettings && activeTab === tab.key;
              return (
                <Pressable
                  accessibilityLabel={tab.label}
                  accessibilityRole="button"
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
            body="This removes entries, plans, goals, balances, limits, accounts, transfers, and categories from this device."
            confirmLabel="Clear"
            onCancel={() => actions.setClearConfirmVisible(false)}
            onConfirm={() => void actions.confirmClearAll()}
            title="Clear local finance memory?"
            visible={clearConfirmVisible}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}