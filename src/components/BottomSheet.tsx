import React, { memo } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";

type BottomSheetProps = {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  visible: boolean;
};

function BottomSheetComponent({ children, onClose, title, visible }: BottomSheetProps) {
  const { componentStyles } = useTheme();

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityLabel="Close sheet" accessibilityRole="button" onPress={onClose} style={componentStyles.sheetBackdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={componentStyles.sheetKeyboard}>
          <Pressable onPress={(event) => event.stopPropagation()}>
            <View style={componentStyles.sheetCard}>
              <View style={componentStyles.sheetHandle} />
              <Text style={componentStyles.sheetTitle}>{title}</Text>
              {children}
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

export const BottomSheet = memo(BottomSheetComponent);