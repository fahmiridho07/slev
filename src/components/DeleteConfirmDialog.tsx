import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { componentStyles } from "../theme/styles/components";

type DeleteConfirmDialogProps = {
  body: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  visible: boolean;
};

function DeleteConfirmDialogComponent({
  body,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
  title,
  visible
}: DeleteConfirmDialogProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={visible}
    >
      <View style={componentStyles.confirmBackdrop}>
        <View style={componentStyles.confirmCard}>
          <View style={componentStyles.confirmIcon}>
            <Ionicons name="trash-outline" size={22} color={colors.coral} />
          </View>
          <Text style={componentStyles.confirmTitle}>{title}</Text>
          <Text style={componentStyles.confirmBody}>{body}</Text>
          <View style={componentStyles.confirmActions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={componentStyles.confirmCancelButton}>
              <Text style={componentStyles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onConfirm} style={componentStyles.confirmDeleteButton}>
              <Text style={componentStyles.confirmDeleteText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const DeleteConfirmDialog = memo(DeleteConfirmDialogComponent);