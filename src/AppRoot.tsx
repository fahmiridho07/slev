import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppToast, DeleteConfirmDialog, NumberPadInputAccessory } from "./components";
import { BRAND } from "./data/brand";
import { useLayoutInsets } from "./hooks/useLayoutInsets";
import { useTheme } from "./hooks/useTheme";
import { SettingsTabKey } from "./features/app.types";
import { hapticSelection } from "./lib/haptics";
import { normalizeStoredTabKey, parseDeepLink } from "./navigation/deepLink";
import { AppNavigation, AppTabKey } from "./navigation/appNavigation";
import { getNavStatePreference, parseSettingsTab, setNavStatePreference } from "./services/uiPreferences";
import { HomeScreen, MoneyScreen, SettingsScreen } from "./screens";
import { initialFinanceState } from "./state/financeReducer";
import { useActions, useFinanceSelector, shallowEqual } from "./state/useFinance";

const SLEV_MARK = require("../assets/brand/slev-mark-transparent.png");

function tabPaneStyle(visible: boolean): StyleProp<ViewStyle> {
  return visible ? { flex: 1 } : { display: "none" };
}

const tabIcons: Record<Exclude<AppTabKey, "settings">, keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  money: "cash-outline"
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
  const { colors, componentStyles, isDark, strings, styles } = useTheme();
  const { bootError, clearConfirmVisible, isReady, message, undoToast } = useFinanceSelector(
    (state) => ({
      bootError: state.bootError,
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
  const [settingsTab, setSettingsTab] = useState<SettingsTabKey>("accounts");
  const [toastMessage, setToastMessage] = useState("");
  const [navHydrated, setNavHydrated] = useState(false);
  const [captureFocusRequest, setCaptureFocusRequest] = useState(0);

  const tabs = useMemo(
    () => [
      { key: "home" as const, label: strings.tabs.home },
      { key: "money" as const, label: strings.tabs.money }
    ],
    [strings.tabs.home, strings.tabs.money]
  );

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
          setSettingsTab(parseSettingsTab(target.settingsTab));
        }
        openSettings();
        return;
      }

      if (target.tab === "money") {
        setActiveTab("money");
        return;
      }

      setActiveTab(target.tab);
      if (target.tab === "home" && target.openCapture) {
        setCaptureFocusRequest((current) => current + 1);
      }
    },
    [openSettings]
  );

  const navigation: AppNavigation = {
    openCapture: () => {
      setActiveTab("home");
      setCaptureFocusRequest((current) => current + 1);
    },
    openHome: () => setActiveTab("home"),
    openMoney: () => setActiveTab("money"),
    openSettings
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      const stored = await getNavStatePreference();
      const restoredTab = stored ? normalizeStoredTabKey(stored.activeTab) : null;
      if (!active || !stored || !restoredTab || restoredTab === "settings") {
        if (active) {
          setNavHydrated(true);
        }
        return;
      }

      setActiveTab(restoredTab);
      setSettingsTab(parseSettingsTab(stored.settingsTab));
      if (active) {
        setNavHydrated(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => applyDeepLink(url));
    return () => subscription.remove();
  }, [applyDeepLink]);

  useEffect(() => {
    if (!navHydrated || !isReady) {
      return;
    }

    void Linking.getInitialURL().then((url) => {
      if (url) {
        applyDeepLink(url);
      }
    });
  }, [applyDeepLink, isReady, navHydrated]);

  useEffect(() => {
    if (!isReady || !navHydrated) {
      return;
    }
    void setNavStatePreference({
      activeTab: inSettings ? returnTab : activeTab,
      settingsTab
    });
  }, [activeTab, inSettings, isReady, navHydrated, returnTab, settingsTab]);

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

  function selectTab(tab: Exclude<AppTabKey, "settings">) {
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
            {!isReady ? (
              <View style={styles.bootState}>
                <ActivityIndicator color={colors.greenDark} size="large" />
                <Text style={styles.bootStateText}>{strings.boot.loadingFinance}</Text>
              </View>
            ) : bootError ? (
              <View style={styles.bootState}>
                <Text style={styles.bootStateText}>{bootError}</Text>
                <Pressable
                  accessibilityLabel={strings.common.pullToRefresh}
                  accessibilityRole="button"
                  onPress={() => void actions.reloadOrNotify()}
                  style={styles.secondaryButton}
                >
                  <Text style={componentStyles.secondaryButtonText}>{strings.common.pullToRefresh}</Text>
                </Pressable>
              </View>
            ) : null}
            {isReady && !bootError ? (
              <>
                <View style={tabPaneStyle(activeTab === "home")}>
                  <HomeScreen
                    captureFocusRequest={captureFocusRequest}
                    onOpenSettings={openSettings}
                    scrollContentStyle={scrollContentStyle}
                  />
                </View>
                <View style={tabPaneStyle(activeTab === "money")}>
                  <MoneyScreen navigation={navigation} scrollContentStyle={scrollContentStyle} />
                </View>
                <View style={tabPaneStyle(activeTab === "settings")}>
                  <SettingsScreen
                    activeSettingsTab={settingsTab}
                    onSettingsTabChange={setSettingsTab}
                    scrollContentStyle={scrollContentStyle}
                  />
                </View>
              </>
            ) : null}
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
      <NumberPadInputAccessory />
    </>
  );
}