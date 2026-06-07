import React, { memo } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../hooks/useTheme";

type BottomSheetProps = {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  visible: boolean;
};

function BottomSheetComponent({ children, onClose, title, visible }: BottomSheetProps) {
  const { componentStyles, reduceMotion, strings } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <Modal
      accessibilityViewIsModal
      animationType={reduceMotion ? "none" : "slide"}
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={componentStyles.sheetBackdrop}>
        <Pressable
          accessibilityLabel={strings.common.closeSheet}
          accessibilityRole="button"
          onPress={onClose}
          style={componentStyles.sheetBackdropPressable}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? bottomInset : 0}
          style={componentStyles.sheetKeyboard}
        >
          <View style={[componentStyles.sheetCard, { paddingBottom: bottomInset }]}>
            <View style={componentStyles.sheetHandle} />
            <Text accessibilityRole="header" style={componentStyles.sheetTitle}>
              {title}
            </Text>
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export const BottomSheet = memo(BottomSheetComponent);