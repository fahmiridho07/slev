import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  type LayoutChangeEvent,
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

const ANIM_DURATION = 220;

function BottomSheetComponent({ children, onClose, title, visible }: BottomSheetProps) {
  const { componentStyles, reduceMotion, strings } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);

  // Keep the Modal mounted while the exit animation plays.
  const [mounted, setMounted] = useState(visible);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const cardHeightRef = useRef(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const offset = cardHeightRef.current || Dimensions.get("window").height;

    if (reduceMotion) {
      opacity.setValue(visible ? 1 : 0);
      translateY.setValue(0);
      if (!visible) {
        setMounted(false);
      }
      return;
    }

    if (visible) {
      opacity.setValue(0);
      translateY.setValue(offset);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIM_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIM_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: ANIM_DURATION,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: offset,
          duration: ANIM_DURATION,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true
        })
      ]).start(({ finished }) => {
        if (finished) {
          setMounted(false);
        }
      });
    }
  }, [mounted, visible, reduceMotion, opacity, translateY]);

  const handleCardLayout = useCallback((event: LayoutChangeEvent) => {
    cardHeightRef.current = event.nativeEvent.layout.height;
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      accessibilityViewIsModal
      animationType="none"
      onRequestClose={onClose}
      transparent
      visible
    >
      <View style={componentStyles.sheetRoot}>
        <Animated.View style={[componentStyles.sheetBackdrop, { opacity }]}>
          <Pressable
            accessibilityLabel={strings.common.closeSheet}
            accessibilityRole="button"
            onPress={onClose}
            style={componentStyles.sheetBackdropPressable}
          />
        </Animated.View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? bottomInset : 0}
          pointerEvents="box-none"
          style={componentStyles.sheetKeyboard}
        >
          <Animated.View
            onLayout={handleCardLayout}
            style={[
              componentStyles.sheetCard,
              { paddingBottom: bottomInset, transform: [{ translateY }] }
            ]}
          >
            <View style={componentStyles.sheetHandle} />
            <Text accessibilityRole="header" style={componentStyles.sheetTitle}>
              {title}
            </Text>
            {children}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export const BottomSheet = memo(BottomSheetComponent);