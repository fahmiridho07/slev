import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { DeleteConfirmDialog, EmptyState, SwipeActionRow } from "../components";
import { getCategoryDeleteBody } from "../lib/analysis";
import { ExpenseCategory } from "../features/spendingMemory.types";
import { colors } from "../theme/colors";
import { styles } from "../theme/styles/app";

export function SettingsScreen({
  expenseCategories,
  momentCount,
  onDeleteCategory,
  onClear,
  onSaveCategory
}: {
  expenseCategories: ExpenseCategory[];
  momentCount: number;
  onDeleteCategory: (category: ExpenseCategory) => void;
  onClear: () => void;
  onSaveCategory: (input: { id?: string; label: string }) => void;
}) {
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
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
              onSaveCategory({ id: editingCategoryId, label: categoryDraft });
              resetCategoryDraft();
            }}
            style={styles.smallPrimaryButton}
          >
            <Text style={styles.primaryButtonText}>Save category</Text>
          </Pressable>
        </View>
      </View>

      {expenseCategories.length === 0 ? (
        <EmptyState text="No active categories. Add a category above to start assigning expenses again." />
      ) : (
        <View style={styles.listPanel}>
          {expenseCategories.map((category) => (
            <SwipeActionRow
              canDelete
              key={category.id}
              onDelete={() => setPendingDeleteCategory(category)}
            >
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
          ))}
        </View>
      )}

      <Pressable accessibilityRole="button" onPress={onClear} style={styles.dangerButton}>
        <Ionicons name="trash-outline" size={18} color={colors.coral} />
        <Text style={styles.dangerButtonText}>Clear local finance memory</Text>
      </Pressable>
      <DeleteConfirmDialog
        body={pendingDeleteCategory ? getCategoryDeleteBody(pendingDeleteCategory) : ""}
        onCancel={() => setPendingDeleteCategory(null)}
        onConfirm={() => {
          if (pendingDeleteCategory) {
            onDeleteCategory(pendingDeleteCategory);
            if (editingCategoryId === pendingDeleteCategory.id) {
              resetCategoryDraft();
            }
            setPendingDeleteCategory(null);
          }
        }}
        title={pendingDeleteCategory?.isDefault ? "Remove default category?" : "Delete category?"}
        visible={Boolean(pendingDeleteCategory)}
      />
    </ScrollView>
  );
}
