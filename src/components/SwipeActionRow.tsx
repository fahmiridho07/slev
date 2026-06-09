import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Animated, PanResponder, Pressable, Text, View, ViewStyle } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { hapticLight } from "../lib/haptics";
import { releaseSwipeOpen, requestSwipeOpen } from "../lib/swipeRowCoordinator";
import { shouldCaptureSwipeGesture } from "../lib/swipeGesture";
import { SWIPE_DELETE_ACTION_WIDTH } from "../theme/styles/components";

type SwipeActionRowProps = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  canDelete: boolean;
  children: React.ReactNode;
  foregroundStyle?: ViewStyle;
  onDelete: () => void;
  onLongPress?: () => void;
  onPress?: () => void;
  rowKey: string;
};

function SwipeActionRowComponent({
  accessibilityHint,
  accessibilityLabel,
  canDelete,
  children,
  foregroundStyle,
  onDelete,
  onLongPress,
  onPress,
  rowKey
}: SwipeActionRowProps) {
  const { colors, componentStyles, reduceMotion, strings } = useTheme();
  const translateX = useMemo(() => new Animated.Value(0), [rowKey]);
  const isOpenRef = useRef(false);
  const dragStartX = useRef(0);

  const clampOffset = useCallback((value: number) => {
    return Math.max(-SWIPE_DELETE_ACTION_WIDTH, Math.min(0, value));
  }, []);

  const closeRow = useCallback(() => {
    isOpenRef.current = false;
    releaseSwipeOpen(closeRow);
    const toValue = 0;
    if (reduceMotion) {
      translateX.setValue(toValue);
      return;
    }
    Animated.spring(translateX, {
      friction: 8,
      tension: 90,
      toValue,
      useNativeDriver: true
    }).start();
  }, [reduceMotion, translateX]);

  useEffect(() => {
    return () => {
      releaseSwipeOpen(closeRow);
    };
  }, [closeRow]);

  const animateTo = useCallback(
    (isOpen: boolean) => {
      isOpenRef.current = isOpen;
      const toValue = isOpen ? -SWIPE_DELETE_ACTION_WIDTH : 0;
      if (isOpen) {
        requestSwipeOpen(closeRow);
      } else {
        releaseSwipeOpen(closeRow);
      }
      if (reduceMotion) {
        translateX.setValue(toValue);
        return;
      }
      Animated.spring(translateX, {
        friction: 8,
        tension: 90,
        toValue,
        useNativeDriver: true
      }).start();
    },
    [closeRow, reduceMotion, translateX]
  );

  const handleDelete = useCallback(() => {
    hapticLight();
    isOpenRef.current = false;
    releaseSwipeOpen(closeRow);
    translateX.stopAnimation();
    translateX.setValue(0);
    onDelete();
  }, [closeRow, onDelete, translateX]);

  const handleForegroundPress = useCallback(() => {
    if (isOpenRef.current) {
      animateTo(false);
      return;
    }
    onPress?.();
  }, [animateTo, onPress]);

  const handleForegroundLongPress = useCallback(() => {
    if (isOpenRef.current) {
      animateTo(false);
      return;
    }
    onLongPress?.();
  }, [animateTo, onLongPress]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gesture) => {
          if (!canDelete) {
            return false;
          }
          return shouldCaptureSwipeGesture(gesture.dx, gesture.dy, isOpenRef.current);
        },
        onMoveShouldSetPanResponder: (_, gesture) => {
          if (!canDelete) {
            return false;
          }
          return shouldCaptureSwipeGesture(gesture.dx, gesture.dy, isOpenRef.current);
        },
        onPanResponderTerminationRequest: (_, gesture) =>
          !isOpenRef.current && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: () => {
          dragStartX.current = isOpenRef.current ? -SWIPE_DELETE_ACTION_WIDTH : 0;
        },
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(clampOffset(dragStartX.current + gesture.dx));
        },
        onPanResponderRelease: (_, gesture) => {
          const nextPosition = clampOffset(dragStartX.current + gesture.dx);

          let shouldOpen: boolean;
          if (gesture.vx > 0.35) {
            shouldOpen = false;
          } else if (gesture.vx < -0.35) {
            shouldOpen = true;
          } else {
            shouldOpen = nextPosition < -SWIPE_DELETE_ACTION_WIDTH / 2;
          }

          animateTo(shouldOpen);
        },
        onPanResponderTerminate: () => animateTo(isOpenRef.current)
      }),
    [animateTo, canDelete, clampOffset, translateX]
  );

  const foregroundAnimatedStyle = {
    transform: [{ translateX }]
  };

  const hasForegroundAction = Boolean(onPress || onLongPress);
  const foreground = hasForegroundAction ? (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onLongPress={onLongPress ? handleForegroundLongPress : undefined}
      onPress={handleForegroundPress}
      style={[componentStyles.listActionPressable, foregroundStyle]}
    >
      {children}
    </Pressable>
  ) : (
    <View style={foregroundStyle}>{children}</View>
  );

  return (
    <View style={componentStyles.swipeRowShell}>
      {canDelete && (
        <View style={componentStyles.swipeActionBackground}>
          <Pressable
            accessibilityLabel={strings.common.delete}
            accessibilityRole="button"
            onPress={handleDelete}
            style={componentStyles.swipeDeleteButton}
          >
            <Ionicons name="trash-outline" size={18} color={colors.surface} />
            <Text style={componentStyles.swipeDeleteText}>{strings.common.delete}</Text>
          </Pressable>
        </View>
      )}
      <Animated.View
        {...(canDelete ? panResponder.panHandlers : {})}
        style={[componentStyles.swipeForeground, foregroundAnimatedStyle]}
      >
        {foreground}
      </Animated.View>
    </View>
  );
}

export const SwipeActionRow = memo(SwipeActionRowComponent);