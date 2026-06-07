import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useMemo, useRef } from "react";
import { Animated, PanResponder, Pressable, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { componentStyles, SWIPE_DELETE_ACTION_WIDTH } from "../theme/styles/components";

type SwipeActionRowProps = {
  canDelete: boolean;
  children: React.ReactNode;
  onDelete: () => void;
};

function SwipeActionRowComponent({
  canDelete,
  children,
  onDelete
}: SwipeActionRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpenRef = useRef(false);

  const animateTo = useCallback(
    (isOpen: boolean) => {
      isOpenRef.current = isOpen;
      Animated.spring(translateX, {
        friction: 8,
        tension: 90,
        toValue: isOpen ? -SWIPE_DELETE_ACTION_WIDTH : 0,
        useNativeDriver: true
      }).start();
    },
    [translateX]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          canDelete && gesture.dx < -12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
        onStartShouldSetPanResponder: () => false,
        onPanResponderMove: (_, gesture) => {
          const base = isOpenRef.current ? -SWIPE_DELETE_ACTION_WIDTH : 0;
          const nextPosition = Math.max(
            -SWIPE_DELETE_ACTION_WIDTH,
            Math.min(0, base + gesture.dx)
          );
          translateX.setValue(nextPosition);
        },
        onPanResponderRelease: (_, gesture) => {
          const base = isOpenRef.current ? -SWIPE_DELETE_ACTION_WIDTH : 0;
          const nextPosition = Math.max(
            -SWIPE_DELETE_ACTION_WIDTH,
            Math.min(0, base + gesture.dx)
          );
          const shouldOpen = nextPosition < -SWIPE_DELETE_ACTION_WIDTH / 2 || gesture.vx < -0.35;
          animateTo(shouldOpen);
        },
        onPanResponderTerminate: () => animateTo(isOpenRef.current)
      }),
    [animateTo, canDelete, translateX]
  );

  const foregroundStyle = {
    transform: [{ translateX }]
  };

  return (
    <View style={componentStyles.swipeRowShell}>
      {canDelete && (
        <View style={componentStyles.swipeActionBackground}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              animateTo(false);
              onDelete();
            }}
            style={componentStyles.swipeDeleteButton}
          >
            <Ionicons name="trash-outline" size={18} color={colors.surface} />
            <Text style={componentStyles.swipeDeleteText}>Delete</Text>
          </Pressable>
        </View>
      )}
      <Animated.View
        {...(canDelete ? panResponder.panHandlers : {})}
        style={[componentStyles.swipeForeground, foregroundStyle]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

export const SwipeActionRow = memo(SwipeActionRowComponent);