import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { memo, useCallback, useMemo, useState } from "react";
import { Pressable, StyleProp, Text, TextInput, View, ViewStyle } from "react-native";
import {
  BottomSheet,
  DeleteConfirmDialog,
  ScreenHero,
  ScreenTabBar,
  SegmentedControl,
  StickyTabScreen
} from "../components";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { SettingsTabKey } from "../features/app.types";
import { ExpenseCategory } from "../features/spendingMemory.types";
import { CategoryEditForm } from "../features/settings/CategoryEditForm";
import { CategorySettingsPanel } from "../features/settings/CategorySettingsPanel";
import { BalancePanel } from "../features/budget/BalancePanel";
import { RecurringBillsPanel } from "../features/settings/RecurringBillsPanel";
import { formatString, getCategoryDeleteMessage, getImportErrorToast } from "../i18n";
import { formatAmountInput, parseAmountInput } from "../lib/formatMoney";
import { hapticSelection, hapticWarning } from "../lib/haptics";
import { FormValidationError } from "../lib/formValidation";
import { ImportFieldError } from "../features/settings/dataValidation";
import { listCorruptStorageIssues, StorageHealthIssue } from "../services/storageHealth";
import { shallowEqual, useActions, useFinanceSelector } from "../state/useFinance";
import { useTheme } from "../hooks/useTheme";

type SettingsScreenProps = {
  activeSettingsTab: SettingsTabKey;
  onSettingsTabChange: (tab: SettingsTabKey) => void;
  scrollContentStyle: StyleProp<ViewStyle>;
};

function SettingsScreenComponent({
  activeSettingsTab,
  onSettingsTabChange,
  scrollContentStyle
}: SettingsScreenProps) {
  const {
    colorScheme,
    colors,
    componentStyles,
    locale,
    reduceMotionPreference,
    paydayDayOfMonth,
    spendBuffer,
    setColorScheme,
    setLocale,
    setPaydayDay,
    setSpendBuffer,
    setReduceMotionPreference,
    strings,
    styles
  } = useTheme();
  const { refreshControl } = usePullToRefresh();
  const actions = useActions();
  const { accounts, expenseCategories, isReady, moments, recurringBills, transfers } = useFinanceSelector(
    (state) => ({
      accounts: state.accounts,
      expenseCategories: state.expenseCategories,
      isReady: state.isReady,
      moments: state.moments,
      recurringBills: state.recurringBills,
      transfers: state.transfers
    }),
    shallowEqual
  );
  const momentCount = moments.length;

  const activeTab = activeSettingsTab;
  const settingsTabOptions = useMemo(
    () => [
      { icon: "wallet-outline" as const, label: strings.settings.accountsTab, value: "accounts" as const },
      { icon: "pricetags-outline" as const, label: strings.settings.categoriesTab, value: "categories" as const },
      { icon: "receipt-outline" as const, label: strings.settings.billsTab, value: "bills" as const },
      { icon: "color-palette-outline" as const, label: strings.settings.appearanceTab, value: "appearance" as const },
      { icon: "cloud-outline" as const, label: strings.settings.dataTab, value: "data" as const }
    ],
    [
      strings.settings.accountsTab,
      strings.settings.appearanceTab,
      strings.settings.billsTab,
      strings.settings.categoriesTab,
      strings.settings.dataTab
    ]
  );
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<ExpenseCategory | null>(null);
  const [importDraft, setImportDraft] = useState("");
  const [importFieldError, setImportFieldError] = useState<FormValidationError<ImportFieldError> | null>(null);
  const [importConfirmVisible, setImportConfirmVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [pendingResetIssue, setPendingResetIssue] = useState<StorageHealthIssue | null>(null);
  function editCategory(category: ExpenseCategory) {
    hapticSelection();
    setEditingCategory(category);
  }



  const pickImportFile = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: ["application/json", "text/json", "text/plain"]
    });
    if (result.canceled || result.assets.length === 0) {
      return;
    }

    try {
      const response = await fetch(result.assets[0].uri);
      const text = await response.text();
      setImportFieldError((current) => (current?.field === "importJson" ? null : current));
      setImportDraft(text);
    } catch {
      hapticWarning();
      actions.setMessage(getImportErrorToast("invalid_backup"));
    }
  }, [actions]);

  const corruptIssues = isReady ? listCorruptStorageIssues() : [];

  const tabContent = useMemo(() => {
    if (activeTab === "accounts") {
      return (
        <BalancePanel
          accounts={accounts}
          moments={moments}
          transfers={transfers}
          onDeleteAccount={(id) => void actions.removeAccount(id)}
          onSaveAccount={(input) => actions.saveAccount(input)}
        />
      );
    }

    if (activeTab === "bills") {
      return (
        <View style={styles.cardStack}>
          <View style={styles.capturePanel}>
            <Text style={componentStyles.microLabel}>{strings.settings.payday.label}</Text>
            <Text style={styles.settingCopy}>{strings.settings.payday.helper}</Text>
            <TextInput
              accessibilityLabel={strings.settings.payday.a11y}
              keyboardType="number-pad"
              maxLength={2}
              onChangeText={(text) => {
                const digits = text.replace(/[^0-9]/g, "");
                if (digits.length === 0) {
                  setPaydayDay(null);
                  return;
                }
                const next = Math.min(31, Math.max(1, parseInt(digits, 10)));
                setPaydayDay(next);
              }}
              placeholder={strings.settings.payday.placeholder}
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={paydayDayOfMonth != null ? String(paydayDayOfMonth) : ""}
            />
          </View>
          <View style={styles.capturePanel}>
            <Text style={componentStyles.microLabel}>{strings.settings.buffer.label}</Text>
            <Text style={styles.settingCopy}>{strings.settings.buffer.helper}</Text>
            <TextInput
              accessibilityLabel={strings.settings.buffer.a11y}
              keyboardType="number-pad"
              onChangeText={(text) => {
                const parsed = parseAmountInput(formatAmountInput(text));
                setSpendBuffer(parsed ?? 0);
              }}
              placeholder={strings.settings.buffer.placeholder}
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={spendBuffer > 0 ? formatAmountInput(String(spendBuffer)) : ""}
            />
          </View>
          <RecurringBillsPanel
            recurringBills={recurringBills}
            onDeleteBill={(id) => void actions.removeRecurringBill(id)}
            onSaveBill={(input) => actions.saveRecurringBill(input)}
          />
        </View>
      );
    }

    if (activeTab === "appearance") {
      return (
        <View style={styles.cardStack}>
          <View style={styles.capturePanel}>
            <Text style={componentStyles.microLabel}>{strings.appearance.label}</Text>
            <SegmentedControl
              options={[
                { label: strings.appearance.light, value: "light" },
                { label: strings.appearance.dark, value: "dark" },
                { label: strings.appearance.system, value: "system" }
              ]}
              selected={colorScheme}
              onSelect={setColorScheme}
            />
          </View>
          <View style={styles.capturePanel}>
            <Text style={componentStyles.microLabel}>{strings.locale.label}</Text>
            <SegmentedControl
              options={[
                { label: strings.locale.english, value: "en" },
                { label: strings.locale.indonesian, value: "id" }
              ]}
              selected={locale}
              onSelect={setLocale}
            />
          </View>
          <View style={styles.capturePanel}>
            <Text style={componentStyles.microLabel}>{strings.appearance.reduceMotionLabel}</Text>
            <SegmentedControl
              options={[
                { label: strings.appearance.reduceMotionSystem, value: "system" },
                { label: strings.appearance.reduceMotionOn, value: "on" },
                { label: strings.appearance.reduceMotionOff, value: "off" }
              ]}
              selected={reduceMotionPreference}
              onSelect={setReduceMotionPreference}
            />
          </View>
        </View>
      );
    }

    if (activeTab === "categories") {
      return (
        <CategorySettingsPanel
          accounts={accounts}
          categories={expenseCategories}
          onDelete={setPendingDeleteCategory}
          onEdit={editCategory}
          onSaveCategory={actions.saveCategory}
        />
      );
    }

    return (
      <View style={styles.cardStack}>
        {corruptIssues.length > 0 && (
          <View style={styles.capturePanel}>
            <Text style={componentStyles.microLabel}>{strings.settings.data.healthTitle}</Text>
            <Text style={styles.settingCopy}>{strings.settings.data.healthCopy}</Text>
            {corruptIssues.map((issue) => (
              <View key={issue.key} style={styles.analyticsRow}>
                <View style={styles.analyticsRowHeader}>
                  <Ionicons name="warning-outline" size={16} color={colors.coral} />
                  <Text style={componentStyles.analyticsTitle}>{issue.label}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPendingResetIssue(issue)}
                  style={componentStyles.textButton}
                >
                  <Ionicons name="refresh-outline" size={16} color={colors.coral} />
                  <Text style={[componentStyles.textButtonLabel, { color: colors.coral }]}>
                    {strings.settings.data.resetThis}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
        <View style={styles.capturePanel}>
          <Text style={componentStyles.microLabel}>{strings.settings.data.backupTitle}</Text>
          <Text style={styles.settingCopy}>{strings.settings.data.backupCopy}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void actions.exportLocalBackup()}
            style={styles.secondaryInlineButton}
          >
            <Ionicons name="share-outline" size={16} color={colors.greenDark} />
            <Text style={componentStyles.secondaryButtonText}>{strings.settings.data.export}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => void pickImportFile()}
            style={styles.secondaryInlineButton}
          >
            <Ionicons name="document-outline" size={16} color={colors.greenDark} />
            <Text style={componentStyles.secondaryButtonText}>{strings.settings.data.importChooseFile}</Text>
          </Pressable>
          <TextInput
            accessibilityLabel={
              importFieldError?.field === "importJson"
                ? `${strings.settings.data.importA11y}. ${importFieldError.message}`
                : strings.settings.data.importA11y
            }
            multiline
            onChangeText={(value) => {
              setImportFieldError((current) => (current?.field === "importJson" ? null : current));
              setImportDraft(value);
            }}
            placeholder={strings.settings.data.importPlaceholder}
            placeholderTextColor={colors.muted}
            style={[styles.input, { minHeight: 120, textAlignVertical: "top" }]}
            value={importDraft}
          />
          {importFieldError?.field === "importJson" && (
            <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
              {importFieldError.message}
            </Text>
          )}
          <Pressable
            accessibilityLabel={strings.settings.data.import}
            accessibilityRole="button"
            accessibilityState={{ disabled: !importDraft.trim() || importing }}
            disabled={!importDraft.trim() || importing}
            onPress={() => setImportConfirmVisible(true)}
            style={[styles.smallPrimaryButton, !importDraft.trim() || importing ? { opacity: 0.5 } : undefined]}
          >
            <Text style={styles.primaryButtonText}>{strings.settings.data.import}</Text>
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" onPress={() => actions.clearAll()} style={styles.dangerButton}>
          <Ionicons name="trash-outline" size={18} color={colors.coral} />
          <Text style={styles.dangerButtonText}>{strings.settings.data.clearAll}</Text>
        </Pressable>
      </View>
    );
  }, [
    accounts,
    actions,
    activeTab,
    moments,
    transfers,
    accounts,
    actions.saveCategory,
    colorScheme,
    colors.coral,
    colors.greenDark,
    colors.muted,
    componentStyles,
    corruptIssues,
    editingCategory,
    expenseCategories,
    importDraft,
    importFieldError,
    pickImportFile,
    locale,
    paydayDayOfMonth,
    recurringBills,
    reduceMotionPreference,
    setColorScheme,
    setLocale,
    setPaydayDay,
    setSpendBuffer,
    spendBuffer,
    setReduceMotionPreference,
    strings,
    styles
  ]);

  return (
    <>
      <StickyTabScreen
        hero={
          <ScreenHero
            hint={formatString(strings.settings.heroHint, {
              accounts: accounts.length,
              bills: recurringBills.length
            })}
            kicker={strings.settings.heroKicker}
            value={formatString(strings.settings.heroValue, { count: momentCount })}
            variant="surface"
          />
        }
        refreshControl={refreshControl}
        scrollContentStyle={scrollContentStyle}
        tabBar={
          <ScreenTabBar
            layout="wrap"
            options={settingsTabOptions}
            selected={activeTab}
            onSelect={onSettingsTabChange}
          />
        }
      >
        {tabContent}
      </StickyTabScreen>
      <BottomSheet
        onClose={() => setEditingCategory(null)}
        title={
          editingCategory
            ? formatString(strings.settings.categories.editA11y, { label: editingCategory.label })
            : strings.settings.categories.edit
        }
        visible={Boolean(editingCategory)}
      >
        {editingCategory ? (
          <CategoryEditForm
            key={editingCategory.id}
            category={editingCategory}
            onCancel={() => setEditingCategory(null)}
            onSaved={() => setEditingCategory(null)}
          />
        ) : null}
      </BottomSheet>
      <DeleteConfirmDialog
        body={pendingDeleteCategory ? getCategoryDeleteMessage(pendingDeleteCategory) : ""}
        onCancel={() => setPendingDeleteCategory(null)}
        onConfirm={() => {
          if (pendingDeleteCategory) {
            void actions.removeCategory(pendingDeleteCategory);
            if (editingCategory?.id === pendingDeleteCategory.id) {
              setEditingCategory(null);
            }
            setPendingDeleteCategory(null);
          }
        }}
        title={
          pendingDeleteCategory?.isDefault
            ? strings.dialogs.categoryDeleteDefaultTitle
            : strings.dialogs.categoryDeleteTitle
        }
        visible={Boolean(pendingDeleteCategory)}
      />
      <DeleteConfirmDialog
        body={strings.settings.importBody}
        confirmLabel={strings.settings.importConfirm}
        onCancel={() => setImportConfirmVisible(false)}
        onConfirm={() => {
          void (async () => {
            setImporting(true);
            try {
              const result = await actions.importLocalBackup(importDraft);
              setImportConfirmVisible(false);
              if (!result.ok) {
                hapticWarning();
                if (result.validation) {
                  setImportFieldError(result.validation);
                }
                return;
              }
              setImportFieldError(null);
              setImportDraft("");
            } finally {
              setImporting(false);
            }
          })();
        }}
        title={strings.settings.importTitle}
        visible={importConfirmVisible}
      />
      <DeleteConfirmDialog
        body={
          pendingResetIssue
            ? formatString(strings.settings.data.resetBody, { label: pendingResetIssue.label })
            : ""
        }
        confirmLabel={strings.settings.data.resetConfirm}
        onCancel={() => setPendingResetIssue(null)}
        onConfirm={() => {
          if (pendingResetIssue) {
            void actions.resetDamagedCollection(pendingResetIssue.key);
            setPendingResetIssue(null);
          }
        }}
        title={
          pendingResetIssue
            ? formatString(strings.settings.data.resetTitle, { label: pendingResetIssue.label })
            : strings.settings.data.resetTitleFallback
        }
        visible={Boolean(pendingResetIssue)}
      />
    </>
  );
}

export const SettingsScreen = memo(SettingsScreenComponent);