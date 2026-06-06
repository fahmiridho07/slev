import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DeleteConfirmDialog } from "./components";
import { BRAND } from "./data/brand";
import { BudgetScreen, HomeScreen, MemoryScreen, PatternsScreen, SettingsScreen } from "./screens";
import { useActions, useFinanceState } from "./state/useFinance";
import { colors } from "./theme/colors";
import { styles } from "./theme/styles/app";

const SLEV_MARK = require("../assets/brand/slev-mark-transparent.png");

type TabKey = "home" | "memory" | "budget" | "patterns" | "settings";

const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
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
  const state = useFinanceState();
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const openSettings = () => setActiveTab("settings");

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
                  <Text style={styles.brandLine}>Spending memory</Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={openSettings}
                style={[styles.iconButton, activeTab === "settings" && styles.iconButtonActive]}
              >
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={activeTab === "settings" ? colors.greenDark : colors.muted}
                />
              </Pressable>
            </View>
            <Text style={styles.headerMessage}>{state.message}</Text>
          </View>

          <View style={styles.content}>
            {!state.isReady && (
              <View style={styles.bootState}>
                <Text style={styles.bootText}>Preparing local memory...</Text>
              </View>
            )}
            {state.isReady && activeTab === "home" && <HomeScreen onOpenSettings={openSettings} />}
            {state.isReady && activeTab === "memory" && <MemoryScreen />}
            {state.isReady && activeTab === "budget" && <BudgetScreen onOpenSettings={openSettings} />}
            {state.isReady && activeTab === "patterns" && <PatternsScreen />}
            {state.isReady && activeTab === "settings" && <SettingsScreen />}
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
            onCancel={() => actions.setClearConfirmVisible(false)}
            onConfirm={() => void actions.confirmClearAll()}
            title="Clear local finance memory?"
            visible={state.clearConfirmVisible}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}