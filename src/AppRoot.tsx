import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DeleteConfirmDialog } from "./components";
import { BRAND } from "./data/brand";
import { useLayoutInsets } from "./hooks/useLayoutInsets";
import { BudgetTabKey } from "./features/app.types";
import { AppNavigation, AppTabKey } from "./navigation/appNavigation";
import { BudgetScreen, HomeScreen, MemoryScreen, PatternsScreen, SettingsScreen } from "./screens";
import { initialFinanceState } from "./state/financeReducer";
import { shallowEqual, useActions, useFinanceSelector } from "./state/useFinance";
import { colors } from "./theme/colors";
import { styles } from "./theme/styles/app";

const SLEV_MARK = require("../assets/brand/slev-mark-transparent.png");

const tabs: { key: AppTabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "home", label: "Home", icon: "home-outline" },
  { key: "memory", label: "Memory", icon: "albums-outline" },
  { key: "budget", label: "Budget", icon: "wallet-outline" },
  { key: "patterns", label: "Analysis", icon: "analytics-outline" }
];

function FinanceInitializer() {
  const actions = useActions();
  useEffect(() => {
    void actions.boot();
  }, [actions]);
  return null;
}

export function AppRoot() {
  const actions = useActions();
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

  return (
    <>
      <FinanceInitializer />
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
                  <Text style={styles.brandLine}>{inSettings ? "Settings" : "Spending memory"}</Text>
                </View>
              </View>
              <Pressable
                accessibilityLabel={inSettings ? "Back" : "Open settings"}
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
                <Text style={styles.bootText}>Preparing local memory...</Text>
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