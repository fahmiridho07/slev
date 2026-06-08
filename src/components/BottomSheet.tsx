import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const cardHeightRef = useRef(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
    }
  }, [visible]);

  // Drive keyboard avoidance from the Keyboard API directly. A transparent
  // Modal on Android does NOT respond to adjustResize, so we lift the card
  // ourselves instead of relying on KeyboardAvoidingView.
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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

  // Lift the card so it always sits above the keyboard. Subtract the bottom
  // safe-area inset because endCoordinates.height already spans to the screen edge.
  const keyboardLift =
    keyboardHeight > 0 ? Math.max(0, keyboardHeight - insets.bottom) : 0;

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
        <View
          pointerEvents="box-none"
          style={[componentStyles.sheetKeyboard, { marginBottom: keyboardLift }]}
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
        </View>
      </View>
    </Modal>
  );
}

export const BottomSheet = memo(BottomSheetComponent);