import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { DeleteConfirmDialog, EmptyState, SwipeActionRow } from "../components";
import { ExpenseCategory } from "../features/spendingMemory.types";
import { RecurringBillsPanel } from "../features/settings/RecurringBillsPanel";
import { getCategoryDeleteBody } from "../lib/analysis";
import { listCorruptStorageIssues, StorageHealthIssue } from "../services/storageHealth";
import { shallowEqual, useActions, useDerived, useFinanceSelector } from "../state/useFinance";
import { colors } from "../theme/colors";
import { styles } from "../theme/styles/app";

function SettingsScreenComponent() {
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

  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>(undefined);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<ExpenseCategory | null>(null);
  const [importDraft, setImportDraft] = useState("");
  const [importConfirmVisible, setImportConfirmVisible] = useState(false);
  const [pendingResetIssue, setPendingResetIssue] = useState<StorageHealthIssue | null>(null);

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
        <SwipeActionRow canDelete onDelete={() => setPendingDeleteCategory(category)}>
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsRowHeader}>
              <Text style={styles.analyticsTitle}>{category.label}</Text>
              <Text style={styles.analyticsAmount}>{category.isDefault ? "Default" : "Custom"}</Text>
            </View>
            {!category.isDefault && (
              <View style={styles.editActions}>
                <Pressable onPress={() => editCategory(category)} style={styles.textButton}>
                  <Ionicons name="create-outline" size={16} color={colors.greenDark} />
                  <Text style={styles.textButtonLabel}>Edit</Text>
                </Pressable>
              </View>
            )}
          </View>
        </SwipeActionRow>
      </View>
    ),
    [expenseCategories.length]
  );

  const categoryKeyExtractor = useCallback((category: ExpenseCategory) => category.id, []);

  const listHeader = useMemo(() => {
    const corruptIssues = isReady ? listCorruptStorageIssues() : [];

    return (
      <>
        <View style={styles.heroPanel}>
          <Text style={styles.kickerDark}>Settings</Text>
          <Text style={styles.settingCopy}>{momentCount} money memor{momentCount === 1 ? "y" : "ies"} saved on this device.</Text>
        </View>

        {corruptIssues.length > 0 && (
          <View style={styles.capturePanel}>
            <Text style={styles.microLabel}>Data health</Text>
            <Text style={styles.settingCopy}>
              These collections look damaged on disk. Export a backup first, then reset only what you need to recover.
            </Text>
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

        <RecurringBillsPanel
          accounts={accounts}
          categoryLabels={categoryLabels}
          recurringBills={recurringBills}
          onDeleteBill={(id) => void actions.removeRecurringBill(id)}
          onSaveBill={(input) => void actions.saveRecurringBill(input)}
        />

        <View style={styles.capturePanel}>
          <Text style={styles.microLabel}>{editingCategoryId ? "Edit category" : "Add expense category"}</Text>
          <TextInput
            onChangeText={setCategoryDraft}
            placeholder="e.g. Health, Subscriptions, Hobby"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={categoryDraft}
          />
          <View style={styles.editActions}>
            {editingCategoryId && (
              <Pressable onPress={resetCategoryDraft} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
            )}
            <Pressable
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
    );
  }, [accounts, actions, categoryDraft, categoryLabels, editingCategoryId, isReady, momentCount, recurringBills]);

  const listFooter = useMemo(
    () => (
      <>
        <View style={styles.capturePanel}>
          <Text style={styles.microLabel}>Backup</Text>
          <Text style={styles.settingCopy}>
            Export all local finance data as JSON, or paste a previous backup to restore it on this device.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void actions.exportLocalBackup()}
            style={styles.secondaryInlineButton}
          >
            <Ionicons name="share-outline" size={16} color={colors.greenDark} />
            <Text style={styles.secondaryButtonText}>Export JSON backup</Text>
          </Pressable>
          <TextInput
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
    ),
    [actions, importDraft]
  );

  const listEmpty = useMemo(
    () => (
      <EmptyState text="No active categories. Add a category above to start assigning expenses again." />
    ),
    []
  );

  return (
    <>
      <FlatList
        contentContainerStyle={styles.scrollContent}
        data={expenseCategories}
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