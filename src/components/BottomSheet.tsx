import React, { memo } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import { useTheme } from "../hooks/useTheme";

type BottomSheetProps = {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  visible: boolean;
};

function BottomSheetComponent({ children, onClose, title, visible }: BottomSheetProps) {
  const { componentStyles, reduceMotion, strings } = useTheme();

  return (
    <Modal
      accessibilityViewIsModal
      animationType={reduceMotion ? "none" : "slide"}
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable
        accessibilityLabel={strings.common.closeSheet}
        accessibilityRole="button"
        onPress={onClose}
        style={componentStyles.sheetBackdrop}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={componentStyles.sheetKeyboard}
        >
          <Pressable onPress={(event) => event.stopPropagation()}>
            <View style={componentStyles.sheetCard}>
              <View style={componentStyles.sheetHandle} />
              <Text accessibilityRole="header" style={componentStyles.sheetTitle}>
                {title}
              </Text>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

export const BottomSheet = memo(BottomSheetComponent);