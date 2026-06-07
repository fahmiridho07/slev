import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";

type AppToastProps = {
  message: string;
  onUndo?: () => void;
  undoLabel?: string;
};

function AppToastComponent({ message, onUndo, undoLabel }: AppToastProps) {
  const { colors, styles } = useTheme();

  return (
    <View style={styles.toastRow}>
      <Text accessibilityLiveRegion="polite" style={[styles.headerMessage, styles.toastMessage]}>
        {message}
      </Text>
      {onUndo && undoLabel ? (
        <Pressable
          accessibilityLabel={undoLabel}
          accessibilityRole="button"
          onPress={onUndo}
          style={styles.toastUndoButton}
        >
          <Text style={[styles.toastUndoText, { color: colors.greenDark }]}>{undoLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const AppToast = memo(AppToastComponent);