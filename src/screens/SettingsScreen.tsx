import { Ionicons } from "@expo/vector-icons";
import React, { memo, useMemo, useState } from "react";
import { Pressable, StyleProp, Text, TextInput, View, ViewStyle } from "react-native";
import {
  DeleteConfirmDialog,
  EmptyState,
  ListActionRow,
  ListActionsOnboardingTip,
  ScreenHero,
  ScreenTabBar,
  SegmentedControl,
  StickyTabScreen
} from "../components";
import { useListActionsHint } from "../hooks/useListActionsHint";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { SettingsTabKey } from "../features/app.types";
import { ExpenseCategory } from "../features/spendingMemory.types";
import { RecurringBillsPanel } from "../features/settings/RecurringBillsPanel";
import { formatString, getCategoryDeleteMessage } from "../i18n";
import { hapticSelection, hapticWarning } from "../lib/haptics";
import { FormValidationError } from "../lib/formValidation";
import { ImportFieldError } from "../features/settings/dataValidation";
import { CategoryFieldError } from "../features/settings/settingsValidation";
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
  const {
    capturePanelPreference,
    colorScheme,
    colors,
    componentStyles,
    locale,
    reduceMotionPreference,
    setCapturePanelPreference,
    setColorScheme,
    setLocale,
    setReduceMotionPreference,
    strings,
    styles
  } = useTheme();
  const { refreshControl } = usePullToRefresh();
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
  const [categoryFieldError, setCategoryFieldError] = useState<FormValidationError<CategoryFieldError> | null>(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<ExpenseCategory | null>(null);
  const [importDraft, setImportDraft] = useState("");
  const [importFieldError, setImportFieldError] = useState<FormValidationError<ImportFieldError> | null>(null);
  const [importConfirmVisible, setImportConfirmVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [pendingResetIssue, setPendingResetIssue] = useState<StorageHealthIssue | null>(null);
  const { dismiss: dismissCategoriesHint, visible: showCategoriesHint } = useListActionsHint(
    "settings_categories",
    activeTab === "categories" && expenseCategories.length > 0
  );

  function editCategory(category: ExpenseCategory) {
    hapticSelection();
    setEditingCategoryId(category.id);
    setCategoryDraft(category.label);
    setCategoryFieldError(null);
  }

  function resetCategoryDraft() {
    setEditingCategoryId(undefined);
    setCategoryDraft("");
    setCategoryFieldError(null);
  }

  const corruptIssues = isReady ? listCorruptStorageIssues() : [];

  const tabContent = useMemo(() => {
    if (activeTab === "bills") {
      return (
        <RecurringBillsPanel
          accounts={accounts}
          categoryLabels={categoryLabels}
          recurringBills={recurringBills}
          onDeleteBill={(id) => void actions.removeRecurringBill(id)}
          onSaveBill={(input) => actions.saveRecurringBill(input)}
        />
      );
    }

    if (activeTab === "appearance") {
      return (
        <View style={styles.capturePanel}>
          <Text style={componentStyles.microLabel}>{strings.appearance.label}</Text>
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
          <Text style={componentStyles.microLabel}>{strings.locale.label}</Text>
          <SegmentedControl
            options={[
              { label: strings.locale.english, value: "en" },
              { label: strings.locale.indonesian, value: "id" }
            ]}
            selected={locale}
            stretch
            onSelect={setLocale}
          />
          <Text style={componentStyles.microLabel}>{strings.appearance.capturePanelLabel}</Text>
          <SegmentedControl
            options={[
              { label: strings.appearance.captureExpanded, value: "expanded" },
              { label: strings.appearance.captureCompact, value: "compact" }
            ]}
            selected={capturePanelPreference}
            stretch
            onSelect={setCapturePanelPreference}
          />
          <Text style={componentStyles.microLabel}>{strings.appearance.reduceMotionLabel}</Text>
          <SegmentedControl
            options={[
              { label: strings.appearance.reduceMotionSystem, value: "system" },
              { label: strings.appearance.reduceMotionOn, value: "on" },
              { label: strings.appearance.reduceMotionOff, value: "off" }
            ]}
            selected={reduceMotionPreference}
            stretch
            onSelect={setReduceMotionPreference}
          />
        </View>
      );
    }

    if (activeTab === "categories") {
      return (
        <View style={styles.cardStack}>
          {showCategoriesHint && (
            <ListActionsOnboardingTip
              body={strings.listHints.settings_categories.body}
              onDismiss={dismissCategoriesHint}
              title={strings.listHints.settings_categories.title}
            />
          )}
          <View style={styles.capturePanel}>
            <Text style={componentStyles.microLabel}>
              {editingCategoryId ? strings.settings.categories.edit : strings.settings.categories.add}
            </Text>
            <TextInput
              accessibilityLabel={
                categoryFieldError?.field === "label"
                  ? `${strings.settings.categories.nameA11y}. ${categoryFieldError.message}`
                  : strings.settings.categories.nameA11y
              }
              onChangeText={(value) => {
                setCategoryFieldError((current) => (current?.field === "label" ? null : current));
                setCategoryDraft(value);
              }}
              placeholder={strings.settings.categories.placeholder}
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={categoryDraft}
            />
            {categoryFieldError?.field === "label" && (
              <Text accessibilityLiveRegion="polite" style={componentStyles.fieldErrorText}>
                {categoryFieldError.message}
              </Text>
            )}
            <View style={componentStyles.editActions}>
              {editingCategoryId && (
                <Pressable accessibilityRole="button" onPress={resetCategoryDraft} style={styles.secondaryButton}>
                  <Text style={componentStyles.secondaryButtonText}>{strings.common.cancel}</Text>
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void (async () => {
                    const result = await actions.saveCategory({ id: editingCategoryId, label: categoryDraft });
                    if (!result.ok) {
                      hapticWarning();
                      if (result.validation) {
                        setCategoryFieldError(result.validation);
                      }
                      return;
                    }
                    resetCategoryDraft();
                  })();
                }}
                style={styles.smallPrimaryButton}
              >
                <Text style={styles.primaryButtonText}>{strings.settings.categories.save}</Text>
              </Pressable>
            </View>
          </View>
          {expenseCategories.length === 0 ? (
            <EmptyState text={strings.settings.categories.empty} />
          ) : (
            <View style={styles.listPanel}>
              {expenseCategories.map((category, index) => (
                <View
                  key={category.id}
                  style={[
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
                        <Text style={componentStyles.analyticsTitle}>{category.label}</Text>
                        <Text style={styles.analyticsAmount}>
                          {category.isDefault
                            ? strings.settings.categories.default
                            : strings.settings.categories.custom}
                        </Text>
                      </View>
                    </View>
                  </ListActionRow>
                </View>
              ))}
            </View>
          )}
        </View>
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
    capturePanelPreference,
    categoryDraft,
    categoryFieldError,
    categoryLabels,
    colorScheme,
    colors.coral,
    colors.greenDark,
    colors.muted,
    componentStyles,
    corruptIssues,
    dismissCategoriesHint,
    editingCategoryId,
    expenseCategories,
    importDraft,
    importFieldError,
    locale,
    recurringBills,
    reduceMotionPreference,
    setCapturePanelPreference,
    setColorScheme,
    setLocale,
    setReduceMotionPreference,
    showCategoriesHint,
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
            options={[
              { icon: "receipt-outline", label: strings.settings.billsTab, value: "bills" },
              { icon: "pricetags-outline", label: strings.settings.categoriesTab, value: "categories" },
              { icon: "color-palette-outline", label: strings.settings.appearanceTab, value: "appearance" },
              { icon: "cloud-outline", label: strings.settings.dataTab, value: "data" }
            ]}
            selected={activeTab}
            onSelect={onSettingsTabChange}
          />
        }
      >
        {tabContent}
      </StickyTabScreen>
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