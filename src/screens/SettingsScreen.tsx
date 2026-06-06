import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { DeleteConfirmDialog, EmptyState, SwipeActionRow } from "../components";
import { ExpenseCategory } from "../features/spendingMemory.types";
import { getCategoryDeleteBody } from "../lib/analysis";
import { useFinance } from "../state/useFinance";
import { colors } from "../theme/colors";
import { styles } from "../theme/styles/app";

function SettingsScreenComponent() {
  const { actions, state } = useFinance();
  const { expenseCategories, moments } = state;
  const momentCount = moments.length;

  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>(undefined);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<ExpenseCategory | null>(null);

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

  const listHeader = useMemo(
    () => (
      <>
        <View style={styles.heroPanel}>
          <Text style={styles.kickerDark}>Settings</Text>
          <Text style={styles.heroTitle}>Categories and local data.</Text>
          <Text style={styles.settingCopy}>{momentCount} money memor{momentCount === 1 ? "y" : "ies"} saved on this device.</Text>
        </View>

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
    ),
    [actions, categoryDraft, editingCategoryId, momentCount]
  );

  const listFooter = useMemo(
    () => (
      <Pressable accessibilityRole="button" onPress={() => actions.clearAll()} style={styles.dangerButton}>
        <Ionicons name="trash-outline" size={18} color={colors.coral} />
        <Text style={styles.dangerButtonText}>Clear local finance memory</Text>
      </Pressable>
    ),
    [actions]
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
    </>
  );
}

export const SettingsScreen = memo(SettingsScreenComponent);