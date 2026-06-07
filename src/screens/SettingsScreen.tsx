import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleProp, Text, TextInput, View, ViewStyle } from "react-native";
import {
  DeleteConfirmDialog,
  EmptyState,
  ListActionRow,
  ListActionsOnboardingTip,
  ScreenHero,
  ScreenTabBar,
  SegmentedControl
} from "../components";
import { useListActionsHint } from "../hooks/useListActionsHint";
import { SettingsTabKey } from "../features/app.types";
import { ExpenseCategory } from "../features/spendingMemory.types";
import { RecurringBillsPanel } from "../features/settings/RecurringBillsPanel";
import { formatString, getCategoryDeleteMessage } from "../i18n";
import { listCorruptStorageIssues, StorageHealthIssue } from "../services/storageHealth";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../state/useFinance";
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

  const activeTab = activeSettingsTab;
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
          accessibilityLabel={
            category.isDefault
              ? category.label
              : formatString(strings.settings.categories.editA11y, { label: category.label })
          }
          onDelete={!category.isDefault ? () => setPendingDeleteCategory(category) : undefined}
          onPress={!category.isDefault ? () => editCategory(category) : undefined}
        >
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsRowHeader}>
              <Text style={styles.analyticsTitle}>{category.label}</Text>
              <Text style={styles.analyticsAmount}>
                {category.isDefault ? strings.settings.categories.default : strings.settings.categories.custom}
              </Text>
            </View>
          </View>
        </ListActionRow>
      </View>
    ),
    [expenseCategories.length, strings.settings.categories]
  );

  const categoryKeyExtractor = useCallback((category: ExpenseCategory) => category.id, []);

  const listHeader = useMemo(() => {
    const corruptIssues = isReady ? listCorruptStorageIssues() : [];

    return (
      <>
        <ScreenHero
          hint={formatString(strings.settings.heroHint, {
            accounts: accounts.length,
            bills: recurringBills.length
          })}
          kicker={strings.settings.heroKicker}
          value={formatString(strings.settings.heroValue, { count: momentCount })}
          variant="surface"
        />

        <ScreenTabBar
          options={[
            { icon: "receipt-outline", label: strings.settings.billsTab, value: "bills" },
            { icon: "pricetags-outline", label: strings.settings.categoriesTab, value: "categories" },
            { icon: "cloud-outline", label: strings.settings.dataTab, value: "data" }
          ]}
          selected={activeTab}
          onSelect={onSettingsTabChange}
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
              <Text style={styles.microLabel}>
                {editingCategoryId ? strings.settings.categories.edit : strings.settings.categories.add}
              </Text>
              <TextInput
                accessibilityLabel={strings.settings.categories.nameA11y}
                onChangeText={setCategoryDraft}
                placeholder={strings.settings.categories.placeholder}
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={categoryDraft}
              />
              <View style={styles.editActions}>
                {editingCategoryId && (
                  <Pressable accessibilityRole="button" onPress={resetCategoryDraft} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>{strings.common.cancel}</Text>
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
                  <Text style={styles.primaryButtonText}>{strings.settings.categories.save}</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}

        {activeTab === "data" && corruptIssues.length > 0 && (
          <View style={styles.capturePanel}>
            <Text style={styles.microLabel}>{strings.settings.data.healthTitle}</Text>
            <Text style={styles.settingCopy}>{strings.settings.data.healthCopy}</Text>
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
                  <Text style={[styles.textButtonLabel, { color: colors.coral }]}>
                    {strings.settings.data.resetThis}
                  </Text>
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
            <Text style={styles.microLabel}>{strings.settings.data.backupTitle}</Text>
            <Text style={styles.settingCopy}>{strings.settings.data.backupCopy}</Text>
            <Pressable accessibilityRole="button" onPress={() => void actions.exportLocalBackup()} style={styles.secondaryInlineButton}>
              <Ionicons name="share-outline" size={16} color={colors.greenDark} />
              <Text style={styles.secondaryButtonText}>{strings.settings.data.export}</Text>
            </Pressable>
            <TextInput
              accessibilityLabel={strings.settings.data.importA11y}
              multiline
              onChangeText={setImportDraft}
              placeholder={strings.settings.data.importPlaceholder}
              placeholderTextColor={colors.muted}
              style={[styles.input, { minHeight: 120, textAlignVertical: "top" }]}
              value={importDraft}
            />
            <Pressable
              accessibilityLabel={strings.settings.data.import}
              accessibilityRole="button"
              accessibilityState={{ disabled: !importDraft.trim() }}
              disabled={!importDraft.trim()}
              onPress={() => setImportConfirmVisible(true)}
              style={[styles.smallPrimaryButton, !importDraft.trim() ? { opacity: 0.5 } : undefined]}
            >
              <Text style={styles.primaryButtonText}>{strings.settings.data.import}</Text>
            </Pressable>
          </View>

          <Pressable accessibilityRole="button" onPress={() => actions.clearAll()} style={styles.dangerButton}>
            <Ionicons name="trash-outline" size={18} color={colors.coral} />
            <Text style={styles.dangerButtonText}>{strings.settings.data.clearAll}</Text>
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
    return <EmptyState text={strings.settings.categories.empty} />;
  }, [activeTab, strings.settings.categories.empty]);

  return (
    <>
      <FlatList
        contentContainerStyle={scrollContentStyle}
        data={activeTab === "categories" ? expenseCategories : []}
        keyboardShouldPersistTaps="handled"
        keyExtractor={categoryKeyExtractor}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        ListHeaderComponent={listHeader}
        renderItem={renderCategoryItem}
      />
      <DeleteConfirmDialog
        body={pendingDeleteCategory ? getCategoryDeleteMessage(pendingDeleteCategory) : ""}
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
          void actions.importLocalBackup(importDraft);
          setImportDraft("");
          setImportConfirmVisible(false);
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