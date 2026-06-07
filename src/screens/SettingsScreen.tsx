import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleProp, Text, TextInput, View, ViewStyle } from "react-native";
import { DeleteConfirmDialog, EmptyState, ListActionRow, ListActionsOnboardingTip, ScreenHero, SegmentedControl } from "../components";
import { useListActionsHint } from "../hooks/useListActionsHint";
import { ExpenseCategory } from "../features/spendingMemory.types";
import { RecurringBillsPanel } from "../features/settings/RecurringBillsPanel";
import { getCategoryDeleteBody } from "../lib/analysis";
import { listCorruptStorageIssues, StorageHealthIssue } from "../services/storageHealth";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../state/useFinance";
import { useTheme } from "../hooks/useTheme";

type SettingsTabKey = "bills" | "categories" | "data";

type SettingsScreenProps = {
  scrollContentStyle: StyleProp<ViewStyle>;
};

function SettingsScreenComponent({ scrollContentStyle }: SettingsScreenProps) {
  const { colorScheme, colors, locale, setColorScheme, setLocale, strings, styles } = useTheme();
  const actions = useActions();
  const { categoryLabels } = useDerived();
  const { accounts, expenseCategories, isReady, moments, recurringBills } = useFinanceSelector(
    (state) => ({
      accounts: state.accounts,
      expenseCategories: state.expenseCategories,
      isReady: state.isReady,
      moments: state.moments,
      recurringBills: state.recurringBills
    }),
    shallowEqual
  );
  const momentCount = moments.length;

  const [activeTab, setActiveTab] = useState<SettingsTabKey>("bills");
  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>(undefined);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<ExpenseCategory | null>(null);
  const [importDraft, setImportDraft] = useState("");
  const [importConfirmVisible, setImportConfirmVisible] = useState(false);
  const [pendingResetIssue, setPendingResetIssue] = useState<StorageHealthIssue | null>(null);
  const { dismiss: dismissCategoriesHint, visible: showCategoriesHint } = useListActionsHint(
    "settings_categories",
    activeTab === "categories" && expenseCategories.length > 0
  );

  function editCategory(category: ExpenseCategory) {
    setEditingCategoryId(category.id);
    setCategoryDraft(category.label);
  }

  function resetCategoryDraft() {
    setEditingCategoryId(undefined);
    setCategoryDraft("");
  }

  const renderCategoryItem = useCallback(
    ({ item: category, index }: { item: ExpenseCategory; index: number }) => (
      <View
        style={[
          styles.listPanel,
          index > 0 && styles.listPanelContinued,
          index < expenseCategories.length - 1 && styles.listPanelMiddle
        ]}
      >
        <ListActionRow
          accessibilityLabel={category.isDefault ? category.label : `Edit category ${category.label}`}
          onDelete={() => setPendingDeleteCategory(category)}
          onPress={!category.isDefault ? () => editCategory(category) : undefined}
        >
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsRowHeader}>
              <Text style={styles.analyticsTitle}>{category.label}</Text>
              <Text style={styles.analyticsAmount}>{category.isDefault ? "Default" : "Custom"}</Text>
            </View>
          </View>
        </ListActionRow>
      </View>
    ),
    [expenseCategories.length]
  );

  const categoryKeyExtractor = useCallback((category: ExpenseCategory) => category.id, []);

  const listHeader = useMemo(() => {
    const corruptIssues = isReady ? listCorruptStorageIssues() : [];

    return (
      <>
        <ScreenHero
          hint={`${accounts.length} account${accounts.length === 1 ? "" : "s"} · ${recurringBills.length} recurring bill${recurringBills.length === 1 ? "" : "s"}`}
          kicker="Settings"
          value={`${momentCount} memor${momentCount === 1 ? "y" : "ies"}`}
          variant="surface"
        />

        <SegmentedControl
          options={[
            { label: strings.settings.billsTab, value: "bills" },
            { label: strings.settings.categoriesTab, value: "categories" },
            { label: strings.settings.dataTab, value: "data" }
          ]}
          selected={activeTab}
          stretch
          onSelect={setActiveTab}
        />

        {activeTab === "bills" && (
          <RecurringBillsPanel
            accounts={accounts}
            categoryLabels={categoryLabels}
            recurringBills={recurringBills}
            onDeleteBill={(id) => void actions.removeRecurringBill(id)}
            onSaveBill={(input) => void actions.saveRecurringBill(input)}
          />
        )}

        {activeTab === "categories" && (
          <>
            {showCategoriesHint && (
              <ListActionsOnboardingTip
                body={strings.listHints.settings_categories.body}
                onDismiss={dismissCategoriesHint}
                title={strings.listHints.settings_categories.title}
              />
            )}
            <View style={styles.capturePanel}>
              <Text style={styles.microLabel}>{editingCategoryId ? "Edit category" : "Add expense category"}</Text>
              <TextInput
                accessibilityLabel="Category name"
                onChangeText={setCategoryDraft}
                placeholder="e.g. Health, Subscriptions, Hobby"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={categoryDraft}
              />
              <View style={styles.editActions}>
                {editingCategoryId && (
                  <Pressable accessibilityRole="button" onPress={resetCategoryDraft} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </Pressable>
                )}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    void actions.saveCategory({ id: editingCategoryId, label: categoryDraft });
                    resetCategoryDraft();
                  }}
                  style={styles.smallPrimaryButton}
                >
                  <Text style={styles.primaryButtonText}>Save category</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}

        {activeTab === "data" && corruptIssues.length > 0 && (
          <View style={styles.capturePanel}>
            <Text style={styles.microLabel}>Data health</Text>
            <Text style={styles.settingCopy}>Some data looks damaged. Export a backup before resetting.</Text>
            {corruptIssues.map((issue) => (
              <View key={issue.key} style={styles.analyticsRow}>
                <View style={styles.analyticsRowHeader}>
                  <Ionicons name="warning-outline" size={16} color={colors.coral} />
                  <Text style={styles.analyticsTitle}>{issue.label}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPendingResetIssue(issue)}
                  style={styles.textButton}
                >
                  <Ionicons name="refresh-outline" size={16} color={colors.coral} />
                  <Text style={[styles.textButtonLabel, { color: colors.coral }]}>Reset this data</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </>
    );
  }, [
    accounts.length,
    actions,
    activeTab,
    categoryDraft,
    dismissCategoriesHint,
    editingCategoryId,
    expenseCategories.length,
    isReady,
    momentCount,
    recurringBills.length,
    showCategoriesHint,
    strings
  ]);

  const listFooter = useMemo(() => {
    if (activeTab === "data") {
      return (
        <>
          <View style={styles.capturePanel}>
            <Text style={styles.microLabel}>{strings.appearance.label}</Text>
            <SegmentedControl
              options={[
                { label: strings.appearance.light, value: "light" },
                { label: strings.appearance.dark, value: "dark" },
                { label: strings.appearance.system, value: "system" }
              ]}
              selected={colorScheme}
              stretch
              onSelect={setColorScheme}
            />
            <Text style={styles.microLabel}>{strings.locale.label}</Text>
            <SegmentedControl
              options={[
                { label: strings.locale.english, value: "en" },
                { label: strings.locale.indonesian, value: "id" }
              ]}
              selected={locale}
              stretch
              onSelect={setLocale}
            />
          </View>

          <View style={styles.capturePanel}>
            <Text style={styles.microLabel}>Backup</Text>
            <Text style={styles.settingCopy}>Export your data as JSON, or paste a backup to restore.</Text>
            <Pressable accessibilityRole="button" onPress={() => void actions.exportLocalBackup()} style={styles.secondaryInlineButton}>
              <Ionicons name="share-outline" size={16} color={colors.greenDark} />
              <Text style={styles.secondaryButtonText}>Export JSON backup</Text>
            </Pressable>
            <TextInput
              accessibilityLabel="Backup JSON"
              multiline
              onChangeText={setImportDraft}
              placeholder="Paste a Slev backup JSON here"
              placeholderTextColor={colors.muted}
              style={[styles.input, { minHeight: 120, textAlignVertical: "top" }]}
              value={importDraft}
            />
            <Pressable
              accessibilityRole="button"
              disabled={!importDraft.trim()}
              onPress={() => setImportConfirmVisible(true)}
              style={[styles.smallPrimaryButton, !importDraft.trim() ? { opacity: 0.5 } : undefined]}
            >
              <Text style={styles.primaryButtonText}>Import backup</Text>
            </Pressable>
          </View>

          <Pressable accessibilityRole="button" onPress={() => actions.clearAll()} style={styles.dangerButton}>
            <Ionicons name="trash-outline" size={18} color={colors.coral} />
            <Text style={styles.dangerButtonText}>Clear local finance memory</Text>
          </Pressable>
        </>
      );
    }
    return null;
  }, [actions, activeTab, colorScheme, importDraft, locale, setColorScheme, setLocale, strings]);

  const listEmpty = useMemo(() => {
    if (activeTab !== "categories") {
      return null;
    }
    return <EmptyState text="No active categories. Add a category above to start assigning expenses again." />;
  }, [activeTab]);

  return (
    <>
      <FlatList
        contentContainerStyle={scrollContentStyle}
        data={activeTab === "categories" ? expenseCategories : []}
        keyExtractor={categoryKeyExtractor}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        ListHeaderComponent={listHeader}
        renderItem={renderCategoryItem}
      />
      <DeleteConfirmDialog
        body={pendingDeleteCategory ? getCategoryDeleteBody(pendingDeleteCategory) : ""}
        onCancel={() => setPendingDeleteCategory(null)}
        onConfirm={() => {
          if (pendingDeleteCategory) {
            void actions.removeCategory(pendingDeleteCategory);
            if (editingCategoryId === pendingDeleteCategory.id) {
              resetCategoryDraft();
            }
            setPendingDeleteCategory(null);
          }
        }}
        title={pendingDeleteCategory?.isDefault ? "Remove default category?" : "Delete category?"}
        visible={Boolean(pendingDeleteCategory)}
      />
      <DeleteConfirmDialog
        body="Importing replaces your current local finance data with the pasted backup."
        confirmLabel="Import"
        onCancel={() => setImportConfirmVisible(false)}
        onConfirm={() => {
          void actions.importLocalBackup(importDraft);
          setImportDraft("");
          setImportConfirmVisible(false);
        }}
        title="Import backup?"
        visible={importConfirmVisible}
      />
      <DeleteConfirmDialog
        body={
          pendingResetIssue
            ? `This clears only ${pendingResetIssue.label} on this device. Export a backup first if you want to keep a copy.`
            : ""
        }
        confirmLabel="Reset"
        onCancel={() => setPendingResetIssue(null)}
        onConfirm={() => {
          if (pendingResetIssue) {
            void actions.resetDamagedCollection(pendingResetIssue.key);
            setPendingResetIssue(null);
          }
        }}
        title={pendingResetIssue ? `Reset ${pendingResetIssue.label}?` : "Reset data?"}
        visible={Boolean(pendingResetIssue)}
      />
    </>
  );
}

export const SettingsScreen = memo(SettingsScreenComponent);