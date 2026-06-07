import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { hapticWarning } from "../lib/haptics";

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
  confirmLabel,
  onCancel,
  onConfirm,
  title,
  visible
}: DeleteConfirmDialogProps) {
  const { colors, componentStyles, strings } = useTheme();
  const resolvedConfirmLabel = confirmLabel ?? strings.common.delete;

  function handleConfirm() {
    hapticWarning();
    onConfirm();
  }

  return (
    <Modal
      accessibilityViewIsModal
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
            <Pressable
              accessibilityLabel={strings.common.cancel}
              accessibilityRole="button"
              onPress={onCancel}
              style={componentStyles.confirmCancelButton}
            >
              <Text style={componentStyles.secondaryButtonText}>{strings.common.cancel}</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={resolvedConfirmLabel}
              accessibilityRole="button"
              onPress={handleConfirm}
              style={componentStyles.confirmDeleteButton}
            >
              <Text style={componentStyles.confirmDeleteText}>{resolvedConfirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const DeleteConfirmDialog = memo(DeleteConfirmDialogComponent);